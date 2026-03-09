"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface LoadingContextType {
  globalLoading: boolean;
  setGlobalLoading: (loading: boolean) => void;
  loadingMessage: string;
  setLoadingMessage: (message: string) => void;
  addLoadingOperation: (id: string) => void;
  removeLoadingOperation: (id: string) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
};

interface LoadingProviderProps {
  children: ReactNode;
}

export const LoadingProvider = ({ children }: LoadingProviderProps) => {
  const [globalLoading, setGlobalLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Loading...");
  const [, setLoadingOperations] = useState<Set<string>>(new Set());

  const addLoadingOperation = (id: string) => {
    setLoadingOperations((prev) => {
      const newSet = new Set(prev);
      newSet.add(id);
      setGlobalLoading(newSet.size > 0);
      return newSet;
    });
  };

  const removeLoadingOperation = (id: string) => {
    setLoadingOperations((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      setGlobalLoading(newSet.size > 0);
      return newSet;
    });
  };

  return (
    <LoadingContext.Provider
      value={{
        globalLoading,
        setGlobalLoading,
        loadingMessage,
        setLoadingMessage,
        addLoadingOperation,
        removeLoadingOperation,
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
};
