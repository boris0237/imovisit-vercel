"use client"

import { useMemo, useState, useEffect } from 'react'
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  X,
  Users,
  Video,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAgenda, ViewMode } from '@/contexts/AgendaContext'
import MyAvalability from '@/forms/availabilityForm'
import { useAuth } from '@/contexts/AuthContext'

export default function AgendaPage() {

  const { user } = useAuth()
  useEffect(() => {
    if (user) {
      setAvailabilityModal(false)
    }
  }, [user]);
  // ========================================================
  // 1. RÉCUPÉRATION DES DONNÉES DU CONTEXTE
  // ========================================================
  const {
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
    getSlotStatus,
    blockSlot,
    createAvailability,
    isLoading,
    refreshData
  } = useAgenda()

  // ========================================================
  // 2. ÉTATS LOCAUX
  // ========================================================
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [availabilityModal, setAvailabilityModal] = useState(true)
  const [selectedCell, setSelectedCell] = useState<{
    date: string
    hour: string
    endHour: string
    type: 'available' | 'reserved' | 'blocked'
    reservation?: any
  } | null>(null)

  // ========================================================
  // 3. UTILITAIRES
  // ========================================================

  /**
   * Formater une date JS en 'YYYY-MM-DD'
   */
  const formatDateStr = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  /**
   * Calculer l'heure de fin (ajoute 30 minutes)
   */
  const calculateEndHour = (startHour: string): string => {
    const [h, m] = startHour.split(':').map(Number)
    const date = new Date()
    date.setHours(h, m + 30, 0, 0)
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  }

  /**
   * Vérifier si une date est aujourd'hui
   */
  const isToday = (dateStr: string): boolean => {
    return dateStr === formatDateStr(new Date())
  }

  /**
   * Normaliser les dates venant du backend (qui peuvent être des objets Date ou des strings)
   */
  const normalizeDateFromBackend = (date: any): string => {
    if (!date) return ''

    // Si c'est déjà un string YYYY-MM-DD, on le retourne tel quel
    if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return date
    }

    // Sinon on le convertit en Date puis en string
    const dateObj = new Date(date)
    return formatDateStr(dateObj)
  }

  // ========================================================
  // 4. GÉNÉRATION DES HEURES (8h -> 18h par tranches de 30min)
  // ========================================================
  const hours = useMemo(() => {
    const start = 8
    const end = 18
    const hoursList: string[] = []

    for (let hour = start; hour <= end; hour++) {
      hoursList.push(`${String(hour).padStart(2, '0')}:00`)
      if (hour < end) {
        hoursList.push(`${String(hour).padStart(2, '0')}:30`)
      }
    }

    return hoursList
  }, [])

  // ========================================================
  // 5. GÉNÉRATION DES JOURS DE LA SEMAINE
  // ========================================================
  const weekDays = useMemo(() => {
    const startOfWeek = new Date(currentDate)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1) // Lundi = 1er jour
    startOfWeek.setDate(diff)

    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(startOfWeek)
      d.setDate(startOfWeek.getDate() + i)
      const dateStr = formatDateStr(d)

      // Vérifier si la journée est bloquée par une exception (sans horaire = toute la journée)
      const isDayBlocked = exceptions.some(exc => {
        const excDate = normalizeDateFromBackend(exc.date)
        return excDate === dateStr && exc.isAvailable === false && !exc.startTime
      })

      const label = d.toLocaleDateString('fr-FR', { weekday: 'short' })

      return {
        label: label.charAt(0).toUpperCase() + label.slice(1, 3),
        date: d.getDate(),
        fullDate: dateStr,
        blocked: isDayBlocked,
        isWeekend: d.getDay() === 0 || d.getDay() === 6
      }
    })
  }, [currentDate, exceptions])

  // ========================================================
  // 6. GÉNÉRATION DES JOURS DU MOIS
  // ========================================================
  const monthDays = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    let startingDay = firstDay.getDay()
    if (startingDay === 0) startingDay = 7

    const days: any[] = []

    const createDayObj = (d: Date, isCurrentMonth: boolean) => {
      const dateStr = formatDateStr(d)
      const isWeekend = d.getDay() === 0 || d.getDay() === 6

      // Compter les réservations non-annulées
      const dailyResCount = reservations.filter(r => {
        const resDate = normalizeDateFromBackend(r.date)
        return resDate === dateStr && r.status !== 'cancelled'
      }).length

      // Vérifier si bloqué
      const isDayBlocked = exceptions.some(exc => {
        const excDate = normalizeDateFromBackend(exc.date)
        return excDate === dateStr && exc.isAvailable === false && !exc.startTime
      })

      return {
        date: d.getDate(),
        fullDate: dateStr,
        weekend: isWeekend,
        badge: dailyResCount > 0 ? dailyResCount : undefined,
        blocked: isDayBlocked,
        isCurrentMonth
      }
    }

    // Jours du mois précédent
    for (let i = startingDay - 1; i > 0; i--) {
      days.push(createDayObj(new Date(year, month, 1 - i), false))
    }

    // Jours du mois actuel
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(createDayObj(new Date(year, month, i), true))
    }

    // Jours du mois suivant
    const remainingCells = 42 - days.length
    for (let i = 1; i <= remainingCells; i++) {
      days.push(createDayObj(new Date(year, month + 1, i), false))
    }

    return days
  }, [currentDate, reservations, exceptions])

  // ========================================================
  // 7. RÉSERVATIONS DU JOUR SÉLECTIONNÉ
  // ========================================================
  const dayVisits = useMemo(() => {
    const targetDate = selectedDate || currentDate
    const targetDateStr = formatDateStr(targetDate)

    return reservations
      .filter(res => {
        const resDate = normalizeDateFromBackend(res.date)
        return resDate === targetDateStr
      })
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
      .map(res => ({
        id: res.id,
        time: res.startTime,
        name: res.client?.name || 'Client',
        property: `Bien ID: ${res.propertyId.slice(-4)}`,
        type: res.visitType === 'in_person' ? 'Présentiel' : 'Distance',
        status: res.status,
      }))
  }, [currentDate, selectedDate, reservations])

  // ========================================================
  // 8. TITRE DYNAMIQUE DE L'EN-TÊTE
  // ========================================================
  const headerTitle = useMemo(() => {
    if (viewMode === 'day') {
      return currentDate.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    }
    if (viewMode === 'week') {
      return `Semaine du ${currentDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}`
    }
    return currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  }, [viewMode, currentDate])

  // ========================================================
  // 9. GESTION DU BLOCAGE DE CRÉNEAU
  // ========================================================
  const handleBlockSlot = async () => {
    setSelectedCell(prev => {
      if (!prev) return null
      return {
        ...prev,
        type: 'blocked'
      }
    })
    if (!selectedCell) return

    try {
      await blockSlot(selectedCell.date, selectedCell.hour, selectedCell.endHour, 'Indisponible')

      // 2. 🔥 CORRECTION : Recharger les données depuis le backend
      await refreshData()

      // Mettre à jour l'état de la cellule
      setSelectedCell(prev => {
        if (!prev) return null
        return { ...prev, type: 'blocked' }
      })
    } catch (error) {
      console.error('Erreur lors du blocage:', error)
    }
  }

  const handleUnblockSlot = async () => {
    if (!selectedCell) return

    try {
      // Trouver l'exception correspondante
      const exception = exceptions.find(exc => {
        const excDate = normalizeDateFromBackend(exc.date)
        return (
          excDate === selectedCell.date &&
          exc.startTime === selectedCell.hour &&
          exc.endTime === selectedCell.endHour
        )
      })

      if (!exception) return

      // Supprimer l'exception via l'API
      await fetch(`/api/agenda/exception/${exception.id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      // Recharger les données
      await refreshData()

      // Fermer la modale
      setSelectedCell(null)

    } catch (error) {
      console.error('❌ Erreur lors du déblocage:', error)
    }
  }

  // ========================================================
  // 10. RENDU
  // ========================================================
  return (
    <div className="relative flex-1">
      {/* ========================================================
          HEADER
          ======================================================== */}
      <header className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Calendrier des visites</h1>
            <p className="text-sm text-slate-500">Gérez vos disponibilités et les demandes de visite</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            {/* Sélecteur de vue */}
            <div className="inline-flex rounded-xl bg-slate-100 p-1 text-sm">
              {([
                { key: 'day', label: 'Jour' },
                { key: 'week', label: 'Semaine' },
                { key: 'month', label: 'Mois' },
              ] as const).map((item) => (
                <button
                  key={item.key}
                  onClick={() => setViewMode(item.key)}
                  className={`px-6 py-2 rounded-lg transition-colors ${viewMode === item.key
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500'
                    }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <Button className="bg-slate-900 hover:bg-slate-800 gap-2" onClick={() => setAvailabilityModal(true)}>
              <Clock className="w-4 h-4" />
              Mes disponibilités
            </Button>
          </div>
        </div>
      </header>

      {/* ========================================================
          NAVIGATION
          ======================================================== */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-4 text-slate-700">
            <button
              onClick={prevPeriod}
              className="h-10 w-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <h2 className="text-lg font-semibold text-slate-900 capitalize">
              {headerTitle}
            </h2>

            <button
              onClick={nextPeriod}
              className="h-10 w-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors active:scale-95"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setCurrentDate(new Date())}
            className="text-sm font-medium text-slate-500 hover:text-[#1a2b4b] transition-colors px-4 py-2 rounded-lg hover:bg-slate-50"
          >
            Aujourd&apos;hui
          </button>
        </div>

        {/* ========================================================
            VUE JOUR
            ======================================================== */}
        {viewMode === 'day' && (
          <div className="py-8">
            {isLoading ? (
              <div className="text-center py-16 text-slate-500">Chargement...</div>
            ) : dayVisits.length === 0 ? (
              <div className="py-16 flex flex-col items-center text-center text-slate-500 animate-in fade-in">
                <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center mb-6">
                  <Calendar className="w-10 h-10" />
                </div>
                <p className="text-lg font-semibold text-slate-400">Aucune visite prévue ce jour</p>
                <button className="mt-2 text-[#1a2b4b] font-bold hover:underline">
                  Définir les disponibilités
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4">
                <h3 className="text-lg font-bold text-[#1a2b4b] mb-2 border-b border-slate-100 pb-2">
                  {dayVisits.length} visite{dayVisits.length > 1 ? 's' : ''} prévue{dayVisits.length > 1 ? 's' : ''}
                </h3>

                {dayVisits.map((visit) => (
                  <Card
                    key={visit.id}
                    className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow bg-white"
                  >
                    <CardContent className="p-6 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                      <div className="flex flex-col gap-3 min-w-[140px]">
                        <div className="flex items-center gap-2 text-[#1a2b4b] font-extrabold text-2xl">
                          <Clock className="w-6 h-6 text-slate-400" />
                          {visit.time}
                        </div>
                        {visit.status === 'confirmed' ? (
                          <Badge className="bg-emerald-100 text-emerald-700 border-0 w-fit px-3 py-1">
                            <Check className="w-3 h-3 mr-1" /> Confirmé
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-100 text-amber-700 border-0 w-fit px-3 py-1">
                            En attente
                          </Badge>
                        )}
                      </div>

                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                          {visit.name}
                        </h4>
                        <p className="text-slate-500 font-medium mt-1">{visit.property}</p>

                        <div className="flex items-center gap-3 mt-4">
                          <Badge className="bg-slate-100 text-slate-600 border-0 px-2.5 py-1">
                            {visit.type === 'Présentiel' ? (
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" /> Présentiel
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <Video className="w-3 h-3" /> À distance
                              </span>
                            )}
                          </Badge>
                          <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                            Réf: #{visit.id.slice(-5).toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto mt-4 md:mt-0">
                        <Button className="w-full md:w-auto bg-[#1a2b4b] hover:bg-[#121d33] text-white">
                          Voir détails
                        </Button>
                        <Button variant="outline" className="w-full md:w-auto text-slate-600 border-slate-200">
                          Contacter
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            VUE SEMAINE
            ======================================================== */}
        {viewMode === 'week' && (
          <div className="mt-6 animate-in fade-in">
            <Card className="border-slate-200 shadow-sm bg-white">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  {/* En-tête des jours */}
                  <div
                    className="grid text-sm text-slate-500 border-b border-slate-200 min-w-[860px]"
                    style={{ gridTemplateColumns: '90px repeat(7, minmax(0, 1fr))' }}
                  >
                    <div className="py-4 pl-6 font-medium flex items-center">Heure</div>
                    {weekDays.map((day) => (
                      <div key={day.fullDate} className="py-4 text-center font-medium text-slate-700">
                        <div className="uppercase text-xs tracking-wider mb-1">{day.label}</div>
                        <div
                          className={`text-xl font-bold ${day.blocked ? 'text-rose-500' : 'text-slate-900'
                            }`}
                        >
                          {day.date}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Corps de la grille */}
                  <div
                    className="grid gap-y-4 p-4 min-w-[860px]"
                    style={{ gridTemplateColumns: '90px repeat(7, minmax(0, 1fr))' }}
                  >
                    {hours.map((hour) => (
                      <div key={hour} className="contents">
                        <div className="text-sm font-semibold text-slate-500 py-3 pl-2 flex items-start">
                          {hour}
                        </div>

                        {weekDays.map((day) => {
                          // 🔥 CORRECTION 1: Récupérer le statut AVANT toute condition
                          const status = getSlotStatus(day.fullDate, hour)
                          const endHour = calculateEndHour(hour)

                          // 🔥 CORRECTION 2: Normaliser la date de la réservation
                          const res = reservations.find(r => {
                            const resDate = normalizeDateFromBackend(r.date)
                            return resDate === day.fullDate && r.startTime === hour
                          })

                          // 🔥 CORRECTION 3: Vérifier PASSÉ en premier
                          if (status === 'PAST') {
                            return (
                              <div key={`${day.fullDate}-${hour}`} className="px-2">
                                <div className="h-12 w-full rounded-lg bg-slate-100 border border-slate-200 text-slate-400 text-[11px] flex items-center justify-center opacity-50">
                                  Passé
                                </div>
                              </div>
                            )
                          }

                          // 🔥 CORRECTION 4: Vérifier RÉSERVÉ avec normalisation
                          if (status === 'RESERVED' && res) {
                            const isPending = res.status === 'pending'
                            return (
                              <div key={`${day.fullDate}-${hour}`} className="px-2">
                                <button
                                  onClick={() =>
                                    setSelectedCell({
                                      date: day.fullDate,
                                      hour,
                                      endHour,
                                      type: 'reserved',
                                      reservation: res
                                    })
                                  }
                                  className={`h-12 w-full rounded-lg border text-[11px] px-3 py-1 flex flex-col justify-center text-left transition-colors cursor-pointer ${isPending
                                    ? 'border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-600'
                                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600'
                                    }`}
                                >
                                  <div className="flex items-center gap-1.5 font-bold mb-0.5">
                                    <Clock className="w-3 h-3" />
                                    {hour}
                                  </div>
                                  <div
                                    className={`truncate ${isPending ? 'text-orange-700' : 'text-slate-800'
                                      } font-semibold`}
                                  >
                                    {res.client?.name || 'Client'}
                                  </div>
                                </button>
                              </div>
                            )
                          }

                          // 🔥 CORRECTION 5: BLOQUÉ (journée complète OU exception horaire)
                          if (status === 'BLOCKED') {
                            return (
                              <div key={`${day.fullDate}-${hour}`} className="px-2">
                                <button
                                  onClick={() =>
                                    setSelectedCell({
                                      date: day.fullDate,
                                      hour,
                                      endHour,
                                      type: 'blocked'
                                    })
                                  }
                                  className="h-12 w-full rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-500 text-[11px] flex items-center justify-center gap-2 transition-colors cursor-pointer"
                                >
                                  <span className="h-4 w-4 rounded-full border border-rose-400 flex items-center justify-center text-[10px]">
                                    ✕
                                  </span>
                                  Bloqué
                                </button>
                              </div>
                            )
                          }

                          // 🔥 CORRECTION 6: DISPONIBLE (par défaut ou règle explicite)
                          return (
                            <div key={`${day.fullDate}-${hour}`} className="px-2">
                              <button
                                onClick={() =>
                                  setSelectedCell({
                                    date: day.fullDate,
                                    hour,
                                    endHour,
                                    type: 'available'
                                  })
                                }
                                className="h-12 w-full rounded-lg border border-dashed border-emerald-300 bg-emerald-50/30 hover:bg-emerald-50/80 text-emerald-500 flex items-center justify-center transition-colors"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            {selectedCell && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl animate-in zoom-in-95">

                  {/* HEADER */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-[#1a2b4b]">
                      {selectedCell.type === 'reserved' && "Détails de la réservation"}
                      {selectedCell.type === 'blocked' && "Créneau bloqué"}
                    </h3>
                    <button
                      onClick={() => setSelectedCell(null)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* INFO DATE/HEURE */}
                  <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-sm font-semibold text-slate-500 mb-1">Date et heure</p>
                    <p className="text-[#1a2b4b] font-bold text-lg">
                      Le {new Date(selectedCell.date).toLocaleDateString('fr-FR')} à {selectedCell.hour}{' '}
                      jusqu&apos;à {selectedCell.endHour}
                    </p>
                  </div>

                  {/* CONTENU DYNAMIQUE SELON LE TYPE */}

                  {/* 🟢 DISPONIBLE */}
                  {selectedCell.type === 'available' && (
                    <div className="space-y-3">
                      <p className="text-sm text-slate-600 mb-4">
                        Ce créneau est actuellement disponible. Souhaitez-vous le bloquer exceptionnellement ?
                      </p>
                      <Button
                        onClick={async () => {
                          await handleBlockSlot()
                          // 🔥 La modale reste ouverte mais change de type grâce au setSelectedCell dans handleBlockSlot
                        }}
                        className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold"
                      >
                        Bloquer ce créneau
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setSelectedCell(null)}
                        className="w-full"
                      >
                        Annuler
                      </Button>
                    </div>
                  )}

                  {/* 🟠 RÉSERVÉ */}
                  {selectedCell.type === 'reserved' && selectedCell.reservation && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Badge
                          className={
                            selectedCell.reservation.status === 'pending'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }
                        >
                          {selectedCell.reservation.status === 'pending'
                            ? 'En attente de confirmation'
                            : 'Confirmé'}
                        </Badge>
                      </div>

                      <div className="text-sm text-slate-600 space-y-2">
                        <p>
                          <strong className="text-slate-900">Client:</strong>{' '}
                          {selectedCell.reservation.client?.name || 'N/A'}
                        </p>
                        <p>
                          <strong className="text-slate-900">Bien:</strong>{' '}
                          {selectedCell.reservation.propertyId}
                        </p>
                        <p>
                          <strong className="text-slate-900">Type:</strong>{' '}
                          {selectedCell.reservation.visitType === 'in_person' ? 'Présentiel' : 'À distance'}
                        </p>
                      </div>

                      <Button className="w-full bg-[#1a2b4b] hover:bg-[#121d33]">
                        Voir le dossier complet
                      </Button>
                    </div>
                  )}

                  {/* 🔴 BLOQUÉ */}
                  {selectedCell.type === 'blocked' && (
                    <div className="space-y-3">
                      <p className="text-sm text-slate-600 mb-4">
                        Vous avez défini ce créneau comme indisponible.
                      </p>
                      <Button
                        onClick={async () => {
                          await handleUnblockSlot()
                          // 🔥 La modale se ferme automatiquement après déblocage
                        }}
                        variant="outline"
                        className="w-full border-emerald-500 text-emerald-600 hover:bg-emerald-50 font-semibold"
                      >
                        Rendre disponible
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setSelectedCell(null)}
                        className="w-full"
                      >
                        Annuler
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}


        {/* ========================================================
            VUE MOIS
            ======================================================== */}
        {viewMode === 'month' && (
          <div className="mt-6 animate-in fade-in">
            <Card className="border-slate-200 overflow-hidden shadow-sm bg-white">
              <CardContent className="p-0">
                {/* En-tête des jours */}
                <div className="grid grid-cols-7 bg-[#1a2b4b] text-white text-sm">
                  {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((d) => (
                    <div key={d} className="py-3 text-center font-bold tracking-wider">
                      {d}
                    </div>
                  ))}
                </div>

                {/* Grille du calendrier */}
                <div className="grid grid-cols-7">
                  {monthDays.map((day, index) => {
                    const dayReservations = reservations
                      .filter(r => {
                        const resDate = normalizeDateFromBackend(r.date)
                        return resDate === day.fullDate && r.status !== 'cancelled'
                      })
                      .sort((a, b) => a.startTime.localeCompare(b.startTime))

                    const isTodayDate = isToday(day.fullDate)

                    return (
                      <button
                        key={`${day.fullDate}-${index}`}
                        onClick={() => {
                          setSelectedDate(new Date(day.fullDate))
                          setIsPanelOpen(true)
                        }}
                        className={`h-32 border-r border-b border-slate-100 text-left p-2 md:p-3 transition-colors hover:bg-slate-50 relative flex flex-col gap-2 ${!day.isCurrentMonth ? 'bg-slate-50/50 text-slate-400' : 'bg-white'
                          } ${day.weekend ? 'text-rose-500' : 'text-slate-700'}`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span
                            className={`text-sm font-semibold ${isTodayDate
                              ? 'bg-[#1a2b4b] text-white h-7 w-7 rounded-full flex items-center justify-center'
                              : ''
                              }`}
                          >
                            {day.date}
                          </span>

                          {day.badge && (
                            <span className="h-5 w-5 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center shadow-sm">
                              {day.badge}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-col gap-1.5 overflow-y-auto w-full scrollbar-hide">
                          {day.blocked && (
                            <div className="text-[10px] font-semibold border border-rose-200 bg-rose-50 text-rose-600 px-1.5 py-1 rounded truncate flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                              Bloqué
                            </div>
                          )}

                          {!day.blocked &&
                            dayReservations.map((res, i) => {
                              const isPending = res.status === 'pending'
                              return (
                                <div
                                  key={res.id || i}
                                  className={`text-[10px] font-semibold px-1.5 py-1 rounded truncate flex items-center gap-1.5 ${isPending
                                    ? 'border border-orange-200 bg-orange-50 text-orange-600'
                                    : 'border border-slate-200 bg-slate-50 text-slate-600'
                                    }`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isPending ? 'bg-orange-500' : 'bg-emerald-500'
                                      }`}
                                  ></span>
                                  <span className="truncate">{res.startTime} - {res.client?.name || 'Client'}</span>
                                </div>
                              )
                            })}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* ========================================================
          PANNEAU LATÉRAL
          ======================================================== */}
      {isPanelOpen && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-slate-900/30" onClick={() => setIsPanelOpen(false)} />
          <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl flex flex-col">
            <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Détails du jour</h3>
              <Button onClick={() => setIsPanelOpen(false)} className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="p-6 overflow-auto flex-1 space-y-6">
              <div className="text-center">
                <p className="text-5xl font-extrabold text-[#1a2b4b]">
                  {(selectedDate || currentDate).getDate()}
                </p>
                <p className="text-lg font-medium text-slate-500 capitalize mt-1">
                  {(selectedDate || currentDate).toLocaleDateString('fr-FR', {
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>

              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="font-bold text-slate-900">Visites prévues ({dayVisits.length})</h4>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 text-[#1a2b4b] border-slate-200 hover:bg-slate-50"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter
                </Button>
              </div>

              {dayVisits.length === 0 ? (
                <div className="text-center py-10 text-slate-400 font-medium">
                  Aucune visite programmée ce jour.
                </div>
              ) : (
                <div className="space-y-4">
                  {dayVisits.map((visit) => {
                    const realDate = selectedDate || currentDate
                    const dateStr = formatDateStr(realDate)
                    const res = reservations.find(r => r.id === visit.id)
                    const endHour = calculateEndHour(visit.time)

                    return (
                      <Card
                        key={visit.id}
                        onClick={() => {
                          setSelectedCell({
                            date: dateStr,
                            hour: visit.time,
                            endHour,
                            type: 'reserved',
                            reservation: res
                          })
                          setIsPanelOpen(false)
                        }}
                        className="border-slate-200 cursor-pointer hover:border-[#1a2b4b]/30 hover:shadow-md transition-all group bg-white"
                      >
                        <CardContent className="p-5 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-xl font-bold text-[#1a2b4b] group-hover:text-blue-600 transition-colors">
                                {visit.time}
                              </p>
                              <p className="text-sm font-semibold text-slate-700 mt-1">{visit.name}</p>
                              <p className="text-xs text-slate-500">{visit.property}</p>
                            </div>

                            <Badge className="bg-slate-50 text-slate-600 border border-slate-200">
                              {visit.type === 'Présentiel' ? (
                                <span className="flex items-center gap-1 font-medium">
                                  <Users className="w-3.5 h-3.5" /> {visit.type}
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 font-medium">
                                  <Video className="w-3.5 h-3.5" /> {visit.type}
                                </span>
                              )}
                            </Badge>
                          </div>

                          <div>
                            {visit.status === 'confirmed' ? (
                              <Badge className="bg-emerald-100 text-emerald-700 border-0 w-fit px-2 py-1">
                                <Check className="w-3 h-3 mr-1" strokeWidth={3} /> Confirmé
                              </Badge>
                            ) : (
                              <Badge className="bg-amber-100 text-amber-700 border-0 w-fit px-2 py-1 font-semibold">
                                En attente
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50">
              <Button className="w-full bg-[#1a2b4b] hover:bg-[#121d33] text-white gap-2 py-6 rounded-xl font-bold shadow-md transition-colors">
                <Plus className="w-5 h-5" />
                Ajouter une nouvelle visite
              </Button>
            </div>
          </aside>
        </div>
      )}

      <MyAvalability isOpen={availabilityModal} ownerId={user?.id} onClose={() => setAvailabilityModal(!availabilityModal)}/>
    </div>
  )
}
