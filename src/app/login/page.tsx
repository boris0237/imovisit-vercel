"use client"

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link'
import { Eye, EyeOff, Mail, Lock, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter } from 'next/navigation'
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useDictionary } from '@/hooks/useDictionary';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';

export default function Login() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [accountType, setAccountType] = useState<'visitor' | 'owner'>('visitor');

  interface LoginResponse {
    status: number;
    message: string;
    data: {
      user: {
        id: number;
        name: string;
        email: string;
        role: string;
        authProvider: string;
        avatar: string | null;
        typeCompte: string;
        verified: boolean;
      };
      token: string;
    } | null;
    error: string | null;
  }

  const { dictionary } = useDictionary();
  const currentYear = new Date().getFullYear();
  const { withGoogle, googleLoading, error, userData, resetError } = useGoogleAuth();

  useEffect(() => {
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

  // 1. L'effet "Moteur" : Déclenche la connexion backend dès que Google renvoie l'email
  useEffect(() => {
    if (userData?.email && !loading && !successMessage) {
      handleBackendLogin(userData.email);
    }
  }, [userData]); // Surveille le changement de userData

  // 2. La fonction de connexion Backend (Syntaxe sans async/await)
  const handleBackendLogin = (email: string) => {
    setLoading(true);
    setErrors({});
    resetError();

    const loginData = { email: email };

    fetch('/api/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
    })
      .then((response) => {
        // On capture le statut HTTP pour le switch case plus bas
        return response.json().then((data) => ({
          ok: response.ok,
          status: response.status,
          data: data
        }));
      })
      .then(({ ok, status, data }) => {

        console.log("reponsedu backend", data);
        if (ok) {
          setSuccessMessage(dictionary?.login?.success || "Connexion réussie !");
          const loggedInUser = data.user;
          login(loggedInUser);

          // Redirection après un court délai
          setTimeout(() => {
            if (loggedInUser.role === 'owner' || loggedInUser.role !== 'visitor') {
              router.push('/dashboard/user'); // router.push est plus fluide que window.location.href
            } else {
              router.push('/');
            }
          }, 200000);
        } else {
          // Gestion précise des erreurs via le statut HTTP
          switch (status) {
            case 400:
              setErrors({ email: data.message || "Email requis" });
              break;
            case 401:
              setErrors({ general: data.message || "Authentification invalide" });
              break;
            // ... à l'intérieur de handleBackendLogin, dans le switch(status)
            case 404:
              setErrors({ general: data.message || "Compte non trouvé" });
              break;
            default:
              setErrors({
                general: data.message || dictionary?.login?.errorGeneric || "Une erreur est survenue."
              });
          }
        }
      })
      .catch((error) => {
        console.error('Erreur réseau:', error);
        setErrors({
          general: dictionary?.login?.canConnect || "Impossible de se connecter au serveur."
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // 3. La fonction déclenchée par le bouton "Google"
  const loginWithGoogleData = () => {
    setErrors({});
    resetError();

    if (!userData?.email) {
      // Si on n'a pas encore les infos, on ouvre la popup Google
      withGoogle();
    } else {
      // Si l'utilisateur est déjà reconnu par le state, on force l'appel au backend
      handleBackendLogin(userData.email);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setSuccessMessage(null);

    try {
      const validationErrors: Record<string, string> = {};
      if (!formData.email.trim()) {
        validationErrors.email = dictionary.login?.errorEmailRequired || "L'email est requis";
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        validationErrors.email = dictionary.login?.errorEmailInvalid || "Format d'email invalide";
      }
      if (!formData.password.trim()) {
        validationErrors.password = dictionary.login?.errorPasswordRequired || "Le mot de passe est requis";
      } else if (formData.password.length < 8) {
        validationErrors.password = dictionary.login?.errorPasswordLength || "Le mot de passe doit contenir au moins 8 caractères";
      }
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      login(formData as any);

      const result: LoginResponse = await response.json();

      if (response.ok && result.status === 200) {
        const loggedInUser = result.data?.user;
        // Connexion réussie
        console.log('Login successful:', result.data, loggedInUser?.role);
        setSuccessMessage(dictionary?.login?.success || "Connexion réussie, redirection...");

        // Redirection après un court délai

        setTimeout(() => {
          console.log('utilisateur login dans le context', loggedInUser);
          if (loggedInUser?.role !== 'visitor' && loggedInUser?.role !== undefined) {
            window.location.href = '/dashboard/user';
          } else {
            window.location.href = '/';
          }
        }, 2000);
        router.refresh(); // Rafraîchir l'état de session

      } else {
        // Gérer les erreurs selon le statut
        switch (result.status) {
          case 400:
            setErrors({ general: dictionary.login?.errorInvalidCredentials || "Veuillez remplir tous les champs requis" });
            break;
          case 401:
            setErrors({ general: dictionary.login?.errorInvalidCredentials });
            break;
          case 404:
            setErrors({ general: dictionary.login?.errorUserNotFound || "Utilisateur non trouvé" });
            break;
          default:
            setErrors({ general: result.error || dictionary.login?.errorGeneric || "Une erreur est survenue. Veuillez réessayer." });
        }
      }
    } catch (err) {
      // Erreurs réseau ou autres
      setErrors(dictionary.login?.errorNetwork || "Problème de connexion au serveur. Veuillez réessayer.");
      console.error('Login error:', err);
    } finally {
      setLoading(loading);
    }
  };


  return (
    <div>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-imo-primary via-imo-secondary to-imo-primary flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{dictionary.login?.connexion || "Connexion"}</CardTitle>
              <CardDescription>
                {dictionary.login?.subtitle || "Connectez-vous pour accéder à votre compte"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="email" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="email" className="flex items-center justify-center gap-2">
                    <svg width="21" height="15" viewBox="0 0 21 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19.5 0H1.5C1.10218 0 0.720644 0.158035 0.43934 0.43934C0.158035 0.720644 0 1.10218 0 1.5V13.5C0 13.8978 0.158035 14.2794 0.43934 14.5607C0.720644 14.842 1.10218 15 1.5 15H19.5C19.8978 15 20.2794 14.842 20.5607 14.5607C20.842 14.2794 21 13.8978 21 13.5V1.5C21 1.10218 20.842 0.720644 20.5607 0.43934C20.2794 0.158035 19.8978 0 19.5 0ZM19.5 4.5L10.5 9L1.5 4.5V1.5L10.5 6L19.5 1.5V4.5Z" fill="#42A5F5" />
                    </svg>
                    Email
                  </TabsTrigger>
                  <TabsTrigger value="google" className="flex items-center justify-center gap-2">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className='-mb-1'>
                      <path d="M21.8055 10.0415H21V10H12V14H17.6515C16.827 16.3285 14.6115 18 12 18C8.6865 18 6 15.3135 6 12C6 8.6865 8.6865 6 12 6C13.5295 6 14.921 6.577 15.9805 7.5195L18.809 4.691C17.023 3.0265 14.634 2 12 2C6.4775 2 2 6.4775 2 12C2 17.5225 6.4775 22 12 22C17.5225 22 22 17.5225 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z" fill="#FFC107" />
                      <path d="M3.15308 7.3455L6.43858 9.755C7.32758 7.554 9.48058 6 12.0001 6C13.5296 6 14.9211 6.577 15.9806 7.5195L18.8091 4.691C17.0231 3.0265 14.6341 2 12.0001 2C8.15908 2 4.82808 4.1685 3.15308 7.3455Z" fill="#FF3D00" />
                      <path d="M11.9999 22C14.5829 22 16.9299 21.0115 18.7044 19.404L15.6094 16.785C14.5719 17.5745 13.3037 18.0014 11.9999 18C9.39891 18 7.19041 16.3415 6.35841 14.027L3.09741 16.5395C4.75241 19.778 8.11341 22 11.9999 22Z" fill="#4CAF50" />
                      <path d="M21.8055 10.0415H21V10H12V14H17.6515C17.2571 15.1082 16.5467 16.0766 15.608 16.7855L15.6095 16.7845L18.7045 19.4035C18.4855 19.6025 22 17 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z" fill="#1976D2" />
                    </svg>
                    Google
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="email">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Section des Messages d'Erreur (Login) */}
                    {errors.general && (
                      <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md mb-4">
                        {errors.general}
                      </div>
                    )}
                    {successMessage && (
                      <div className="bg-green-50 border border-green-200 text-green-600 p-3 rounded-md mb-4">
                        {successMessage}
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder={dictionary.login?.placeholderEmail || "votre@email.com"}
                          className="pl-10"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">{dictionary.login?.password || "Mot de passe"}</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="********"
                          className="pl-10 pr-10"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="remember"
                          checked={formData.rememberMe}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, rememberMe: checked as boolean })
                          }
                        />
                        <Label htmlFor="remember" className="text-sm font-normal">
                          {dictionary.login?.rememberMe || "Se souvenir de moi"}
                        </Label>
                      </div>
                      <Link href="/forgotpassword" className="text-sm text-imo-primary hover:underline">
                        {dictionary.login?.forgotPassword || "Mot de passe oublié?"}
                      </Link>
                    </div>

                    <Button type="submit" className="w-full bg-imo-primary hover:bg-imo-secondary" loading={loading} loadingTime={0.5} loadingFull={false}>
                      {dictionary.login?.submit || "Se connecter"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="google">
                  <div className="space-y-4">
                    <Button
                      onClick={loginWithGoogleData}
                      disabled={googleLoading || loading}
                      variant="outline"
                      className="w-full flex items-center justify-center gap-2"
                    >
                      {googleLoading || loading ? (
                        <>
                          <LoadingSpinner loading={loading} fullScreen={false} />
                          {dictionary.signup?.loading || "Chargement..."}
                        </>
                      ) : (
                        <>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className='-mb-1'>
                            <path d="M21.8055 10.0415H21V10H12V14H17.6515C16.827 16.3285 14.6115 18 12 18C8.6865 18 6 15.3135 6 12C6 8.6865 8.6865 6 12 6C13.5295 6 14.921 6.577 15.9805 7.5195L18.809 4.691C17.023 3.0265 14.634 2 12 2C6.4775 2 2 6.4775 2 12C2 17.5225 6.4775 22 12 22C17.5225 22 22 17.5225 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z" fill="#FFC107" />
                            <path d="M3.15308 7.3455L6.43858 9.755C7.32758 7.554 9.48058 6 12.0001 6C13.5296 6 14.9211 6.577 15.9806 7.5195L18.8091 4.691C17.0231 3.0265 14.6341 2 12.0001 2C8.15908 2 4.82808 4.1685 3.15308 7.3455Z" fill="#FF3D00" />
                            <path d="M11.9999 22C14.5829 22 16.9299 21.0115 18.7044 19.404L15.6094 16.785C14.5719 17.5745 13.3037 18.0014 11.9999 18C9.39891 18 7.19041 16.3415 6.35841 14.027L3.09741 16.5395C4.75241 19.778 8.11341 22 11.9999 22Z" fill="#4CAF50" />
                            <path d="M21.8055 10.0415H21V10H12V14H17.6515C17.2571 15.1082 16.5467 16.0766 15.608 16.7855L15.6095 16.7845L18.7045 19.4035C18.4855 19.6025 22 17 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z" fill="#1976D2" />
                          </svg>
                          {dictionary.login?.letGoogle || "Se connecter avec Google"}
                        </>
                      )}
                    </Button>

                    {/* Section des Messages d'Erreur (Login) */}
                    {(error || errors?.general || errors?.email) && (
                      <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md text-sm relative animate-in fade-in slide-in-from-top-1">
                        <button
                          onClick={() => { setErrors({}); resetError(); }}
                          className="absolute top-2 right-2 text-red-400 hover:text-red-600 transition-colors"
                          title="Fermer"
                        >
                          ×
                        </button>
                        <div className="pr-6 space-y-1">
                          {errors?.general && <p className="font-medium">{errors.general}</p>}
                          {errors?.email && <p>{errors.email}</p>}
                          {error && !errors?.general && <p>{error.toString()}</p>}
                        </div>
                      </div>
                    )}

                    {/* Section du Message de Succès */}
                    {successMessage && (
                      <div className="bg-green-50 border border-green-200 text-green-600 p-3 rounded-md text-sm flex items-center gap-2 animate-in fade-in zoom-in-95">
                        <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                        {successMessage}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              <div className="mt-6 text-center text-sm">
                <span className="text-gray-600">{dictionary.login?.neverHaveAccount || "Pas encore de compte ? "}</span>
                <Link href="/register" className="text-imo-primary hover:underline font-medium">
                  {dictionary.login?.signup || "S'inscrire"}
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}