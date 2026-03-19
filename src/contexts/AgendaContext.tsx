"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { agendaService } from '@/services/agendaService';
import { fetchApi } from '@/services/apiConfig';

// ==========================================================
// 1. TYPAGES
// ==========================================================

export type ViewMode = 'day' | 'week' | 'month';

export interface Reservation {
  id: string;
  propertyId: string;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  visitType: 'in_person' | 'remote';
  client?: { name: string };
}

export interface Exception {
  id: string;
  date: string; // YYYY-MM-DD
  isAvailable: boolean;
  startTime?: string;
  endTime?: string;
}

export interface AvailabilityRule {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
}

interface AgendaContextType {
  // --- ÉTATS ---
  currentDate: Date;
  selectedDate: Date | null;
  viewMode: ViewMode;
  reservations: Reservation[];
  exceptions: Exception[];
  availabilities: AvailabilityRule[]; // Ajout des règles de dispo
  isLoading: boolean;

  // --- ACTIONS ---
  setCurrentDate: (date: Date) => void;
  setSelectedDate: (date: Date | null) => void;
  setViewMode: (mode: ViewMode) => void;
  nextPeriod: () => void;
  prevPeriod: () => void;
  refreshData: () => Promise<void>;
  blockSlot: (date: string, startTime: string, endTime: string, reason?: string) => Promise<void>;
  createAvailability: (date: string, startTime: string, endTime: string) => Promise<void>;

  // --- OUTILS ---
  getSlotStatus: (date: string, time: string) => 'AVAILABLE' | 'BLOCKED' | 'RESERVED' | 'PAST';
}

// ==========================================================
// 2. CRÉATION DU CONTEXTE
// ==========================================================

const AgendaContext = createContext<AgendaContextType | undefined>(undefined);

// ==========================================================
// 3. PROVIDER
// ==========================================================

export function AgendaProvider({ children, propertyId, ownerId }: { children: ReactNode, propertyId?: string, ownerId?: string }) {
  // États de l'UI
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');

  // États des Données
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [exceptions, setExceptions] = useState<Exception[]>([]);
  const [availabilities, setAvailabilities] = useState<AvailabilityRule[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // --- NAVIGATION ---
  const nextPeriod = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') newDate.setMonth(newDate.getMonth() + 1);
    if (viewMode === 'week') newDate.setDate(newDate.getDate() + 7);
    if (viewMode === 'day') newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const prevPeriod = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') newDate.setMonth(newDate.getMonth() - 1);
    if (viewMode === 'week') newDate.setDate(newDate.getDate() - 7);
    if (viewMode === 'day') newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  // --- CHARGEMENT DES DONNÉES DEPUIS L'API ---
  const refreshData = async () => {
    setIsLoading(true);

    try {
      if (!ownerId) {
        console.warn("ownerId est manquant");
        return;
      } else {
        console.log("ownerId :", ownerId);
      }

      // 1. Lancement des requêtes API en parallèle
      const [resResponse, rulesResponse, excResponse] = await Promise.all([
        agendaService.getReservations({ propertyId, limit: 100 }),
        agendaService.getAvailabilities({ ownerId, limit: 100 }),

        // ⚠️ Ici on utilise directement fetchApi car tu n'as pas de fonction 'getAllExceptions' 
        // dans ton agendaService (seulement 'getExceptionAvailableHours' qui renvoie un format réduit pour 1 jour)
        fetchApi(`/api/agenda/exception?ownerId=${ownerId}&limit=100`, { method: 'GET' })
      ]);

      // --- LOGS (à retirer en prod) ---
      console.log('1. Réservations :', resResponse);
      console.log('2. Disponibilités :', rulesResponse);
      console.log('3. Exceptions :', excResponse);

      // 2. MÀJ Réservations
      if (resResponse?.data?.reservations) {
        setReservations(resResponse.data.reservations);
      } else {
        setReservations([]);
      }

      // 3. MÀJ Disponibilités
      if (rulesResponse?.data?.rules) {
        const formattedRules = rulesResponse.data.rules.map((rule: any) => ({
          ...rule,
          date: rule.date ? new Date(rule.date).toISOString().split('T')[0] : ''
        }));
        setAvailabilities(formattedRules);
      } else {
        setAvailabilities([]);
      }

      // 4. MÀJ Exceptions
      const exceptionsList = excResponse?.data?.exceptions || excResponse?.data || [];
      if (Array.isArray(exceptionsList)) {
        const formattedExceptions = exceptionsList.map((exc: any) => {
          const baseDate = exc.date || exc.dateStart;
          const formattedDate = baseDate ? new Date(baseDate).toISOString().split('T')[0] : '';

          return {
            id: exc.id,
            date: formattedDate,
            isAvailable: false,
            startTime: exc.startTime,
            endTime: exc.endTime
          };
        });
        setExceptions(formattedExceptions);
      } else {
        setExceptions([]);
      }

    } catch (error) {
      console.error("Erreur de synchronisation API:", error);
      toast.error("Impossible de récupérer les données du calendrier.");
    } finally {
      setIsLoading(false);
    }
  };

  // Recharger les données quand on change de mois ou de contexte
  useEffect(() => {
    refreshData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate.getMonth(), currentDate.getFullYear(), propertyId, ownerId]);

  // --- ACTIONS MÉTIER ---

  // Bloquer un créneau (Exception)
  const blockSlot = async (date: string, startTime: string, endTime: string, reason: string = "Indisponible") => {
    const tempId = `temp-${Date.now()}`;
    setExceptions(prev => [...prev, { id: tempId, date, startTime, endTime, isAvailable: false }]);

    try {
      const response = await agendaService.createException({ date, startTime, endTime, reason });
      if (response.status === 201) {
        toast.success("Créneau bloqué avec succès");
        refreshData();
      } else {
        throw new Error(response.message || "Erreur lors de la création");
      }
    } catch (error) {
      setExceptions(prev => prev.filter(exc => exc.id !== tempId));
      toast.error("Impossible de bloquer ce créneau");
    }
  };

  // Créer une disponibilité
  const createAvailability = async (date: string, startTime: string, endTime: string) => {
    try {
      const response = await agendaService.createAvailability({ date, startTime, endTime });
      if (response.status === 201) {
        toast.success("Disponibilité ajoutée !");
        refreshData();
      } else {
        toast.error(response.message || "Erreur");
      }
    } catch (error) {
      toast.error("Erreur lors de l'ajout de la disponibilité");
    }
  };

  const normalizeDateFromBackend = (date: any): string => {
    if (!date) return ''

    if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return date
    }

    const dateObj = new Date(date)
    const year = dateObj.getFullYear()
    const month = String(dateObj.getMonth() + 1).padStart(2, '0')
    const day = String(dateObj.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // --- LOGIQUE DE FUSION ---
  
 
const getSlotStatus = (dateString: string, timeString: string): 'AVAILABLE' | 'BLOCKED' | 'RESERVED' | 'PAST' => {
  
  // ========================================================
  // 1. VÉRIFIER SI LE CRÉNEAU EST DANS LE PASSÉ
  // ========================================================
  const slotDate = new Date(`${dateString}T${timeString}`)
  if (slotDate < new Date()) return 'PAST'
 
  // ========================================================
  // 2. VÉRIFIER SI LE CRÉNEAU EST RÉSERVÉ
  // ========================================================
  const isReserved = reservations.some(res => {
    // 🔥 CORRECTION : Normaliser la date de la réservation
    const resDate = typeof res.date === 'string' && res.date.match(/^\d{4}-\d{2}-\d{2}$/)
      ? res.date
      : new Date(res.date).toISOString().split('T')[0]
    
    return (
      resDate === dateString &&
      timeString >= res.startTime &&
      timeString < res.endTime &&
      res.status !== 'cancelled'
    )
  })
  
  if (isReserved) return 'RESERVED'
 
  // ========================================================
  // 3. VÉRIFIER SI LE CRÉNEAU EST BLOQUÉ PAR UNE EXCEPTION
  // ========================================================
  const isBlocked = exceptions.some(exc => {
    // 🔥 CORRECTION : Normaliser la date de l'exception
    const excDate = exc.date 
      ? (typeof exc.date === 'string' && exc.date.match(/^\d{4}-\d{2}-\d{2}$/)
          ? exc.date
          : new Date(exc.date).toISOString().split('T')[0])
      : null
    
    // Vérifier si l'exception concerne cette date
    if (excDate !== dateString) return false
    
    // Si isAvailable === false, c'est un blocage
    if (exc.isAvailable !== false) return false
    
    // Si pas d'horaire spécifié, toute la journée est bloquée
    if (!exc.startTime || !exc.endTime) return true
    
    // Sinon vérifier si l'heure est dans la plage bloquée
    return timeString >= exc.startTime && timeString < exc.endTime
  })
  
  if (isBlocked) return 'BLOCKED'
 
  // ========================================================
  // 4. VÉRIFIER SI LE CRÉNEAU EST DANS LES DISPONIBILITÉS
  // ========================================================
  const isAvailable = availabilities.some(rule => {
    // 🔥 CORRECTION : Normaliser la date de la règle
    const ruleDate = typeof rule.date === 'string' && rule.date.match(/^\d{4}-\d{2}-\d{2}$/)
      ? rule.date
      : new Date(rule.date).toISOString().split('T')[0]
    
    return (
      ruleDate === dateString &&
      timeString >= rule.startTime &&
      timeString < rule.endTime
    )
  })
 
  // ========================================================
  // 5. LOGIQUE FINALE
  // ========================================================
  // Si une règle de disponibilité existe pour ce créneau → AVAILABLE
  // Sinon → BLOCKED (par défaut tout est bloqué sauf si explicitement disponible)
  return isAvailable ? 'BLOCKED' : 'AVAILABLE'
}

  const value = {
    currentDate,
    setCurrentDate,
    selectedDate,
    setSelectedDate,
    viewMode,
    setViewMode,
    nextPeriod,
    prevPeriod,
    reservations,
    exceptions,
    availabilities,
    isLoading,
    refreshData,
    blockSlot,
    createAvailability,
    getSlotStatus
  };

  return (
    <AgendaContext.Provider value={value}>
      {children}
    </AgendaContext.Provider>
  );
}

// ==========================================================
// 4. HOOK PERSONNALISÉ
// ==========================================================

export function useAgenda() {
  const context = useContext(AgendaContext);
  if (context === undefined) {
    throw new Error("useAgenda doit être utilisé à l'intérieur d'un AgendaProvider");
  }
  return context;
}