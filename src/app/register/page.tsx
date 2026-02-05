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
                <div className="text-xs text-gray-500 mt-1">{dictionary?.signup?.proprietaireBio || "je suis propriétaire d'un bien"}</div>
              </button>
            </div>

            <Tabs defaultValue="email" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="google">Google</TabsTrigger>
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
                      <Label htmlFor="name">{dictionary?.signup?.name || "Full Name"}</Label>
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
                      <Label htmlFor="phone">{dictionary?.signup?.tel || "Phone Number"}</Label>
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
                        placeholder="votre@email.com"
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
                          <SelectValue placeholder={dictionary?.signup?.dropCity || "Select your city"} />
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
                      <Label htmlFor="password">{dictionary?.signup?.password || "Password"}</Label>
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
                      <Label htmlFor="confirmPassword">{dictionary?.signup?.confirmPassword || "Confirm Password"}</Label>
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
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continuer avec Google
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
