// ProgressContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../db/db';
import { collection, doc, onSnapshot, writeBatch, getDocs } from 'firebase/firestore';

import AsyncStorage from '@react-native-async-storage/async-storage';

type Module = {
  id: number;
  title: string;
  description: string;
  unlocked: boolean;
  completed: boolean;
  concepts: Concept[];
};

type Concept = {
  id: number;
  name: string;
  progress: number;
  unlocked: boolean;
  completed: boolean;
};

type ProgressContextType = {
  modules: Module[];
  loading: boolean;
  updateConceptProgress: (conceptId: number, amount: number) => Promise<void>;
  toggleModuleExpansion: (id: number) => void;
  expandedModule: number | null;
  refreshProgress: () => Promise<void>;
};

const ProgressContext = createContext<ProgressContextType>({} as ProgressContextType);

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [modules, setModules] = useState<Module[]>([]);
  const [expandedModule, setExpandedModule] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(auth.currentUser);

  useEffect(() => {
    const authUnsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
      if (!user) {
        setModules([]);
        setLoading(false);
      }
    });

    return () => authUnsubscribe();
  }, []);

  useEffect(() => {
    let unsubscribe: () => void;

    const loadProgress = async () => {
      if (!currentUser?.uid) {
        setLoading(false);
        return;
      }

      setLoading(true);
      
      try {
        const modulesRef = collection(db, 'users', currentUser.uid, 'modules');
        
        unsubscribe = onSnapshot(modulesRef, (snapshot) => {
          const modulesData: Module[] = [];
          snapshot.forEach((doc) => {
            modulesData.push(doc.data() as Module);
          });
          setModules(modulesData.sort((a, b) => a.id - b.id));
          setLoading(false);
        });

        // Sincronizar con AsyncStorage
        await AsyncStorage.setItem('userData', JSON.stringify({
          uid: currentUser.uid,
          email: currentUser.email
        }));

      } catch (error) {
        console.error('Error loading progress:', error);
        setLoading(false);
      }
    };

    loadProgress();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentUser?.uid]);

  const updateConceptProgress = async (conceptId: number, amount: number) => {
    if (!currentUser?.uid) return;

    const batch = writeBatch(db);
    let shouldUpdate = false;

    const updatedModules = modules.map(module => {
      const conceptIndex = module.concepts.findIndex(c => c.id === conceptId);
      if (conceptIndex === -1) return module;

      const updatedConcepts = [...module.concepts];
      const concept = updatedConcepts[conceptIndex];
      
      if (!concept.unlocked || concept.completed) return module;

      // Actualizar progreso
      const newProgress = Math.min(concept.progress + amount, 100);
      const completed = newProgress === 100;
      
      updatedConcepts[conceptIndex] = {
        ...concept,
        progress: newProgress,
        completed
      };

      // Desbloquear siguiente concepto
      if (completed && conceptIndex < updatedConcepts.length - 1) {
        updatedConcepts[conceptIndex + 1].unlocked = true;
      }

      // Actualizar módulo
      const moduleRef = doc(db, 'users', currentUser.uid, 'modules', module.id.toString());
      batch.update(moduleRef, {
        concepts: updatedConcepts,
        completed: updatedConcepts.every(c => c.completed)
      });

      if (updatedConcepts.every(c => c.completed)) {
        const nextModule = modules.find(m => m.id === module.id + 1);
        if (nextModule) {
          const nextModuleRef = doc(db, 'users', currentUser.uid, 'modules', nextModule.id.toString());
          batch.update(nextModuleRef, {
            unlocked: true,
            concepts: nextModule.concepts.map((c, i) => 
              i === 0 ? { ...c, unlocked: true } : c
            )
          });
        }
      }

      shouldUpdate = true;
      return { ...module, concepts: updatedConcepts };
    });

    if (shouldUpdate) {
      try {
        await batch.commit();
        setModules(updatedModules);
      } catch (error) {
        console.error('Error updating progress:', error);
      }
    }
  };

  const toggleModuleExpansion = (id: number) => {
    setExpandedModule(prev => (prev === id ? null : id));
  };

  const refreshProgress = async () => {
    if (!currentUser?.uid) return;
    
    try {
      const modulesRef = collection(db, 'users', currentUser.uid, 'modules');
      const snapshot = await getDocs(modulesRef);
      const modulesData: Module[] = [];
      snapshot.forEach(doc => modulesData.push(doc.data() as Module));
      setModules(modulesData.sort((a, b) => a.id - b.id));
    } catch (error) {
      console.error('Error refreshing progress:', error);
    }
  };

  return (
    <ProgressContext.Provider
      value={{
        modules,
        loading,
        updateConceptProgress,
        toggleModuleExpansion,
        expandedModule,
        refreshProgress
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};