import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  techStack: string[];
}

interface AppContextType {
  user: User | null;
  sidebarOpen: boolean;
  currentPage: string;
  setUser: (user: User | null) => void;
  toggleSidebar: () => void;
  setCurrentPage: (page: string) => void;
  isAuthenticated: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('landing');

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const value = {
    user,
    sidebarOpen,
    currentPage,
    setUser,
    toggleSidebar,
    setCurrentPage,
    isAuthenticated: !!user,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};