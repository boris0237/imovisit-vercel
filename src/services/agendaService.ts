import { fetchApi } from './apiConfig';

// --- INTERFACES POUR LE TYPAGE ---

export interface CreateReservationData {
  propertyId: string;
  date: string; // Format attendu : YYYY-MM-DD
  startTime: string; // Ex: "13:30"
  endTime: string; // Ex: "14:30"
  visitType: 'in_person' | 'remote';
}

export interface GetAvailableHoursParams {
  propertyId: string;
  date: string; // Format attendu : YYYY-MM-DD
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

export interface UpdateAvailabilityData {
  date?: string;      // Format attendu : YYYY-MM-DD
  startTime?: string; // Ex: "11:00"
  endTime?: string;   // Ex: "13:00"
}

export interface GetExceptionsParams {
  ownerId: string;
  date: string; // Format attendu : YYYY-MM-DD
}

export interface CreateExceptionData {
  date?: string;        // Format attendu : YYYY-MM-DD (pour un jour précis)
  dateStart?: string;   // Format attendu : YYYY-MM-DD (pour un intervalle)
  dateEnd?: string;     // Format attendu : YYYY-MM-DD (pour un intervalle)
  startTime?: string;   // Ex: "10:00"
  endTime?: string;     // Ex: "16:00"
  reason?: string;      // Ex: "Vacances" ou "Rendez-vous"
}

export interface CreateAvailabilityData {
  date: string;       // Format attendu : YYYY-MM-DD
  startTime: string;  // Ex: "11:00"
  endTime: string;    // Ex: "13:00"
}

export interface GetAvailabilitiesFilters {
  ownerId?: string;
  date?: string;      // Format attendu : YYYY-MM-DD
  startTime?: string;
  endTime?: string;
  page?: number | string;
  limit?: number | string;
}

/**
 * Service gérant les appels API pour l'agenda (Réservations et Exceptions de disponibilité).
 */
export const agendaService = {

  /**
   * Récupère la liste des heures disponibles pour visiter un bien à une date précise.
   * Cette fonction croise automatiquement les disponibilités, les exceptions et les réservations.
   * Retourne un tableau d'heures (ex: ["08:30", "09:00", "14:00"]).
   */
  getAvailableHours: async (params: GetAvailableHoursParams) => {
    const queryParams = new URLSearchParams({
      propertyId: params.propertyId,
      date: params.date,
    });

    const response = await fetchApi(`/api/agenda/rules/available-hours?${queryParams.toString()}`, {
      method: 'GET',
    });
    
    return response;
  },

  // ==========================================
  // DISPONIBILITÉS (RÈGLES)
  // ==========================================

  /**
   * Crée une nouvelle disponibilité (plage horaire ouverte pour les visites)
   */
  createAvailability: async (data: CreateAvailabilityData) => {
    const response = await fetchApi('/api/agenda/rules', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  },

  /**
   * Récupère la liste des disponibilités avec des filtres dynamiques et pagination
   */
  getAvailabilities: async (filters: GetAvailabilitiesFilters = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, String(value));
      }
    });

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/api/agenda/rules?${queryString}` : '/api/agenda/rules';

    const response = await fetchApi(endpoint, {
      method: 'GET',
    });
    return response;
  },

  /**
   * Récupère une disponibilité spécifique par son ID
   */
  getAvailabilityById: async (id: string) => {
    const response = await fetchApi(`/api/agenda/rules/${id}`, {
      method: 'GET',
    });
    return response;
  },

  /**
   * Met à jour une disponibilité existante (vérifie les chevauchements côté serveur)
   */
  updateAvailability: async (id: string, updateData: UpdateAvailabilityData) => {
    const response = await fetchApi(`/api/agenda/rules/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
    return response;
  },

  /**
   * Supprime une disponibilité par son ID
   */
  deleteAvailability: async (id: string) => {
    const response = await fetchApi(`/api/agenda/rules/${id}`, {
      method: 'DELETE',
    });
    return response;
  },

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
  /**
   * Crée une nouvelle exception de disponibilité (bloquer un créneau horaire ou un intervalle de jours)
   */
  createException: async (data: CreateExceptionData) => {
    const response = await fetchApi('/api/agenda/exception', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  },

  /**
   * Récupère les plages bloquées (exceptions) d'un propriétaire pour une date donnée.
   * Retourne "ALL_DAY" si toute la journée est bloquée, ou un tableau d'heures (ex: ["10:00", "10:30"]).
   */
  getExceptionAvailableHours: async (params: GetExceptionsParams) => {
    const queryParams = new URLSearchParams({
      ownerId: params.ownerId,
      date: params.date,
    });

    const response = await fetchApi(`/api/agenda/exception/available-hours?${queryParams.toString()}`, {
      method: 'GET',
    });
    
    return response;
  },

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