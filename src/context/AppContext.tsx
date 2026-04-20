import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { isKnownCardId, normalizeCardId } from '../data/cards';

interface AppState {
  selectedCardIds: string[];
  addCardId: (id: string) => void;
  clearCards: () => void;
  results: any | null;
  setResults: (results: any) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
  const [results, setResults] = useState<any | null>(null);

  const addCardId = useCallback((id: string) => {
    const normalizedId = normalizeCardId(id);
    if (!isKnownCardId(normalizedId)) return;

    setSelectedCardIds((prev) => {
      if (prev.includes(normalizedId) || prev.length >= 10) return prev;
      return [...prev, normalizedId];
    });
  }, []);

  const clearCards = useCallback(() => {
    setSelectedCardIds([]);
    setResults(null);
  }, []);

  const updateResults = useCallback((newResults: any) => {
    setResults(newResults);
  }, []);

  return (
    <AppContext.Provider value={{ selectedCardIds, addCardId, clearCards, results, setResults: updateResults }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
