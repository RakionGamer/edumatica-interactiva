import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Concept {
  id: number;
  name: string;
  progress: number;
  unlocked: boolean;
  completed: boolean;
}

interface Module {
  id: number;
  title: string;
  description: string;
  unlocked: boolean;
  completed: boolean;
  concepts: Concept[];
}

interface ProgressContextType {
  modules: Module[];
  updateConceptProgress: (conceptId: number, amount: number) => void;
  toggleModuleExpansion: (id: number) => void;
  expandedModule: number | null;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);
export const ProgressProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [expandedModule, setExpandedModule] = useState<number | null>(null);
  const [modules, setModules] = useState<Module[]>([
    {
      id: 1,
      title: 'Números y Operaciones',
      description: 'Conceptos básicos.',
      unlocked: true,
      completed: false,
      concepts: [
        { id: 1, name: 'Suma', progress: 0, unlocked: true, completed: false },
        { id: 2, name: 'Resta', progress: 0, unlocked: false, completed: false },
        { id: 3, name: 'Multiplicación', progress: 0, unlocked: false, completed: false },
        { id: 4, name: 'División', progress: 0, unlocked: false, completed: false },
      ]
    },
    {
      id: 2,
      title: 'Álgebra',
      description: 'Ecuaciones y expresiones.',
      unlocked: false,
      completed: false,
      concepts: [
        { id: 5, name: 'Ecuaciones lineales', progress: 0, unlocked: false, completed: false },
        { id: 6, name: 'Factorización', progress: 0, unlocked: false, completed: false },
      ]
    },
    {
      id: 3,
      title: 'Geometría',
      description: 'Figuras y espacios.',
      unlocked: false,
      completed: false,
      concepts: [
        { id: 7, name: 'Áreas y perímetros', progress: 0, unlocked: false, completed: false },
        { id: 8, name: 'Volúmenes', progress: 0, unlocked: false, completed: false },
      ]
    },
  ]);

  const updateConceptProgress = (conceptId: number, amount: number) => {
    setModules(prevModules => {
      return prevModules.map(module => {
        // Copia profunda de los conceptos
        const updatedConcepts = module.concepts.map(concept => ({ ...concept }));
        
        // Buscar el concepto a actualizar
        const conceptIndex = updatedConcepts.findIndex(c => c.id === conceptId);
        if (conceptIndex === -1) return module;

        const concept = updatedConcepts[conceptIndex];
        if (!concept.unlocked || concept.completed) return module;

        // Actualizar progreso
        const newProgress = Math.min(concept.progress + amount, 100);
        const completed = newProgress === 100;
        
        // Actualizar concepto
        updatedConcepts[conceptIndex] = {
          ...concept,
          progress: newProgress,
          completed
        };

        if (completed && conceptIndex < updatedConcepts.length - 1) {
          updatedConcepts[conceptIndex + 1].unlocked = true;
        }

        const allCompleted = updatedConcepts.every(c => c.completed);
    
        const updatedModule = {
          ...module,
          concepts: updatedConcepts,
          completed: allCompleted
        };

        if (allCompleted) {
          const nextModuleIndex = prevModules.findIndex(m => m.id === module.id) + 1;
          if (nextModuleIndex < prevModules.length) {
            prevModules[nextModuleIndex].unlocked = true;
            prevModules[nextModuleIndex].concepts[0].unlocked = true;
          }
        }

        return updatedModule;
      });
    });
  };

  const toggleModuleExpansion = (id: number) => {
    setExpandedModule(prev => (prev === id ? null : id));
  };

  return (
    <ProgressContext.Provider value={{
      modules,
      updateConceptProgress,
      toggleModuleExpansion,
      expandedModule
    }}>
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