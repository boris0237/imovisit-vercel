import { fetchApi } from './apiConfig';
import { createFormData } from '@/utils/upload-files';

/**
 * Interface pour les paramètres de recherche et de filtrage des biens
 */
export interface PropertyFilters {
  search?: string;
  city?: string;
  neighborhood?: string;
  type?: string;
  offerType?: string;
  rooms?: number | string;
  minPrice?: number | string;
  maxPrice?: number | string;
  page?: number | string;
  limit?: number | string;
}

/**
 * Service gérant les appels API liés aux biens immobiliers (Properties).
 */
export const propertyService = {

  /**
   * Crée un nouveau bien immobilier
   * @param propertyData - Les données du bien (peut être un objet classique avec des fichiers File[] ou un FormData)
   */
  createProperty: async (propertyData: Record<string, any> | FormData) => {
    // Si c'est déjà un FormData, on le garde. Sinon, on utilise notre convertisseur intelligent.
    const body = propertyData instanceof FormData
      ? propertyData
      : createFormData(propertyData);

    const response = await fetchApi('/api/biens', {
      method: 'POST',
      body: body,
      credentials: "include", // Important si vous utilisez des cookies pour l'authentification
    });

    return response;
  },

  /**
   * Récupère la liste des biens avec pagination et filtres
   * @param filters - Objet contenant les critères de recherche
   */
  getProperties: async (filters: PropertyFilters = {}) => {
    // Construction de la chaîne de requête (Query String)
    const queryParams = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, String(value));
      }
    });

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/api/biens?${queryString}` : '/api/biens';

    const response = await fetchApi(endpoint, {
      method: 'GET',
    });

    return response;
  },

  /**
   * Récupère les détails complets d'un seul bien immobilier via son ID
   * @param id - L'identifiant unique du bien
   */
  getPropertyById: async (id: string) => {
    const response = await fetchApi(`/api/biens/${id}`, {
      method: 'GET',
    });

    return response;
  },

  /**
   * Met à jour un bien existant (Réservé au propriétaire ou à l'admin)
   * @param id - L'identifiant unique du bien à modifier
   * @param updateData - Les nouvelles données (peut inclure de nouvelles images)
   */
  updateProperty: async (id: string, updateData: Record<string, any> | FormData) => {
    const body = updateData instanceof FormData
      ? updateData
      : createFormData(updateData);

    const response = await fetchApi(`/api/biens/${id}`, {
      method: 'PATCH',
      body: body,
      credentials: "include",
    });

    return response;
  },

  /**
   * Supprime définitivement un bien immobilier (Réservé au propriétaire ou à l'admin)
   * @param id - L'identifiant unique du bien à supprimer
   */
  deleteProperty: async (id: string) => {
    const response = await fetchApi(`/api/biens/${id}`, {
      method: 'DELETE',
      credentials: "include",
    });

    return response;
  }
};