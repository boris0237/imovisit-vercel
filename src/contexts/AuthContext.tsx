"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  avatar?: string | null;
  phone?: string;
  city?: string;
  country?: string;
  profession?: string;
  age?: number;
  typeCompte?: string;
  verified?: boolean;
  companyName?: string;
  companyLogo?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User) => void; // ❌ Le token a été retiré des paramètres
  logout: () => Promise<void>;
  refreshUser: (updatedData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 1. Hydratation au rechargement de la page
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    // ❌ Plus besoin de vérifier le token ici, on fait confiance au cookie géré par le navigateur
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // 2. Fonction de connexion (appelée après le succès du fetch vers /api/users/login)
  const login = (userData: User) => {
    // ❌ On ne stocke plus le token dans le localStorage
    localStorage.setItem('user', JSON.stringify(userData)); // On garde juste les infos pour l'UI
    setUser(userData);
  };

  // 3. Fonction de déconnexion
  const logout = async () => {
    try {
      // L'appel au backend écrase le cookie HttpOnly en le vidant (maxAge: 0)
      await fetch("/api/users/logout", { method: "POST" });
    } finally {
      // ❌ Plus de token à supprimer ici
      localStorage.removeItem('user');
      setUser(null);
      router.push('/login');
    }
  };

  // 4. Mise à jour de l'état local (lorsque l'utilisateur modifie son profil)
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