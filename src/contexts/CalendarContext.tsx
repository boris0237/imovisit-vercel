"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { agendaService } from '@/services/agendaService';

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
  // ... autres champs
}

export interface Exception {
  id: string;
  date: string; // YYYY-MM-DD
  isAvailable: boolean;
  startTime?: string;
  endTime?: string;
}

interface CalendarContextType {
  // --- ÉTATS ---
  currentDate: Date;           // La date de référence (ex: pour afficher le mois actuel)
  selectedDate: Date | null;   // Le jour cliqué par l'utilisateur
  viewMode: ViewMode;          // Vue actuelle (Mois, Semaine, Jour)
  reservations: Reservation[]; // Liste des réservations chargées
  exceptions: Exception[];     // Liste des exceptions chargées
  isLoading: boolean;          // État de chargement global

  // --- ACTIONS ---
  setCurrentDate: (date: Date) => void;
  setSelectedDate: (date: Date | null) => void;
  setViewMode: (mode: ViewMode) => void;
  nextPeriod: () => void;      // Avancer d'un mois/semaine
  prevPeriod: () => void;      // Reculer d'un mois/semaine
  refreshData: () => Promise<void>; 
  blockSlot: (date: string, startTime: string, endTime: string) => Promise<void>; // Action pour bloquer un créneau
  
  // --- OUTILS ---
  getSlotStatus: (date: string, time: string) => 'AVAILABLE' | 'BLOCKED' | 'RESERVED' | 'PAST';
}

// ==========================================================
// 2. CRÉATION DU CONTEXTE
// ==========================================================

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

// ==========================================================
// 3. PROVIDER
// ==========================================================

export function CalendarProvider({ children, propertyId }: { children: ReactNode, propertyId?: string }) {
  // États de l'UI
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');

  // États des Données
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [exceptions, setExceptions] = useState<Exception[]>([]);
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

  // --- CHARGEMENT DES DONNÉES ---
  const refreshData = async () => {
    setIsLoading(true);
    try {
      // TODO: Connecter avec agendaService
      // const resData = await agendaService.getReservations({ propertyId, month: currentDate.getMonth() });
      // setReservations(resData.data.reservations);
      
      // Simulation pour l'instant :
      setTimeout(() => setIsLoading(false), 500);
    } catch (error) {
      toast.error("Erreur lors du chargement de l'agenda");
      setIsLoading(false);
    }
  };

  // Recharger les données si le mois ou la propriété change
  useEffect(() => {
    refreshData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate.getMonth(), propertyId]); 

  // --- ACTIONS MÉTIER ---
  const blockSlot = async (date: string, startTime: string, endTime: string) => {
    // 1. Mise à jour Optimiste (On met à jour l'UI tout de suite)
    const tempException: Exception = {
      id: Math.random().toString(),
      date,
      startTime,
      endTime,
      isAvailable: true
    };
    setExceptions(prev => [...prev, tempException]);

    // 2. Appel API réel
    try {
      // await agendaService.createException({ date, startTime, endTime });
      toast.success("Créneau bloqué avec succès");
      console.log("Créneau bloqué avec succès");
      refreshData();
    } catch (error) {
      // En cas d'erreur, on annule la mise à jour optimiste
      setExceptions(prev => prev.filter(exc => exc.id !== tempException.id));
      toast.error("Impossible de bloquer ce créneau");
      console.log("Impossible de bloquer ce créneau");
    }
  };

  // --- LOGIQUE DE FUSION DES 3 COUCHES ---
  const getSlotStatus = (dateString: string, timeString: string) => {
    // 1. Est-ce que la date est passée ?
    const slotDate = new Date(`${dateString}T${timeString}`);
    if (slotDate < new Date()) return 'PAST';

    // 2. Est-ce réservé ?
    const isReserved = reservations.some(res => 
      res.date === dateString && 
      timeString >= res.startTime && 
      timeString < res.endTime &&
      res.status !== 'cancelled'
    );
    if (isReserved) return 'RESERVED';

    // 3. Est-ce bloqué par une exception spécifique ?
    const isBlocked = exceptions.some(exc => 
      exc.date === dateString && 
      !exc.isAvailable &&
      (!exc.startTime || (timeString >= exc.startTime && timeString < exc.endTime!))
    );
    if (isBlocked) return 'BLOCKED';

    // (TODO : 4. Est-ce dans les disponibilités récurrentes de base ?)

    return 'AVAILABLE';
  };

  // Objet de valeur fourni au contexte
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
    isLoading,
    refreshData,
    blockSlot,
    getSlotStatus
  };

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
}

// ==========================================================
// 4. HOOK PERSONNALISÉ (Pour utiliser le contexte facilement)
// ==========================================================

export function useCalendar() {
  const context = useContext(CalendarContext);
  if (context === undefined) {
    throw new Error("useCalendar doit être utilisé à l'intérieur d'un CalendarProvider");
  }
  return context;
}