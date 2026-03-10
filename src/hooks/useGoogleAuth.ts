// src/hooks/useGoogleAuth.ts
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

declare global {
  interface Window {
    google: any;
  }
}

interface GoogleUserData {
  name: string;
  email: string;
  picture: string;
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
  const [userData, setUserData] = useState<GoogleUserData | null>(null);

  useEffect(() => {
    const loadGoogleScript = () => {
      if (typeof window !== 'undefined' && !window.google) {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => console.log('✅ Google GSI script loaded');
        script.onerror = () => setError('Impossible de charger Google Sign-In');
        document.head.appendChild(script);
      }
    };
    loadGoogleScript();
  }, []);

  const resetError = useCallback(() => setError(null), []);

  const decodeGoogleCredential = (credential: string): GoogleUserData | null => {
    try {
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
    } catch (err) {
      console.error('Erreur décodage Google:', err);
      return null;
    }
  };

  const withGoogle = () => {
    if (googleLoading) return;

    setGoogleLoading(true);
    setError(null);

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
          callback: (response: any) => {
            if (response.credential) {
              const data = decodeGoogleCredential(response.credential);
              setUserData(data);
            } else {
              setError('Authentification échouée');
            }
            setGoogleLoading(false);
          },
          auto_select: false,
          cancel_on_tap_outside: true,
          // ✅ Activé pour être conforme aux nouvelles normes (supprime le warning console)
          use_fedcm_for_prompt: true, 
        });

        // 🟡 Un seul appel à prompt() avec une gestion complète des cas
        window.google.accounts.id.prompt((notification: any) => {
          console.log('🔔 Moment Type:', notification.getMomentType());

          if (notification.isNotDisplayed()) {
            const reason = notification.getNotDisplayedReason();
            console.warn('❌ One Tap non affiché. Raison:', reason);
            
            // Si le One Tap est bloqué par Google (cool-down), on avertit l'utilisateur
            if (reason === 'suppressed_by_user' || reason === 'skipped_moment') {
              setError("Veuillez réessayer ou vous connecter manuellement (Google limite l'affichage automatique).");
            }
            setGoogleLoading(false);
          }

          if (notification.isSkippedMoment()) {
            console.warn('⚠️ One Tap ignoré. Raison:', notification.getSkippedReason());
            setGoogleLoading(false);
          }

          if (notification.isDismissedMoment()) {
            console.log('✅ Modal fermé par l\'utilisateur.');
            setGoogleLoading(false);
          }
        });

      } catch (err) {
        console.error('Erreur initialisation Google:', err);
        setError('Service Google temporairement indisponible');
        setGoogleLoading(false);
      }
    } else {
      setError('Service Google non chargé. Réessayez.');
      setGoogleLoading(false);
    }
  };

  return { withGoogle, googleLoading, error, userData, resetError };
};