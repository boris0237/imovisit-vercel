"use client";

import React, { useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';

interface CustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  locked?: boolean;
  rounded?: boolean;
  showBlur?: boolean;
  closeOnClickOutside?: boolean;
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  '2xl': 'max-w-6xl',
  full: 'max-w-[95vw]'
};

export default function CustomModal({
  isOpen,
  onClose,
  children,
  title,
  size = 'md',
  showBlur = true,
  locked = true,
  rounded = true,
  closeOnClickOutside = true
}: CustomModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Fermeture avec la touche Échap
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Bloquer le scroll derrière
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay / Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/40 transition-opacity ${showBlur ? 'backdrop-blur-sm' : ''}`}
        onClick={() => closeOnClickOutside && onClose()}
      />

      {/* Conteneur du Modal */}
      <div 
        ref={modalRef}
        className={`relative bg-white w-full ${sizeClasses[size]} ${rounded ? 'rounded-2xl' : 'rounded-none'} shadow-2xl transform transition-all overflow-hidden max-h-[95vh] flex flex-col`}
      >
        {/* Header (Optionnel) */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-800">{title || "Mise à jour"}</h3>
          {locked &&(<button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>)}
        </div>

        {/* Corps du Modal (Scrollable si trop grand) */}
        <div className="p-6 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}