// src/hooks/useInitData.tsx
import { createContext, useContext, ReactNode } from 'react';

// Create a context to hold the initData string
const InitDataContext = createContext<string | null>(null);

// Create a provider component that will be used in Root.tsx
export const InitDataProvider = ({ children, initData }: { children: ReactNode; initData: string }) => {
  return (
    <InitDataContext.Provider value={initData}>
      {children}
    </InitDataContext.Provider>
  );
};

// Create a custom hook that components can use to access the initData
export const useInitData = () => {
  const context = useContext(InitDataContext);
  if (context === null) {
    throw new Error('useInitData must be used within an InitDataProvider');
  }
  return context;
};