// src/services/userService.ts
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
    let body: FormData | any;

    // Si on passe un objet classique, on le convertit en FormData pour supporter les fichiers
    if (!(updateData instanceof FormData)) {
      body = new FormData();
      Object.entries(updateData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach((item) => body.append(key, item));
          } else {
            body.append(key, value);
          }
        }
      });
    } else {
      body = updateData;
    }

    const response = await fetchApi('/api/users/update-profile', {
      method: 'PATCH',
      body: body,
    });

    return response; // Retourne { status, message, data: { user... } }
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
    const response = await fetchApi('/api/users/forgot-password', { // Assurez-vous que c'est la bonne route API
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