"use client";

import React, { useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

interface FlexibleToastProps {
  isOpen: boolean;
  onClose?: () => void;
  type?: 'success' | 'error' | 'info' | 'warning';
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'center' | 'top-center';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  isBlocking?: boolean; // Si true, l'utilisateur DOIT cliquer sur une action, il ne peut pas cliquer à côté
  hasBackdrop?: boolean; // Affiche un fond flouté/sombre
  autoCloseMs?: number; // Temps en ms avant fermeture automatique (0 = désactivé)
  customIcon?: 'success' | 'error' | 'info' | 'warning' ;
  children: React.ReactNode;
}

const positionClasses = {
  'top-right': 'top-6 right-6',
  'top-left': 'top-6 left-6',
  'bottom-right': 'bottom-6 right-6',
  'bottom-left': 'bottom-6 left-6',
  'top-center': 'top-6 left-1/2 -translate-x-1/2',
  'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
};

const sizeClasses = {
  sm: 'max-w-sm w-full p-4',
  md: 'max-w-md w-full p-6',
  lg: 'max-w-lg w-full p-8',
  xl: 'max-w-2xl w-full p-10',
  full: 'w-screen h-screen flex flex-col justify-center items-center p-4', // Pour les écrans de validation complets
};

const typeClasses = {
  success: 'border-green-300 bg-blue-80',
  info: 'border-blue-300 bg-blue-80',
  error: 'border-red-300 bg-red-80',
  warning: 'border-yellow-300 bg-yellow-80',
}

const customIconClasses ={
  success: 'CheckCircle2',
  info: 'Info',
  error: 'AlertCircle',
  warning: 'AlertTriangle',
}

export default function FlexibleToast({
  isOpen,
  onClose,
  type = 'info',
  position = 'top-right',
  size = 'md',
  isBlocking = false,
  hasBackdrop = false,
  autoCloseMs = 0,
  customIcon,
  children
}: FlexibleToastProps) {

  // Auto-fermeture
  useEffect(() => {
    if (isOpen && autoCloseMs > 0 && !isBlocking && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseMs);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoCloseMs, isBlocking, onClose]);

  if (!isOpen) return null;

  // Gestion du clic extérieur (Backdrop)
  const handleBackdropClick = () => {
    if (!isBlocking && onClose) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[150] pointer-events-none flex">
      {/* Backdrop (Fond sombre) optionnel */}
      {hasBackdrop && (
        <div 
          className="absolute inset-0 bg-white/80 backdrop-blur-sm pointer-events-auto transition-opacity"
          onClick={handleBackdropClick}
        />
      )}

      {/* Le Toast / Alerte */}
      <div 
        className={`absolute pointer-events-auto bg-white shadow-2xl rounded-3xl border border-gray-100 transform transition-all animate-in fade-in zoom-in-95 ${positionClasses[position]} ${sizeClasses[size]} ${typeClasses[type]}  ${size === 'full' ? 'border-none shadow-none rounded-none bg-transparent' : ''}`}
      >
        {/* Bouton Fermer (Croix) si non bloquant */}
        {!isBlocking && onClose && size !== 'full' && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        )}

        {/* Contenu */}
        <div className="flex flex-col items-center text-center">
          {children}
        </div>
      </div>
    </div>
  );
}