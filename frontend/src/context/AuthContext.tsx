"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// AuthContext la client-side state dung chung cho navbar, route guards va cac page goi API.
// Token/user duoc hydrate tu localStorage vi Next.js render lai client sau khi reload trang.

type UserRole = 'USER' | 'ADMIN';
type SkinType = 'OILY' | 'DRY' | 'SENSITIVE' | 'COMBINATION' | 'NORMAL';

export interface User {
  id: string;
  username: string;
  displayName: string | null;
  skinType: SkinType;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // localStorage chi ton tai tren browser, nen doc trong useEffect thay vi luc render server.
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate auth state from localStorage once on mount.
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse user from local storage', e);
      }
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string, newUser: User) => {
    // Cap nhat ca React state va localStorage de cac component hien tai va lan reload sau deu biet user.
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const logout = () => {
    // Xoa state va localStorage de route guard chuyen user ve trang login.
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Bao loi som neu component dung useAuth nam ngoai AuthProvider trong layout.
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
