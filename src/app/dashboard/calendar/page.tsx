"use client"

import { useMemo, useState } from 'react'
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
import { useCalendar, ViewMode } from '@/contexts/CalendarContext';

export default function CalendarPage() {
  // 1. On récupère TOUTES les données utiles depuis notre contexte
  const {
    currentDate,
    setCurrentDate,
    selectedDate, // Pour afficher les détails du jour cliqué dans la sidebar
    setSelectedDate,
    viewMode,
    setViewMode,
    nextPeriod,
    prevPeriod,
    reservations, // Les réservations réelles
    exceptions,
    getSlotStatus,
    blockSlot
  } = useCalendar();

  const [view, setView] = useState<ViewMode>(viewMode);

  // État pour gérer la modale au clic sur une case (Semaine)
  const [selectedCell, setSelectedCell] = useState<{
    date: string;
    hour: string;
    endHour: string;
    type: 'available' | 'reserved' | 'blocked';
    reservation?: any;
  } | null>(null);

  // --- UTILITAIRE : Formater une date JS en 'YYYY-MM-DD' pour comparer avec la BDD
  const formatDateStr = (date: Date) => {
    const d = new Date(date);
    return [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, '0'),
      String(d.getDate()).padStart(2, '0')
    ].join('-');
  };

  // --- 1. GÉNÉRATION DES HEURES (ex: de 08:00 à 18:00) ---
  const hours = useMemo(() => {
    const start = 8;
    const end = 18;

    return Array.from({ length: (end - start) * 2 + 1 }, (_, i) => {
      const hour = start + Math.floor(i / 2);
      const minutes = i % 2 === 0 ? "00" : "30";
      return `${String(hour).padStart(2, "0")}:${minutes}`;
    });
  }, []);
  const [h, m] = selectedCell
    ? selectedCell.hour.split(':').map(Number)
    : [0, 0];
  const date = new Date();
  date.setHours(h);
  date.setMinutes(m + 30);

  const endHour = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

  // --- 2. GÉNÉRATION DES JOURS DE LA SEMAINE (Vue Semaine) ---
  const weekDays = useMemo(() => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Forcer Lundi comme 1er jour
    startOfWeek.setDate(diff);

    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const dateStr = formatDateStr(d);

      // Vérifier si la journée complète est bloquée par une exception
      const isBlocked = exceptions.some(e => e.date === dateStr && !e.isAvailable && !e.startTime);
      const label = d.toLocaleDateString('fr-FR', { weekday: 'short' });

      return {
        label: label.charAt(0).toUpperCase() + label.slice(1, 3), // Lun, Mar...
        date: d.getDate(),
        fullDate: dateStr,
        blocked: isBlocked,
        isWeekend: d.getDay() === 0 || d.getDay() === 6
      };
    });
  }, [currentDate, exceptions]);

  // --- 3. GÉNÉRATION DES JOURS DU MOIS (Vue Mois avec les Badges) ---
  const monthDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    let startingDay = firstDay.getDay();
    if (startingDay === 0) startingDay = 7; // Dimanche devient le 7ème jour

    const days = [];

    // Fonction helper pour créer l'objet jour
    const createDayObj = (d: Date, isCurrentMonth: boolean) => {
      const dateStr = formatDateStr(d);
      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
      // Compter les réservations non-annulées de cette journée
      const dailyResCount = reservations.filter(r => r.date === dateStr && r.status !== 'cancelled').length;
      // Vérifier si la journée est bloquée
      const isBlocked = exceptions.some(e => e.date === dateStr && !e.isAvailable && !e.startTime);

      return {
        date: d.getDate(),
        fullDate: dateStr,
        weekend: isWeekend,
        badge: dailyResCount > 0 ? dailyResCount : undefined,
        blocked: isBlocked,
        isCurrentMonth
      };
    };

    // Jours du mois précédent (pour combler la première ligne de la grille)
    for (let i = startingDay - 1; i > 0; i--) {
      days.push(createDayObj(new Date(year, month, 1 - i), false));
    }
    // Jours du mois actuel
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(createDayObj(new Date(year, month, i), true));
    }
    // Jours du mois suivant (pour finir la grille de 42 cases)
    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      days.push(createDayObj(new Date(year, month + 1, i), false));
    }

    return days;
  }, [currentDate, reservations, exceptions]);

  // --- 4. RÉSERVATIONS DU JOUR SÉLECTIONNÉ (Pour le panneau latéral) ---
  const dayVisits = useMemo(() => {
    // Si on a cliqué sur un jour, on prend celui-là, sinon la date actuelle
    const targetDate = selectedDate || currentDate;
    const targetDateStr = formatDateStr(targetDate);

    return reservations
      .filter(res => res.date === targetDateStr)
      .sort((a, b) => a.startTime.localeCompare(b.startTime)) // Trier chronologiquement
      .map(res => ({
        id: res.id,
        time: res.startTime,
        name: 'Client', // Remplacer plus tard par les infos du client depuis l'API si dispo (ex: res.client.name)
        property: `Bien ID: ${res.propertyId.slice(-4)}`, // En attendant d'avoir le titre du bien
        type: res.visitType === 'in_person' ? 'Présentiel' : 'Distance',
        status: res.status,
      }));
  }, [currentDate, selectedDate, reservations]);

  // États locaux de l'interface
  const [isPanelOpen, setIsPanelOpen] = useState(false)

  // Rendu dynamique du titre de la page (mois ou semaine)
  const headerTitle = useMemo(() => {
    if (viewMode === 'day') {
      return currentDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    }
    if (viewMode === 'week') {
      return `Semaine du ${currentDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}`
    }
    return currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  }, [viewMode, currentDate])

  return (
    <div className="relative flex-1">
      <header className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Calendrier des visites</h1>
            <p className="text-sm text-slate-500">Gérez vos disponibilités et les demandes de visite</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="inline-flex rounded-xl bg-slate-100 p-1 text-sm">
              {([
                { key: 'day', label: 'Jour' },
                { key: 'week', label: 'Semaine' },
                { key: 'month', label: 'Mois' },
              ] as const).map((item) => (
                <button
                  key={item.key}
                  onClick={() => setView(item.key)}
                  className={`px-6 py-2 rounded-lg transition-colors ${view === item.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                    }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <Button className="bg-slate-900 hover:bg-slate-800 gap-2">
              <Clock className="w-4 h-4" />
              Mes disponibilités
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-4 text-slate-700">

            {/* Bouton Précédent */}
            <button
              onClick={prevPeriod}
              className="h-10 w-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Titre Dynamique (ex: Février 2026) */}
            <h2 className="text-lg font-semibold text-slate-900 capitalize">
              {headerTitle}
            </h2>

            {/* Bouton Suivant */}
            <button
              onClick={nextPeriod}
              className="h-10 w-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors active:scale-95"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

          </div>

          {/* Bouton Aujourd'hui */}
          <button
            onClick={() => setCurrentDate(new Date())}
            className="text-sm font-medium text-slate-500 hover:text-[#1a2b4b] transition-colors px-4 py-2 rounded-lg hover:bg-slate-50"
          >
            Aujourd&apos;hui
          </button>
        </div>

        {view === 'day' && (
          <div className="py-8">
            {dayVisits.length === 0 ? (
              // --- ÉTAT VIDE (Ce que tu avais déjà) ---
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
              // --- LISTE DES VISITES DU JOUR ---
              <div className="flex flex-col gap-4 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4">
                <h3 className="text-lg font-bold text-[#1a2b4b] mb-2 border-b border-slate-100 pb-2">
                  {dayVisits.length} visite{dayVisits.length > 1 ? 's' : ''} prévue{dayVisits.length > 1 ? 's' : ''} ce jour
                </h3>

                {dayVisits.map((visit) => (
                  <Card key={visit.id} className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow bg-white">
                    <CardContent className="p-6 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">

                      {/* Colonne 1 : Heure et Statut */}
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

                      {/* Colonne 2 : Détails du visiteur et du bien */}
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                          {visit.name}
                        </h4>
                        <p className="text-slate-500 font-medium mt-1">{visit.property}</p>

                        <div className="flex items-center gap-3 mt-4">
                          <Badge className="bg-slate-100 text-slate-600 border-0 px-2.5 py-1">
                            {visit.type === 'Présentiel' ? (
                              <span className="flex items-center gap-1"><Users className="w-3 h-3" /> Présentiel</span>
                            ) : (
                              <span className="flex items-center gap-1"><Video className="w-3 h-3" /> À distance</span>
                            )}
                          </Badge>
                          {/* Tu pourras ajouter le téléphone du client ici plus tard depuis l'API */}
                          <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                            Réf: #{visit.id.slice(-5).toUpperCase()}
                          </span>
                        </div>
                      </div>

                      {/* Colonne 3 : Actions rapides */}
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

        {view === 'week' && (
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
                        <div className={`text-xl font-bold ${day.blocked ? 'text-rose-500' : 'text-slate-900'}`}>
                          {day.date}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Corps de la grille (Heures x Jours) */}
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
                          // --- LOGIQUE DYNAMIQUE ---
                          const status = getSlotStatus(day.fullDate, hour);
                          const res = reservations.find(r => r.date === day.fullDate && r.startTime === hour);

                          // 1. Si bloqué (journée complète ou exception)
                          if (day.blocked || status === 'BLOCKED') {
                            {console.log("le format envoye par le front : ",day.fullDate, hour)}
                            return (
                              <div key={`${day.fullDate}-${hour}`} className="px-2">
                                <button
                                  onClick={() => setSelectedCell({ date: day.fullDate, hour, endHour, type: 'blocked' })}
                                  className="h-12 w-full rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-500 text-[11px] flex items-center justify-center gap-2 transition-colors cursor-pointer"
                                >
                                  <span className="h-4 w-4 rounded-full border border-rose-400 flex items-center justify-center text-[10px]">✕</span>
                                  Bloqué
                                </button>
                              </div>
                            );
                          }

                          // 2. Si Réservé
                          if (res && status === 'RESERVED') {
                            const isPending = res.status === 'pending';
                            return (
                              <div key={`${day.fullDate}-${hour}`} className="px-2">
                                <button
                                  onClick={() => setSelectedCell({ date: day.fullDate, hour, endHour, type: 'reserved', reservation: res })}
                                  className={`h-12 w-full rounded-lg border text-[11px] px-3 py-1 flex flex-col justify-center text-left transition-colors cursor-pointer ${isPending
                                    ? 'border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-600'
                                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600'
                                    }`}
                                >
                                  <div className="flex items-center gap-1.5 font-bold mb-0.5">
                                    <Clock className="w-3 h-3" />
                                    {hour}
                                  </div>
                                  <div className={`truncate ${isPending ? 'text-orange-700' : 'text-slate-800'} font-semibold`}>
                                    Client
                                  </div>
                                </button>
                              </div>
                            );
                          }

                          // 3. Si Disponible (Par défaut)
                          return (
                            <div key={`${day.fullDate}-${hour}`} className="px-2">
                              <button
                                onClick={() => setSelectedCell({ date: day.fullDate, hour, endHour, type: 'available' })}
                                className="h-12 w-full rounded-lg border border-dashed border-emerald-300 bg-emerald-50/30 hover:bg-emerald-50/80 text-emerald-500 flex items-center justify-center transition-colors"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ========================================================= */}
            {/* MODALE DE DÉTAILS / ACTION AU CLIC                        */}
            {/* ========================================================= */}
            {selectedCell && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl animate-in zoom-in-95">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-[#1a2b4b]">
                      {selectedCell.type === 'available' && "Gérer le créneau"}
                      {selectedCell.type === 'reserved' && "Détails de la réservation"}
                      {selectedCell.type === 'blocked' && "Créneau bloqué"}
                    </h3>
                    <button onClick={() => setSelectedCell(null)} className="text-gray-400 hover:text-gray-600">
                      <X size={20} />
                    </button>
                  </div>

                  <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-sm font-semibold text-slate-500 mb-1">Date et heure</p>
                    <p className="text-[#1a2b4b] font-bold text-lg">
                      Le {new Date(selectedCell.date).toLocaleDateString('fr-FR')} à {selectedCell.hour} jusqu'à {endHour}
                    </p>
                  </div>

                  {/* Contenu dynamique selon l'état de la case */}
                  {selectedCell.type === 'available' && (
                    <div className="space-y-3">
                      <p className="text-sm text-slate-600 mb-4">Ce créneau est actuellement disponible. Souhaitez-vous le bloquer exceptionnellement ?</p>
                      <Button
                        onClick={() => {
                          if (!selectedCell) return;
                          blockSlot(selectedCell.date, selectedCell.hour, selectedCell.endHour);
                          setSelectedCell(prev => {
                            if (!prev) return null;
                            return {
                              ...prev,           
                              type: 'blocked' 
                            };
                          });

                        }}
                        className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold"
                      >
                        Bloquer ce créneau
                      </Button>
                      <Button variant="outline" onClick={() => setSelectedCell(null)} className="w-full">Annuler</Button>
                    </div>
                  )}

                  {selectedCell.type === 'reserved' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Badge className={selectedCell.reservation.status === 'pending' ? "bg-orange-100 text-orange-700" : "bg-emerald-100 text-emerald-700"}>
                          {selectedCell.reservation.status === 'pending' ? 'En attente de confirmation' : 'Confirmé'}
                        </Badge>
                      </div>
                      <Button className="w-full bg-[#1a2b4b] hover:bg-[#121d33]">Voir le dossier complet</Button>
                    </div>
                  )}

                  {selectedCell.type === 'blocked' && (
                    <div className="space-y-3">
                      <p className="text-sm text-slate-600 mb-4">Vous avez défini ce créneau comme indisponible.</p>
                      <Button variant="outline" className="w-full border-emerald-500 text-emerald-600 hover:bg-emerald-50">
                        Rendre disponible
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {viewMode === 'month' && (
          <div className="mt-6 animate-in fade-in">
            <Card className="border-slate-200 overflow-hidden shadow-sm bg-white">
              <CardContent className="p-0">
                
                {/* En-tête des jours de la semaine */}
                <div className="grid grid-cols-7 bg-[#1a2b4b] text-white text-sm">
                  {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((d) => (
                    <div key={d} className="py-3 text-center font-bold tracking-wider">
                      {d}
                    </div>
                  ))}
                </div>

                {/* Grille du calendrier (Mois) */}
                <div className="grid grid-cols-7">
                  {monthDays.map((day, index) => {
                    // 1. Trouver les réservations pour ce jour précis
                    const dayReservations = reservations
                      .filter(r => r.date === day.fullDate && r.status !== 'cancelled')
                      .sort((a, b) => a.startTime.localeCompare(b.startTime)); // Trier par heure

                    // 2. Vérifier si c'est "Aujourd'hui" pour le mettre en valeur
                    const isToday = day.fullDate === new Date().toISOString().split('T')[0];

                    return (
                      <button
                        key={`${day.fullDate}-${index}`}
                        onClick={() => {
                          // Met à jour le jour sélectionné dans le contexte
                          setSelectedDate(new Date(day.fullDate));
                          // Ouvre le panneau latéral
                          setIsPanelOpen(true);
                        }}
                        className={`h-32 border-r border-b border-slate-100 text-left p-2 md:p-3 transition-colors hover:bg-slate-50 relative flex flex-col gap-2 
                          ${!day.isCurrentMonth ? 'bg-slate-50/50 text-slate-400' : 'bg-white'} 
                          ${day.weekend ? 'text-rose-500' : 'text-slate-700'}
                        `}
                      >
                        {/* Numéro du jour et Badge */}
                        <div className="flex items-center justify-between w-full">
                          <span className={`text-sm font-semibold ${isToday ? 'bg-[#1a2b4b] text-white h-7 w-7 rounded-full flex items-center justify-center' : ''}`}>
                            {day.date}
                          </span>
                          
                          {/* Le badge rouge affiche le nombre de visites */}
                          {day.badge && (
                            <span className="h-5 w-5 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center shadow-sm">
                              {day.badge}
                            </span>
                          )}
                        </div>

                        {/* Liste des événements (Scrollable s'il y en a trop) */}
                        <div className="flex flex-col gap-1.5 overflow-y-auto w-full scrollbar-hide">
                          
                          {/* Cas A : La journée est bloquée */}
                          {day.blocked && (
                            <div className="text-[10px] font-semibold border border-rose-200 bg-rose-50 text-rose-600 px-1.5 py-1 rounded truncate flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                              Bloqué - Congés
                            </div>
                          )}

                          {/* Cas B : Affichage des réservations */}
                          {!day.blocked && dayReservations.map((res, i) => {
                            const isPending = res.status === 'pending';
                            return (
                              <div 
                                key={res.id || i} 
                                className={`text-[10px] font-semibold px-1.5 py-1 rounded truncate flex items-center gap-1.5
                                  ${isPending 
                                    ? 'border border-orange-200 bg-orange-50 text-orange-600' 
                                    : 'border border-slate-200 bg-slate-50 text-slate-600'
                                  }
                                `}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isPending ? 'bg-orange-500' : 'bg-emerald-500'}`}></span>
                                <span className="truncate">{res.startTime} - Client</span>
                              </div>
                            );
                          })}

                        </div>
                      </button>
                    );
                  })}
                </div>
                
              </CardContent>
            </Card>
          </div>
        )}
      </div>

     {isPanelOpen && (
        <div className="fixed inset-0 z-40">
          {/* Fond sombre cliquable pour fermer */}
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm transition-opacity" onClick={() => setIsPanelOpen(false)} />
          
          {/* Panneau latéral */}
          <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            
            {/* Header du panneau */}
            <div className="bg-[#1a2b4b] text-white p-6 flex items-center justify-between">
              <h3 className="text-lg font-bold">Détails de la journée</h3>
              <button 
                onClick={() => setIsPanelOpen(false)} 
                className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenu principal */}
            <div className="p-6 overflow-auto flex-1 space-y-6">
              
              {/* Date dynamique géante */}
              <div className="text-center">
                <p className="text-5xl font-extrabold text-[#1a2b4b]">
                  {(selectedDate || currentDate).getDate()}
                </p>
                <p className="text-lg font-medium text-slate-500 capitalize mt-1">
                  {(selectedDate || currentDate).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                </p>
              </div>

              {/* Titre Visites prévues dynamique */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="font-bold text-slate-900">Visites prévues ({dayVisits.length})</h4>
                <Button variant="outline" size="sm" className="gap-2 text-[#1a2b4b] border-slate-200 hover:bg-slate-50">
                  <Plus className="w-4 h-4" />
                  Ajouter
                </Button>
              </div>

              {/* Liste des visites dynamiques */}
              {dayVisits.length === 0 ? (
                <div className="text-center py-10 text-slate-400 font-medium">
                  Aucune visite programmée ce jour.
                </div>
              ) : (
                <div className="space-y-4">
                  {dayVisits.map((visit) => (
                    <Card 
                      key={visit.id} 
                      onClick={() => {
                        // 1. On récupère la vraie date sous format YYYY-MM-DD
                        const realDate = selectedDate || currentDate;
                        const dateStr = [
                          realDate.getFullYear(),
                          String(realDate.getMonth() + 1).padStart(2, '0'),
                          String(realDate.getDate()).padStart(2, '0')
                        ].join('-');
                        
                        // 2. On retrouve l'objet complet de la réservation
                        const res = reservations.find(r => r.id === visit.id);

                        // 3. Calculer l'endHour à partir de visit.time
                        const [h, m] = visit.time.split(':').map(Number);
                        const endDate = new Date();
                        endDate.setHours(h);
                        endDate.setMinutes(m + 30);
                        const calculatedEndHour = `${String(endDate.getHours()).padStart(2, "0")}:${String(endDate.getMinutes()).padStart(2, "0")}`;

                        // 4. On déclenche l'ouverture de la modale centrale !
                        setSelectedCell({
                          date: dateStr,
                          hour: visit.time,
                          endHour: calculatedEndHour,
                          type: 'reserved',
                          reservation: res
                        });
                        
                        // 5. (Optionnel) on ferme le panneau latéral pour bien voir la modale
                        setIsPanelOpen(false); 
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
                          
                          {/* Type de visite (Badge) */}
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
                        
                        {/* Statut de la visite (Badge) */}
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
                  ))}
                </div>
              )}
            </div>

            {/* Footer du panneau */}
            <div className="p-6 border-t border-slate-100 bg-slate-50">
              <Button className="w-full bg-[#1a2b4b] hover:bg-[#121d33] text-white gap-2 py-6 rounded-xl font-bold shadow-md transition-colors">
                <Plus className="w-5 h-5" />
                Ajouter une nouvelle visite
              </Button>
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
