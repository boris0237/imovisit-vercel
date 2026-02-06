"use client"

import { useState } from 'react';
import Link from 'next/link'
import { Mail, Lock, Users, Phone, MapPin, Building2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { cities } from '@/data/mock';
import {Header} from '@/components/Header';
import {Footer} from '@/components/Footer';
import { useDictionary } from '@/hooks/useDictionary';


export default function Register() {
  const [accountType, setAccountType] = useState<'visitor' | 'owner'>('visitor');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    password: '',
    confirmPassword: '',
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

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  setErrors({});
  setIsLoading(true);
  setSuccessMessage('');

  try {
    const validationErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      validationErrors.name = "Le nom est requis";
    }
    
    if (!formData.phone.trim()) {
      validationErrors.phone = "Le numéro de téléphone est requis";
    }
    
    if (!formData.email.trim()) {
      validationErrors.email = "L'email est requis";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      validationErrors.email = "Format d'email invalide";
    }
    
    if (!formData.password) {
      validationErrors.password = "Le mot de passe est requis";
    } else if (formData.password.length < 8) {
      validationErrors.password = "Le mot de passe doit contenir au moins 8 caractères";
    }

    if (formData.password !== formData.confirmPassword) {
      validationErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }
    
    if (!formData.acceptTerms) {
      validationErrors.acceptTerms = "Vous devez accepter les conditions d'utilisation";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const response = await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || null,
        city: formData.city || null,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      setSuccessMessage("Inscription réussie ! Vérifiez votre email pour confirmer votre compte.");
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        city: '',
        acceptTerms: false,
      });
      
      setTimeout(() => {
        window.location.href = '/login';
      }, 3000);
    } else {
      if (data.message?.includes("Email et password sont obligatoires")) {
        setErrors({
          email: "L'email est requis",
          password: "Le mot de passe est requis",
        });
      } else if (data.message?.includes("email existe déjà")) {
        setErrors({
          email: "Cet email est déjà utilisé",
        });
      } else if (data.message?.includes("password doit contenir au moins")) {
        setErrors({
          password: "Le mot de passe doit contenir au moins 8 caractères",
        });
      } else {
        // Erreur générique
        setErrors({
          general: data.message || "Une erreur est survenue. Veuillez réessayer.",
        });
      }
    }
  } catch (error) {
    console.error('Erreur réseau:', error);
    setErrors({
      general: "Impossible de se connecter au serveur. Vérifiez votre connexion internet.",
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
                className={`p-4 rounded-xl border-2 text-center transition-all ${
                  accountType === 'visitor'
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
                className={`p-4 rounded-xl border-2 text-center transition-all ${
                  accountType === 'owner'
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
                      <path d="M19.5 0H1.5C1.10218 0 0.720644 0.158035 0.43934 0.43934C0.158035 0.720644 0 1.10218 0 1.5V13.5C0 13.8978 0.158035 14.2794 0.43934 14.5607C0.720644 14.842 1.10218 15 1.5 15H19.5C19.8978 15 20.2794 14.842 20.5607 14.5607C20.842 14.2794 21 13.8978 21 13.5V1.5C21 1.10218 20.842 0.720644 20.5607 0.43934C20.2794 0.158035 19.8978 0 19.5 0ZM19.5 4.5L10.5 9L1.5 4.5V1.5L10.5 6L19.5 1.5V4.5Z" fill="#42A5F5"/>
                    </svg>
                    Email
                </TabsTrigger>
                <TabsTrigger value="google" className="flex items-center justify-center gap-2">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className='-mb-1'>
                    <path d="M21.8055 10.0415H21V10H12V14H17.6515C16.827 16.3285 14.6115 18 12 18C8.6865 18 6 15.3135 6 12C6 8.6865 8.6865 6 12 6C13.5295 6 14.921 6.577 15.9805 7.5195L18.809 4.691C17.023 3.0265 14.634 2 12 2C6.4775 2 2 6.4775 2 12C2 17.5225 6.4775 22 12 22C17.5225 22 22 17.5225 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z" fill="#FFC107"/>
                    <path d="M3.15308 7.3455L6.43858 9.755C7.32758 7.554 9.48058 6 12.0001 6C13.5296 6 14.9211 6.577 15.9806 7.5195L18.8091 4.691C17.0231 3.0265 14.6341 2 12.0001 2C8.15908 2 4.82808 4.1685 3.15308 7.3455Z" fill="#FF3D00"/>
                    <path d="M11.9999 22C14.5829 22 16.9299 21.0115 18.7044 19.404L15.6094 16.785C14.5719 17.5745 13.3037 18.0014 11.9999 18C9.39891 18 7.19041 16.3415 6.35841 14.027L3.09741 16.5395C4.75241 19.778 8.11341 22 11.9999 22Z" fill="#4CAF50"/>
                    <path d="M21.8055 10.0415H21V10H12V14H17.6515C17.2571 15.1082 16.5467 16.0766 15.608 16.7855L15.6095 16.7845L18.7045 19.4035C18.4855 19.6025 22 17 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z" fill="#1976D2"/>
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
                      <Label htmlFor="phone">{dictionary?.signup?.tel || "Numéro de téléphone"}</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="phone"
                          placeholder="+237 6XX XXX XXX"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className={`pl-10 ${errors.phone ? 'border-red-500' : ''}`}
                        />
                      </div>
                        {renderError('phone')}
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

                  <div className="space-y-2">
                    <Label htmlFor="city">{dictionary?.signup?.ville || "City"}</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                      <Select
                        value={formData.city}
                        onValueChange={(value) => setFormData({ ...formData, city: value })}
                      >
                        <SelectTrigger className="pl-10">
                          <SelectValue placeholder={dictionary?.signup?.dropCity || "Sélectionnez votre ville"} />
                        </SelectTrigger>
                        <SelectContent>
                          {cities.map((city) => (
                            <SelectItem key={city} value={city}>
                              {city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
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
                  <Button variant="outline" className="w-full gap-2">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className='-mb-1'>
                    <path d="M21.8055 10.0415H21V10H12V14H17.6515C16.827 16.3285 14.6115 18 12 18C8.6865 18 6 15.3135 6 12C6 8.6865 8.6865 6 12 6C13.5295 6 14.921 6.577 15.9805 7.5195L18.809 4.691C17.023 3.0265 14.634 2 12 2C6.4775 2 2 6.4775 2 12C2 17.5225 6.4775 22 12 22C17.5225 22 22 17.5225 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z" fill="#FFC107"/>
                    <path d="M3.15308 7.3455L6.43858 9.755C7.32758 7.554 9.48058 6 12.0001 6C13.5296 6 14.9211 6.577 15.9806 7.5195L18.8091 4.691C17.0231 3.0265 14.6341 2 12.0001 2C8.15908 2 4.82808 4.1685 3.15308 7.3455Z" fill="#FF3D00"/>
                    <path d="M11.9999 22C14.5829 22 16.9299 21.0115 18.7044 19.404L15.6094 16.785C14.5719 17.5745 13.3037 18.0014 11.9999 18C9.39891 18 7.19041 16.3415 6.35841 14.027L3.09741 16.5395C4.75241 19.778 8.11341 22 11.9999 22Z" fill="#4CAF50"/>
                    <path d="M21.8055 10.0415H21V10H12V14H17.6515C17.2571 15.1082 16.5467 16.0766 15.608 16.7855L15.6095 16.7845L18.7045 19.4035C18.4855 19.6025 22 17 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z" fill="#1976D2"/>
                  </svg>
                    {dictionary.signup?.letGoogle || "Se connecter avec Google"}
                  </Button>
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

        <p className="text-center text-white/70 text-sm mt-8">
          © {currentYear} {dictionary.signup?.rights || "Imovisit. Tous droits réservés."}
        </p>
      </div>
    </div>
    <Footer />
  </div>
  );
}
