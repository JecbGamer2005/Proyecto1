import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from '../types';

const USERS: User[] = [
  {
    username: 'admin',
    role: UserRole.Admin,
    displayName: 'Administrador'
  },
  {
    username: 'empleado',
    role: UserRole.Employee,
    displayName: 'Empleado'
  }
];

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  currentUser: User | null;
  hasPermission: (action: 'view' | 'add' | 'edit' | 'delete') => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const storedAuth = localStorage.getItem('isAuthenticated');
    return storedAuth === 'true';
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      return USERS.find(user => user.username === storedUser) || null;
    }
    return null;
  });

  const login = async (username: string, password: string) => {
    const user = USERS.find(u => u.username === username.trim().toLowerCase());
    
    if (user && password.trim() === 'paradero') {
      setIsAuthenticated(true);
      setCurrentUser(user);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('currentUser', user.username);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('currentUser');
  };

  const hasPermission = (action: 'view' | 'add' | 'edit' | 'delete') => {
    if (!currentUser) return false;
    
    if (currentUser.role === UserRole.Admin) {
      return true; // Admin can do everything
    }
    
    if (currentUser.role === UserRole.Employee) {
      return action === 'view' || action === 'add'; // Employee can only view and add
    }
    
    return false;
  };
  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, currentUser, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};