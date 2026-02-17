// src/hooks/useGoogleAuth.ts
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthProvider } from '@prisma/client';

declare global {
  interface Window {
    google: any;
  }
}

interface GoogleUserData {
  name: string;      // username
  email: string;     // adresse email
  picture: string;   // photo de profil
}

interface UseGoogleAuthReturn {
  withGoogle: () => void;
  googleLoading: boolean;
  error: string | null;
  userData: GoogleUserData | null;
  resetError: () => void;
}

export const useGoogleAuth = (): UseGoogleAuthReturn => {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [userData, setUserData] = useState<GoogleUserData | null>(null);

  useEffect(() => {
    // Charger le script Google une seule fois
    const loadGoogleScript = () => {
      if (typeof window !== 'undefined' && !window.google) {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
          console.log('Google Platform script loaded');
        };
        script.onerror = () => {
          setError('Impossible de charger Google Sign-In');
        };
        document.head.appendChild(script);
      }
    };

    loadGoogleScript();
  }, []);

  // Fonction pour réinitialiser les erreurs
  const resetError = () => {
    setError(null);
  };

  const decodeGoogleCredential = (credential: string): GoogleUserData | null => {
    try {
      // Décoder le JWT token pour extraire les informations
      const base64Url = credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      const payload = JSON.parse(jsonPayload);
      
      return {
        name: payload.name || '',
        email: payload.email || '',
        picture: payload.picture || ''
      };
    } catch (error) {
      console.error('Erreur décodage credential Google:', error);
      return null;
    }
  };

  const withGoogle = () => {
    // Empêcher les appels multiples
    if (googleLoading) {
      console.warn('Google Sign-In already in progress');
      return;
    }

    setGoogleLoading(true);
    setError(null);

    // Vérifier que le client_id est défini
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setError('Configuration Google manquante');
      setGoogleLoading(false);
      return;
    }

    if (typeof window !== 'undefined' && window.google) {
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response: any) => {
            try {
              console.log('Google Sign-In response:', response);
              console.log('🟢 Callback appelé:', response);
              if (response.error) {
                console.error('🔴 Erreur Google:', response.error);
              }
              
              if (response.credential) {
                // Extraire les données utilisateur nécessaires
                const googleUserData = decodeGoogleCredential(response.credential);
                console.log('Données utilisateur Google:', googleUserData);
                setUserData(googleUserData);
                
                if (!googleUserData) {
                  setError('Impossible de récupérer les données utilisateur');
                  return;
                }
              } else if (response.error) {
                // Gérer les erreurs spécifiques de Google
                switch (response.error) {
                  case 'popup_closed_by_user':
                    setError('Connexion annulée par l\'utilisateur');
                    break;
                  case 'access_denied':
                    setError('Accès refusé par l\'utilisateur');
                    break;
                  case 'idpiframe_initialization_failed':
                    setError('Erreur d\'initialisation Google Sign-In');
                    break;
                  default:
                    setError(`Erreur Google: ${response.error}`);
                }
              } else {
                setError('Erreur d\'authentification Google');
              }
            } catch (err) {
              console.error('Erreur dans callback Google:', err);
              setError('Erreur réseau lors de l\'authentification');
            } finally {
              setGoogleLoading(false);
            }
          },
          // Options simples et fonctionnelles
          auto_select: false,
          cancel_on_tap_outside: true,
          // Désactiver FedCM temporairement pour debug
          use_fedcm_for_prompt: false, // ← CHANGEMENT IMPORTANT
        });

        // Méthode simple et directe - PAS de renderButton invisible
        console.log('🟡 Prompt about to be called');
        window.google.accounts.id.prompt((notification: any) => {
          console.log('🔔 Prompt notification:', notification);
          if (notification.isNotDisplayed()) {
            console.log('Prompt not displayed:', notification.getReason());
          }
        });
        console.log('🟢 Prompt called successfully');

      } catch (err) {
        console.error('Erreur initialisation Google Sign-In:', err);
        setError('Service Google temporairement indisponible');
        setGoogleLoading(false);
      }
    } else {
      setError('Google Sign-In n\'est pas disponible. Vérifiez vos paramètres navigateur.');
      setGoogleLoading(false);
    }
  };

  return { 
    withGoogle, 
    googleLoading, 
    error, 
    userData,
    resetError
  };
};
