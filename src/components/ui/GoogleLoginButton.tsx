// src/components/auth/GoogleButton.tsx
import React from 'react';
import { Button } from '@/components/ui/button';

interface GoogleSignInButtonProps {
  onClick: () => void;
  loading?: boolean;
}

const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ 
  onClick, 
  loading = false 
}) => {
  return (
    <Button 
      onClick={onClick}
      disabled={loading}
      variant="outline"
      className="w-full flex items-center justify-center gap-2"
    >
      {loading ? (
        <>
          <span className="loading loading-spinner loading-sm"></span>
          <span>Connexion en cours...</span>
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.49-1 7.41-2.89l-3.57-2.77c-1.04.72-2.38 1.16-3.84 1.16-2.97 0-5.49-2.03-6.36-4.83H2.4v2.77c1.72 3.41 5.2 5.74 9.6 5.74z" fill="#34A853"/>
            <path d="M5.64 14.31c-.39-.99-.39-2.13 0-3.12V8.42H2.4C1.07 10.75 1.07 13.25 2.4 15.58l3.24-2.77z" fill="#FBBC05"/>
            <path d="M12 5.38c1.61 0 3.09.57 4.25 1.68l3.24-3.24C17.49 1.92 14.97 1 12 1 7.6 1 4.12 3.33 2.4 6.74l3.24 2.77c.87-2.8 3.39-4.83 6.36-4.83z" fill="#EA4335"/>
          </svg>
          <span>Se connecter avec Google</span>
        </>
      )}
    </Button>
  );
};

export default GoogleSignInButton;
