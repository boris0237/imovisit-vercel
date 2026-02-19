// src/hooks/useGoogleAuth.ts
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
  const [googleLoading, setgoogleLoading] = useState(false);
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
    setgoogleLoading(true);
    setError(null);

    if (typeof window !== 'undefined' && window.google) {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        callback: async (response: any) => {
          try {
            if (response.credential) {
              // Envoyer le credential au backend pour vérification
              const backendResponse = await fetch('/api/auth/google', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ credential: response.credential }),
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
            setgoogleLoading(false);
          }
        },
      });

      window.google.accounts.id.prompt();
    } else {
      setError('Google Sign-In n\'est pas disponible');
      setgoogleLoading(false);
    }
  };

  return { withGoogle, googleLoading, error };
};
