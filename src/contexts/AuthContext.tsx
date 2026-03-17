"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';

interface User {
  accountStatus: string
  age: number
  authProvider: string
  avatar: string
  city: string
  companyLogo: string
  companyName: string
  country: string
  createdAt: string
  docCNI: string
  docContribuable: string
  docDiplome: string
  docJust: string
  docRCCM: string
  email: string
  id: string
  isActive: boolean
  name: string
  phone: string
  profession: string
  role: string
  services: string
  typeCompte: string
  updatedAt: string
  verified: boolean
}

interface LoginCredentials {
  email: string;
  password?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  // 2. La signature de login change : elle devient asynchrone et prend les crédentials
  login: (credentials: LoginCredentials) => Promise<User | undefined>;
  logout: () => Promise<void>;
  refreshUser: (updatedData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const authData = await authService.login(credentials);
      const userData = authData?.user ?? authData;
      const token = authData?.token;

      localStorage.setItem('user', JSON.stringify(userData));
      if (token) {
        localStorage.setItem('token', token);
      }
      setUser(userData);

      return userData;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Erreur lors de la déconnexion serveur", error);
    } finally {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setUser(null);
      router.push('/login');
    }
  };

  const refreshUser = (updatedData: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const newUser = { ...prev, ...updatedData };
      localStorage.setItem('user', JSON.stringify(newUser));
      return newUser;
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export default AuthContext;
