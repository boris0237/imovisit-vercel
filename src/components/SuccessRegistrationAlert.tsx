"use client";

import React, { useState, useEffect } from 'react';
import { Check, Clock } from 'lucide-react';
import Toast from './ui/toast';

interface SuccessRegistrationAlertProps {
  isOpen: boolean;
  userName: string;
  onContinue: () => void;
}

export default function SuccessRegistrationAlert({ isOpen, userName, onContinue }: SuccessRegistrationAlertProps) {
  const [countdown, setCountdown] = useState(59);

  // Gestion du compte à rebours
  useEffect(() => {
    if (isOpen && countdown > 0) {
      const timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (countdown === 0) {
      onContinue(); // Redirection automatique à la fin du timer
    }
  }, [isOpen, countdown, onContinue]);

  return (
    <Toast
      isOpen={isOpen}
      position="center"
      size="xl"          // Très grand (comme sur votre image)
      isBlocking={true}  // Bloquant (pas de croix pour fermer)
      hasBackdrop={true} // Un fond d'écran flouté derrière
    >
      {/* 1. L'icône de succès géante */}
      <div className="w-32 h-32 bg-[#22c55e] rounded-full flex items-center justify-center mb-8 shadow-lg shadow-green-200">
        <Check size={64} strokeWidth={3} className="text-white" />
      </div>

      {/* 2. Titre et Sous-titre */}
      <h1 className="text-5xl font-extrabold text-[#1a2b4b] mb-3 tracking-tight">
        Inscription réussie
      </h1>
      <p className="text-gray-500 text-lg mb-8">
        Bienvenue, <span className="font-bold text-[#1a2b4b]">{userName}</span>
      </p>

      {/* 3. Badge "Vérification en cours" */}
      <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-200 rounded-full text-orange-600 font-semibold text-sm mb-8">
        <Clock size={16} />
        Vérification en cours
      </div>

      {/* 4. Message descriptif */}
      <p className="text-gray-500 max-w-md text-center leading-relaxed mb-6">
        Votre compte est en attente de validation par notre équipe. Vous recevrez une notification sous 24h.
      </p>

      {/* 5. Compteur et Bouton */}
      <div className="flex flex-col items-center gap-4 w-full max-w-xs mt-4">
        <p className="text-sm text-gray-400">
          Redirection dans {countdown}s...
        </p>
        <button 
          onClick={onContinue}
          className="w-full bg-[#1a2b4b] hover:bg-[#121d33] text-white font-bold py-4 rounded-xl transition-all shadow-lg active:scale-[0.98]"
        >
          Accéder maintenant
        </button>
      </div>
    </Toast>
  );
}