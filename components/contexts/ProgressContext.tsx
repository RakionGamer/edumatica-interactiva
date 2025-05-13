// ProgressContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  unlocked: boolean;
  completed: boolean;
  progress: number;
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

  const firestoreUnsubscribeRef = React.useRef<(() => void) | null>(null);
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
    if (firestoreUnsubscribeRef.current) {
      firestoreUnsubscribeRef.current();
      firestoreUnsubscribeRef.current = null;
    }

    const loadProgress = async () => {
      if (!currentUser?.uid) {
        setLoading(false);
        return;
      }

      setLoading(true);
      
      try {
        await AsyncStorage.setItem('userData', JSON.stringify({
          uid: currentUser.uid,
          email: currentUser.email
        }));


        const modulesRef = collection(db, 'users', currentUser.uid, 'modules');

        const unsubscribe = onSnapshot(modulesRef, (snapshot) => {
          const modulesData: Module[] = [];
          snapshot.forEach((doc) => {
            modulesData.push(doc.data() as Module);
          });
          
          setModules(modulesData.sort((a, b) => a.id - b.id));
          setLoading(false);
        },
        (error) => {
          console.error("Error en snapshot:", error); 
          setLoading(false);
        }
      );
      firestoreUnsubscribeRef.current = unsubscribe;

      } catch (error) {
        console.error('Error loading progress:', error);
        setLoading(false);
      }
    };

    loadProgress();

    return () => {
    if (firestoreUnsubscribeRef.current) {
      firestoreUnsubscribeRef.current(); // 
    }
  };
  }, [currentUser?.uid]);

  const updateConceptProgress = useCallback(async (conceptId: number, amount: number) => {
    if (!currentUser?.uid) return;

    const moduleIndex = modules.findIndex(module => 
      module.concepts.some(c => c.id === conceptId)
    );
    
    if (moduleIndex === -1) return;
    
    const module = modules[moduleIndex];
    const conceptIndex = module.concepts.findIndex(c => c.id === conceptId);
    
    if (conceptIndex === -1 || !module.concepts[conceptIndex].unlocked || 
        module.concepts[conceptIndex].completed) {
      return;
    }

    const updatedModule = { ...module };
    const updatedConcepts = [...module.concepts];
    
    const concept = updatedConcepts[conceptIndex];
    const newProgress = Math.min(concept.progress + amount, 100);
    const completed = newProgress === 100;
    
    updatedConcepts[conceptIndex] = {
      ...concept,
      progress: newProgress,
      completed
    };

    if (completed && conceptIndex < updatedConcepts.length - 1) {
      updatedConcepts[conceptIndex + 1].unlocked = true;
    }

    const isModuleCompleted = updatedConcepts.every(c => c.completed);
    updatedModule.concepts = updatedConcepts;
    updatedModule.completed = isModuleCompleted;

    const batch = writeBatch(db);
    const moduleRef = doc(db, 'users', currentUser.uid, 'modules', module.id.toString());
    
    batch.update(moduleRef, {
      concepts: updatedConcepts,
      completed: isModuleCompleted
    });

    if (isModuleCompleted) {
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

    try {
      await batch.commit();
      
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  }, [modules, currentUser?.uid]);

  const toggleModuleExpansion = useCallback((id: number) => {
    setExpandedModule(prev => (prev === id ? null : id));
  }, []);

  const refreshProgress = useCallback(async () => {
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
  }, [currentUser?.uid]);

  const contextValue = {
    modules,
    loading,
    updateConceptProgress,
    toggleModuleExpansion,
    expandedModule,
    refreshProgress
  };

  return (
    <ProgressContext.Provider value={contextValue}>
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