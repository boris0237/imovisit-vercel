"use client"

import { useState } from 'react';
import Link from 'next/link'
import { Mail, Lock, Users, Phone, MapPin, Building2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useDictionary } from '@/hooks/useDictionary';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import InternationalPhoneInput from '@/components/ui/InternationalPhoneInput';
import LoadingSpinner from '@/components/ui/LoadingSpinner';


export default function Register() {
  const [accountType, setAccountType] = useState<'visitor' | 'owner'>('visitor');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    avatar: '',
    country:'',
    authProvider: '',
    role: '',
    acceptTerms: false,
  });
  const { dictionary } = useDictionary();
  const currentYear = new Date().getFullYear();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const renderError = (field: string) => {
    return errors[field] ? (
      <p className="text-red-500 text-sm mt-1">{errors[field]}</p>
    ) : null;
  };

  const { withGoogle, googleLoading, error, userData } = useGoogleAuth();
  const submitGoogle = async () => {
  try {
    withGoogle();
    setIsLoading(true);
    setErrors({}); // Réinitialiser les erreurs

    // Validation des données de base
    if (!userData?.name || !userData?.email) {
      setErrors({
        general: "Données utilisateur Google incomplètes"
      });
      setIsLoading(false);
      return;
    }

    // Préparer les données avec les informations Google
    const userDataToSend = {
      name: userData.name,
      email: userData.email,
      phone: formData.phone || "", // Utiliser le téléphone du formulaire s'il existe
      country: formData.country || "", // Utiliser le pays du formulaire s'il existe
      avatar: userData.picture || "",
      authProvider: "google", // Doit être une string, pas un enum
      role: accountType,
    };

    const response = await fetch('/api/users/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userDataToSend),
    });

    const data = await response.json();

    if (response.ok) {
      setSuccessMessage(dictionary?.signup?.success || "Inscription réussie ! Vous allez être redirigé.");
      
      // Réinitialiser le formulaire
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        avatar: '',
        country: '',
        authProvider: '',
        role: accountType,
        acceptTerms: false,
      });
      
      // Redirection après succès
      setTimeout(() => {
        window.location.href = '/dashboard/user';
      }, 3000);
    } else {
      // Gestion spécifique des erreurs connues
      if (data.message?.includes("email existe déjà")) {
        setErrors({
          email: "Cet email est déjà utilisé"
        });
      } else if (data.message?.includes("champs sont obligatoires")) {
        setErrors({
          general: "Veuillez remplir tous les champs obligatoires"
        });
      } else {
        setErrors({
          general: data.message || dictionary?.signup?.errorGeneric || "Une erreur est survenue. Veuillez réessayer."
        });
      }
    }
  } catch (error) {
    console.error(dictionary?.signup?.errorNetwork || 'Erreur réseau:', error);
    setErrors({
      general: dictionary?.signup?.canConnect || "Impossible de se connecter au serveur. Vérifiez votre connexion internet."
    });
  } finally {
    setIsLoading(false);
  }
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrors({});
    setIsLoading(true);
    setSuccessMessage('');

    try {
      const validationErrors: Record<string, string> = {};
      console.log(formData);


      if (!formData.name.trim()) {
        validationErrors.name = dictionary?.signup?.errorNameRequired || "Le nom est requis";
      }

      if (!formData.phone.trim()) {
        validationErrors.phone = dictionary?.signup?.errorPhoneRequired || "Le numéro de téléphone est requis";
      }

      if (!formData.email.trim()) {
        validationErrors.email = dictionary?.signup?.errorEmailRequired || "L'email est requis";
      } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
        validationErrors.email = dictionary?.signup?.errorEmailInvalid || "Format d'email invalide";
      }

      if (!formData.password) {
        validationErrors.password = dictionary?.signup?.errorPasswordRequired || "Le mot de passe est requis";
      } else if (formData.password.length < 8) {
        validationErrors.password = dictionary?.signup?.errorPasswordLength || "Le mot de passe doit contenir au moins 8 caractères";
      }

      if (formData.password !== formData.confirmPassword) {
        validationErrors.confirmPassword = dictionary?.signup?.errorConfirmPassword || "Les mots de passe ne correspondent pas";
      }

      if (!formData.acceptTerms) {
        validationErrors.acceptTerms = dictionary?.signup?.errorAgreeTerms || "Vous devez accepter les conditions d'utilisation";
      }

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone || null,
          country:'',
          authProvider: 'local',
          role: accountType,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(dictionary?.signup?.success || "Inscription réussie ! Vérifiez votre email pour confirmer votre compte.");
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          phone: '',
          avatar: '',
          country:'',
          authProvider: '',
          role: accountType,
          acceptTerms: false,
        });

        setTimeout(() => {
          window.location.href = '/login';
        }, 3000);
      } else {
        if (data.message?.includes(dictionary.signup?.errorEmail_PasswordRequired || "Email et Le mot de passe sont obligatoires")) {
          setErrors({
            email: dictionary?.signup?.errorEmailRequired || "L'email est requis",
            password: dictionary?.signup?.errorPasswordRequired || "Le mot de passe est requis",
          });
        } else if (data.message?.includes(dictionary.signup?.errorEmailAlreadyExists || "email existe déjà")) {
          setErrors({
            email: dictionary?.signup?.errorEmailAlreadyExists || "Cet email est déjà utilisé",
          });
        } else if (data.message?.includes(dictionary.signup?.errorPasswordLength || "password doit contenir au moins")) {
          setErrors({
            password: dictionary?.signup?.errorPasswordLength || "Le mot de passe doit contenir au moins 8 caractères",
          });
        } else {
          // Erreur générique
          setErrors({
            general: data.message || dictionary?.signup?.errorGeneric || "Une erreur est survenue. Veuillez réessayer.",
          });
        }
      }
    } catch (error) {
      console.error(dictionary.signup?.errorNetwork || 'Erreur réseau:', error);
      setErrors({
        general: dictionary.signup?.canConnect || "Impossible de se connecter au serveur. Vérifiez votre connexion internet.",
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-imo-primary via-imo-secondary to-imo-primary flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{dictionary?.signup?.title || "Créer un compte"}</CardTitle>
              <CardDescription>
                {dictionary?.signup?.subtitle || "Rejoignez la communauté Imovisit"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Account Type Selection */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  type="button"
                  onClick={() => setAccountType('visitor')}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${accountType === 'visitor'
                      ? 'border-imo-primary bg-imo-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <Users className={`w-8 h-8 mx-auto mb-2 ${accountType === 'visitor' ? 'text-imo-primary' : 'text-gray-400'}`} />
                  <div className={`font-medium ${accountType === 'visitor' ? 'text-imo-primary' : 'text-gray-600'}`}>
                    {dictionary?.signup?.visteur || "Visiteur"}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{dictionary?.signup?.visiteurBio || "Je recherche un bien"}</div>
                </button>
                <button
                  type="button"
                  onClick={() => setAccountType('owner')}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${accountType === 'owner'
                      ? 'border-imo-primary bg-imo-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <Building2 className={`w-8 h-8 mx-auto mb-2 ${accountType === 'owner' ? 'text-imo-primary' : 'text-gray-400'}`} />
                  <div className={`font-medium ${accountType === 'owner' ? 'text-imo-primary' : 'text-gray-600'}`}>
                    {dictionary?.signup?.proprietaire || "Propriétaire"}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{dictionary?.signup?.proprietaireBio || "Je publie mes biens"}</div>
                </button>
              </div>

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
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">{dictionary?.signup?.name || "Nom complet"}</Label>
                        <div className="relative">
                          <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <Input
                            id="name"
                            placeholder="Jean Dupont"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className={`pl-10 ${errors.name ? 'border-red-500' : ''}`}
                          />
                        </div>
                        {renderError('name')}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Téléphone</Label>
                        <div className="relative">
                          <InternationalPhoneInput
                            value={formData.phone}
                            onChange={(value) => setFormData({ ...formData, phone: value })}
                            onCountryChange={(countryCode) => {
                              setFormData({ 
                                ...formData, 
                                phone: formData.phone,
                                country: countryCode
                              });
                            }}
                            error={errors.phone}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder={dictionary?.signup?.placeholderEmail || "votre@email.com"}
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                        />
                      </div>
                      {renderError('email')}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="password">{dictionary?.signup?.password || "Mot de passe"}</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <Input
                            id="password"
                            type="password"
                            placeholder="********"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className={`pl-10 ${errors.password ? 'border-red-500' : ''}`}
                          />
                        </div>
                        {renderError('password')}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">{dictionary?.signup?.confirmPassword || "Confirmer le mot de passe"}</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="********"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            className={`pl-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                          />
                        </div>
                        {renderError('confirmPassword')}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="terms"
                        checked={formData.acceptTerms}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, acceptTerms: checked as boolean })
                        }
                        className={`border ${errors.acceptTerms ? 'border-red-500' : ''}`}
                      />
                      <Label htmlFor="terms" className="text-sm font-normal">
                        {dictionary.signup?.agree || "J'accepte les"}{' '}
                        <Link href="/terms" className="text-imo-primary hover:underline">
                          {dictionary.signup?.terms || "conditions d'utilisation"}
                        </Link>{' '}
                        {dictionary.signup?.and || "et la"}{' '}
                        <Link href="/privacy" className="text-imo-primary hover:underline">
                          {dictionary.signup?.conditions || "politique de confidentialité"}
                        </Link>
                      </Label>
                      {renderError('acceptTerms')}
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-imo-primary hover:bg-imo-secondary gap-2"
                    >
                      {dictionary.signup?.submit || "Créer mon compte"}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="google">
                  <div className="space-y-4">
                      <Button 
                        variant="outline" 
                        className="w-full gap-2" 
                        onClick={submitGoogle} // ← Activation directe de withGoogle
                        disabled={googleLoading || isLoading} // ← Désactivation pendant le chargement
                      >
                        {googleLoading || isLoading ? (
                          <>
                            <LoadingSpinner loading={isLoading} fullScreen={false}/>
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
                            {dictionary.signup?.letGoogle || "S'inscrire avec Google"}
                          </>
                        )}
                      </Button>
                      
                      {/* Affichage des erreurs Google */}
                      {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md">
                             {errors && (
                         <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md mb-4">
                           {errors.general}
                           {error}
                         </div>
                       )}                    
                       {successMessage && (
                         <div className="bg-green-50 border border-green-200 text-green-600 p-3 rounded-md mb-4">
                           {successMessage}
                         </div>
                       )}                    
                      </div>
                      )}
                      
                      {/* Affichage du succès */}
                      {successMessage && (
                        <div className="bg-green-50 border border-green-200 text-green-600 p-3 rounded-md">
                          {successMessage}
                        </div>
                      )}
                    </div>
                </TabsContent>
              </Tabs>
              <div className="mt-6 text-center text-sm">
                <span className="text-gray-600">{dictionary.signup?.haveAccount || "Déjà un compte ? "}</span>
                <Link href="/login" className="text-imo-primary hover:underline font-medium">
                  {dictionary.signup?.login || "Se connecter"}
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
