import { fetchApi } from './apiConfig';

// --- INTERFACES POUR LE TYPAGE ---

export interface CreateReservationData {
  propertyId: string;
  date: string; // Format attendu : YYYY-MM-DD
  startTime: string; // Ex: "13:30"
  endTime: string; // Ex: "14:30"
  visitType: 'in_person' | 'remote';
}

export interface ReservationFilters {
  propertyId?: string;
  ownerId?: string;
  clientId?: string;
  status?: 'pending' | 'confirmed' | 'cancelled';
  date?: string; 
  startTime?: string;
  endTime?: string;
  page?: number | string;
  limit?: number | string;
}

/**
 * Service gérant les appels API pour l'agenda (Réservations et Exceptions de disponibilité).
 */
export const agendaService = {

  // ==========================================
  // RÉSERVATIONS
  // ==========================================

  /**
   * Crée une nouvelle réservation pour un bien
   */
  createReservation: async (data: CreateReservationData) => {
    const response = await fetchApi('/api/agenda/reservation', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  },

  /**
   * Récupère la liste des réservations avec des filtres dynamiques (Vue Liste / Calendrier)
   */
  getReservations: async (filters: ReservationFilters = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, String(value));
      }
    });

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/api/agenda/reservation?${queryString}` : '/api/agenda/reservation';

    const response = await fetchApi(endpoint, {
      method: 'GET',
    });
    return response;
  },

  // ==========================================
  // EXCEPTIONS DE DISPONIBILITÉ
  // ==========================================
  // Note: Ajustez l'URL de base si vos routes d'exception s'appellent différemment
  // (ex: '/api/agenda/exceptions')

  /**
   * Récupère une exception spécifique par son ID
   */
  getExceptionById: async (id: string) => {
    const response = await fetchApi(`/api/agenda/exception/${id}`, {
      method: 'GET',
    });
    return response;
  },

  /**
   * Met à jour une exception de disponibilité
   */
  updateException: async (id: string, updateData: Record<string, any>) => {
    const response = await fetchApi(`/api/agenda/exception/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
    return response;
  },

  /**
   * Supprime une exception de disponibilité
   */
  deleteException: async (id: string) => {
    const response = await fetchApi(`/api/agenda/exception/${id}`, {
      method: 'DELETE',
    });
    return response;
  }
};