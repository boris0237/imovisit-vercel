// src/services/userService.ts
import { createFormData } from '@/utils/formData';
import { fetchApi } from './apiConfig';

/**
 * Service gérant les appels API liés au profil utilisateur et à la gestion de compte.
 */
export const userService = {

  /**
   * Met à jour le profil de l'utilisateur (accepte FormData pour les fichiers ou un objet simple)
   * @param updateData - Les données à mettre à jour (peut être un objet ou un FormData)
   */
  updateProfile: async (updateData: Record<string, any> | FormData) => {

    // Si c'est déjà un FormData, on le garde. 
    // Sinon, on le confie à notre utilitaire intelligent.
    const body = updateData instanceof FormData
      ? updateData
      : createFormData(updateData);

    console.log("userService.ts:20 data sended by user service :");
    body.forEach((value, key) => {
      console.log(`${key}:`, value);
    });

    const response = await fetchApi('/api/users/update-profile', {
      method: 'PATCH',
      body: body,
      credentials: "include",
    });

    return response;
  },
  /**
   * Change le mot de passe de l'utilisateur connecté
   */
  changePassword: async (passwordData: { oldPassword: string; newPassword: string; confirmPassword: string }) => {
    const response = await fetchApi('/api/users/change-password', { // Assurez-vous que c'est la bonne route API
      method: 'POST',
      body: JSON.stringify(passwordData),
    });

    return response;
  },

  /**
   * Demande un changement d'email (envoie un email de confirmation)
   */
  requestEmailChange: async (newEmail: string) => {
    const response = await fetchApi('/api/users/change-email', { // Assurez-vous que c'est la bonne route API
      method: 'POST',
      body: JSON.stringify({ newEmail }),
    });

    return response;
  },

  /**
   * Confirme le changement d'email via le token reçu par mail
   */
  confirmEmailChange: async (token: string) => {
    // C'est une requête GET, le token est dans l'URL
    const response = await fetchApi(`/api/users/confirm-email-change?token=${token}`, {
      method: 'GET',
    });

    return response;
  },

  /**
   * Demande la réinitialisation du mot de passe (mot de passe oublié)
   */
  forgotPassword: async (email: string) => {
    const response = await fetchApi('/api/users/request-reset-pwd', { // Assurez-vous que c'est la bonne route API
      method: 'POST',
      body: JSON.stringify({ email }),
    });

    return response;
  },

  /**
   * Réinitialise le mot de passe avec le token reçu par mail
   */
  resetPassword: async (token: string, passwords: { newPassword: string; confirmPassword: string }) => {
    const response = await fetchApi(`/api/users/reset-password?token=${token}`, {
      method: 'POST',
      body: JSON.stringify(passwords),
    });

    return response;
  }
};