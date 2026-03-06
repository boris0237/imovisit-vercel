"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, ArrowRight, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { userService } from "@/services/userService";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token"); // Récupération du token dans l'URL

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validation côté client
    if (!token) {
      setError("Lien de réinitialisation invalide ou manquant.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    // 2. Soumission au backend
    setIsLoading(true);
    try {
      const result = await userService.resetPassword(token, { newPassword, confirmPassword });
      if (result.status === 200) {
        setIsSuccess(true);
        setSuccessMessage("Mot de passe modifié avec succès !");
      }else{
        setError(result.message || "Le lien est invalide ou a expiré.");
      }// Redirection vers la page de connexion après 3 secondes
      setTimeout(() => {
        router.push("/login");
      }, 2000);

    } catch (error: any) {
      setError(error.message || "Le lien est invalide ou a expiré.");
    } finally {
      setIsLoading(false);
    }
  };

  // Si pas de token dans l'URL, on affiche une erreur immédiatement
  if (!token) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-md w-full border border-red-100">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Lien invalide</h2>
          <p className="text-gray-500 mb-6">Le lien de réinitialisation est introuvable ou incorrect.</p>
          <button onClick={() => router.push("/forgot-password")} className="text-blue-600 hover:underline font-medium">
            Demander un nouveau lien
          </button>
        </div>
      </div>
    );
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-imo-primary via-imo-secondary to-imo-primary flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100 p-8 relative">
        
        {/* En-tête */}
        <div className="text-center mb-8">
          {error && !successMessage && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md mb-4">
              {error}
            </div>
          )}
          {successMessage && !error && (
            <div className="bg-green-50 border border-green-200 text-green-600 p-3 rounded-md mb-4">
              {successMessage}
            </div>
          )}
          <h1 className="text-3xl font-extrabold mb-3">Nouveau mot de passe</h1>
          {!isSuccess && (
            <p className="text-gray-500 text-sm leading-relaxed">
              Veuillez saisir votre nouveau mot de passe pour sécuriser votre compte imoVisite.
            </p>
          )}
        </div>

        {/* Rendu Conditionnel : Formulaire OU Succès */}
        {!isSuccess ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Nouveau mot de passe */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Nouveau mot de passe</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a2b4b] focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirmation mot de passe */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Confirmer le mot de passe</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a2b4b] focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Bouton de soumission */}
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full mt-4 bg-[#1a2b4b] hover:bg-[#121d33] text-white font-bold py-3.5 rounded-xl transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Mise à jour...
                </>
              ) : (
                "Réinitialiser le mot de passe"
              )}
            </button>
          </form>
        ) : (
          /* Écran de succès */
          <div className="flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 size={40} className="text-green-500" />
            </div>
            <h2 className="text-xl font-bold mb-2">Mot de passe mis à jour !</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-8">
              Votre mot de passe a été réinitialisé avec succès. Vous allez être redirigé vers la page de connexion.
            </p>
            
            <button 
              onClick={() => router.push('/login')}
              className="flex items-center gap-2 text-[#1a2b4b] font-bold hover:underline"
            >
              Se connecter maintenant <ArrowRight size={16} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}