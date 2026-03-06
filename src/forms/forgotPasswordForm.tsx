"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { userService } from "@/services/userService";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");  
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Veuillez entrer votre adresse e-mail.");
      return;
    }

    setIsLoading(true);
    try {
      // Appel à votre service
      const result = await userService.forgotPassword(email);
      if (result.statut === 200){
        setError(result.message || "Une erreur est survenue lors de l'envoi.");
      }
       else {
        setSuccessMessage("Un e-mail de réinitialisation a été envoyé à votre adresse.");
        setIsSubmitted(true);
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 font-sans text-[#1a2b4b]">
      
      {/* Bouton Retour */}
      <div className="w-full max-w-md mb-4">
        <Link 
          href="/login" 
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-[#1a2b4b] transition-colors"
        >
          <ArrowLeft size={16} className="mr-2" />
          Retour à la connexion
        </Link>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100 p-8">
        
        {/* En-tête */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold mb-3">Mot de passe oublié ?</h1>
          {!isSubmitted && (
            <p className="text-gray-500 text-sm leading-relaxed">
              Saisissez l'adresse e-mail associée à votre compte imoVisite et nous vous enverrons un lien pour réinitialiser votre mot de passe.
            </p>
          )}
        </div>

        {/* Rendu Conditionnel : Formulaire OU Message de Succès */}
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Input Email */}
            <div className="space-y-2">
               {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md mb-4">
                    {error}
                  </div>
                )}
                {successMessage && (
                  <div className="bg-green-50 border border-green-200 text-green-600 p-3 rounded-md mb-4">
                    {successMessage}
                  </div>
                )}
              <label htmlFor="email" className="text-sm font-bold text-gray-700">
                Adresse e-mail
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@exemple.com"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a2b4b] focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Bouton de soumission */}
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-[#1a2b4b] hover:bg-[#121d33] text-white font-bold py-3.5 rounded-xl transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner loading={!isLoading} fullScreen={false} />
                  <p>Envoi en cours...</p>
                </>
              ) : (
                "Envoyer le lien"
              )}
            </button>
          </form>
        ) : (
          /* Écran de succès (Feedback visuel) */
          <div className="flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 size={40} className="text-green-500" />
            </div>
            <h2 className="text-xl font-bold mb-2">Vérifiez votre boîte mail</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-8">
              Nous avons envoyé un lien de réinitialisation à <br />
              <span className="font-bold text-[#1a2b4b]">{email}</span>
            </p>
            
            <p className="text-xs text-gray-400 mb-6">
              Vous n'avez rien reçu ? Vérifiez vos spams ou{" "}
              <button 
                onClick={() => setIsSubmitted(false)}
                className="text-[#1a2b4b] font-bold hover:underline"
              >
                réessayez
              </button>
              .
            </p>
          </div>
        )}

      </div>
    </div>
  );
}