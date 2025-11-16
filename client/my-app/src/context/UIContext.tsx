import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface UIContextType {
  showBalance: boolean;
  toggleShowBalance: () => void;
  setShowBalance: (v: boolean) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const useUI = () => {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI must be used within UIProvider');
  return ctx;
};

export const UIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [showBalance, setShowBalance] = useState<boolean>(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('showBalance');
      if (raw !== null) setShowBalance(raw === 'true');
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('showBalance', showBalance ? 'true' : 'false');
    } catch (e) {
      // ignore
    }
  }, [showBalance]);

  const toggleShowBalance = () => setShowBalance((s) => !s);

  return (
    <UIContext.Provider value={{ showBalance, toggleShowBalance, setShowBalance }}>
      {children}
    </UIContext.Provider>
  );
};

export default UIContext;
