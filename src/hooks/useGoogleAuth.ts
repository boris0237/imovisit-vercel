// src/hooks/useGoogleAuth.ts
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthProvider } from '@prisma/client';

declare global {
  interface Window {
    google: any;
  }
}

interface UseGoogleAuthReturn {
  withGoogle: () => void;
  googleLoading: boolean;
  error: string | null;
}

export const useGoogleAuth = (): UseGoogleAuthReturn => {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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
        document.head.appendChild(script);
      }
    };

    loadGoogleScript();
  }, []);

  const withGoogle = () => {
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
      window.google.accounts.id.initialize({
        client_id: clientId, // Utilise la variable corrigée
        callback: async (response: any) => {
          try {
            if (response.credential) {
              // Envoyer le credential au backend pour vérification
              const backendResponse = await fetch('/api/users/login', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ AuthProvider: AuthProvider.google, credential: response.credential }),
              });

              const data = await backendResponse.json();

              if (backendResponse.ok) {
                router.push('/dashboard');
                router.refresh();
              } else {
                setError(data.message || 'Erreur d\'authentification');
              }
            } else {
              setError('Erreur d\'authentification Google');
            }
          } catch (err) {
            setError('Erreur réseau');
            console.error(err);
          } finally {
            setGoogleLoading(false);
          }
        },
      });

      window.google.accounts.id.prompt();
    } else {
      setError('Google Sign-In n\'est pas disponible');
      setGoogleLoading(false);
    }
  };

  return { withGoogle, googleLoading, error };
};
