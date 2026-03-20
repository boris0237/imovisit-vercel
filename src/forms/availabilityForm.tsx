"use client";

import { useState } from "react";
import { X, Clock, Ban, Calendar, AlertCircle, Trash2, Edit2 } from "lucide-react";
import { agendaService } from "@/services/agendaService";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

type DayOfWeek = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

interface AvailabilitySlot {
  id?: string;
  day: DayOfWeek;
  startTime: string;
  endTime: string;
  visitDuration: number; // en minutes
}

interface ExceptionData {
  id?: string;
  date: string;
  type: "full_day" | "specific_slots";
  startTime?: string;
  endTime?: string;
  reason?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DAYS_MAP: { value: DayOfWeek; label: string }[] = [
  { value: "monday", label: "Lundi" },
  { value: "tuesday", label: "Mardi" },
  { value: "wednesday", label: "Mercredi" },
  { value: "thursday", label: "Jeudi" },
  { value: "friday", label: "Vendredi" },
  { value: "saturday", label: "Samedi" },
  { value: "sunday", label: "Dimanche" },
];

const DURATION_OPTIONS = [30, 45, 60, 90, 120];

const EXCEPTION_REASONS = [
  { value: "conges", label: "Congés" },
  { value: "ferie", label: "Jour férié" },
  { value: "rendez_vous", label: "Rendez-vous personnel" },
  { value: "autre", label: "Autre" },
];

// ─── Formulaire d'ajout de créneau ───────────────────────────────────────────

function AddSlotForm({
  onAdd,
  onCancel,
}: {
  onAdd: (slot: AvailabilitySlot) => void;
  onCancel: () => void;
}) {
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>("monday");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("12:00");
  const [visitDuration, setVisitDuration] = useState(30);

  const handleSubmit = () => {
    // Validation
    if (startTime >= endTime) {
      toast.error("L'heure de fin doit être après l'heure de début");
      return;
    }

    onAdd({
      day: selectedDay,
      startTime,
      endTime,
      visitDuration,
    });
  };

  return (
    <div className="bg-slate-100 rounded-xl p-6 space-y-5 border-2 border-slate-200">
      {/* Info message */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-lg p-4">
        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-blue-900">
          Vous n&apos;avez encore aucun créneau défini pour ce jour. Ajoutez votre première plage horaire pour commencer à recevoir des demandes de visite.
        </p>
      </div>

      {/* Jour de la semaine */}
      <div className="space-y-2">
        <label className="block text-sm font-bold text-slate-700">Jour de la semaine</label>
        <select
          value={selectedDay}
          onChange={(e) => setSelectedDay(e.target.value as DayOfWeek)}
          className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 bg-white text-slate-900 font-medium focus:outline-none focus:border-[#1a2b4b] focus:ring-2 focus:ring-[#1a2b4b]/20"
        >
          {DAYS_MAP.map((day) => (
            <option key={day.value} value={day.value}>
              {day.label}
            </option>
          ))}
        </select>
      </div>

      {/* Heures */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-bold text-slate-700">Heure de début</label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-lg border-2 border-slate-200 bg-white text-slate-900 font-medium focus:outline-none focus:border-[#1a2b4b] focus:ring-2 focus:ring-[#1a2b4b]/20"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-bold text-slate-700">Heure de fin</label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-lg border-2 border-slate-200 bg-white text-slate-900 font-medium focus:outline-none focus:border-[#1a2b4b] focus:ring-2 focus:ring-[#1a2b4b]/20"
            />
          </div>
        </div>
      </div>

      {/* Durée d'une visite */}
      <div className="space-y-2">
        <label className="block text-sm font-bold text-slate-700">Durée d&apos;une visite</label>
        <div className="grid grid-cols-3 gap-2">
          {DURATION_OPTIONS.map((duration) => (
            <button
              key={duration}
              type="button"
              onClick={() => setVisitDuration(duration)}
              className={`py-3 px-4 rounded-lg font-semibold text-sm transition-all border-2 ${
                visitDuration === duration
                  ? "bg-[#1a2b4b] border-[#1a2b4b] text-white shadow-md"
                  : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
              }`}
            >
              {duration} minutes
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          onClick={onCancel}
          className="px-5 py-2.5 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-200/70 transition-colors"
        >
          Annuler
        </button>
        <button
          onClick={handleSubmit}
          className="px-6 py-2.5 rounded-lg text-sm font-bold bg-[#1a2b4b] text-white hover:bg-[#0f1a2e] transition-all shadow-sm hover:shadow"
        >
          Ajouter le créneau
        </button>
      </div>
    </div>
  );
}

// ─── Formulaire d'exception ──────────────────────────────────────────────────

function AddExceptionForm({
  onAdd,
  onCancel,
}: {
  onAdd: (exception: ExceptionData) => void;
  onCancel: () => void;
}) {
  const [exceptionType, setExceptionType] = useState<"full_day" | "specific_slots">("full_day");
  const [selectedDate, setSelectedDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("12:00");
  const [reason, setReason] = useState("conges");

  const handleSubmit = () => {
    if (!selectedDate) {
      toast.error("Veuillez sélectionner une date");
      return;
    }

    if (exceptionType === "specific_slots" && startTime >= endTime) {
      toast.error("L'heure de fin doit être après l'heure de début");
      return;
    }

    onAdd({
      date: selectedDate,
      type: exceptionType,
      startTime: exceptionType === "specific_slots" ? startTime : undefined,
      endTime: exceptionType === "specific_slots" ? endTime : undefined,
      reason,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="bg-rose-500 text-white p-6 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Ban className="w-5 h-5" />
              <h3 className="text-lg font-bold">Ajouter une exception</h3>
            </div>
            <p className="text-sm text-rose-100">Bloquer une date ou une période spécifique</p>
          </div>
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Date ou période à bloquer */}
          <div className="space-y-3">
            <label className="block text-sm font-bold text-slate-800">Date ou période à bloquer</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setExceptionType("full_day")}
                className={`p-4 rounded-xl border-2 transition-all ${
                  exceptionType === "full_day"
                    ? "border-[#1a2b4b] bg-[#1a2b4b]/5"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <Calendar className="w-6 h-6 mx-auto mb-2 text-slate-700" />
                <div className="text-sm font-semibold text-slate-900">Une journée</div>
              </button>

              <button
                type="button"
                onClick={() => setExceptionType("specific_slots")}
                className={`p-4 rounded-xl border-2 transition-all ${
                  exceptionType === "specific_slots"
                    ? "border-[#1a2b4b] bg-[#1a2b4b]/5"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <Clock className="w-6 h-6 mx-auto mb-2 text-slate-700" />
                <div className="text-sm font-semibold text-slate-900">Créneaux spécifiques</div>
              </button>
            </div>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 bg-white text-slate-900 font-medium focus:outline-none focus:border-[#1a2b4b] focus:ring-2 focus:ring-[#1a2b4b]/20"
            />
          </div>

          {/* Type de blocage */}
          <div className="space-y-3">
            <label className="block text-sm font-bold text-slate-800">Type de blocage</label>
            
            <div
              className={`p-4 rounded-xl border-2 transition-all ${
                exceptionType === "full_day"
                  ? "border-rose-300 bg-rose-50"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3 mb-1">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    exceptionType === "full_day"
                      ? "border-rose-500 bg-rose-500"
                      : "border-slate-300"
                  }`}
                >
                  {exceptionType === "full_day" && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-sm text-slate-900">Journée complète</div>
                  <div className="text-xs text-slate-600">Toute la journée sera indisponible</div>
                </div>
                <AlertCircle className="w-5 h-5 text-rose-500" />
              </div>
            </div>

            <div
              className={`p-4 rounded-xl border-2 transition-all ${
                exceptionType === "specific_slots"
                  ? "border-[#1a2b4b] bg-blue-50"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    exceptionType === "specific_slots"
                      ? "border-[#1a2b4b] bg-[#1a2b4b]"
                      : "border-slate-300"
                  }`}
                >
                  {exceptionType === "specific_slots" && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-sm text-slate-900">Créneaux spécifiques</div>
                  <div className="text-xs text-slate-600">Choisir les plages horaires à bloquer</div>
                </div>
                <Clock className="w-5 h-5 text-[#1a2b4b]" />
              </div>
            </div>
          </div>

          {/* Heures (si créneaux spécifiques) */}
          {exceptionType === "specific_slots" && (
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">De</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border-2 border-slate-200 text-sm font-medium focus:outline-none focus:border-[#1a2b4b] focus:ring-2 focus:ring-[#1a2b4b]/20"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">À</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border-2 border-slate-200 text-sm font-medium focus:outline-none focus:border-[#1a2b4b] focus:ring-2 focus:ring-[#1a2b4b]/20"
                />
              </div>
            </div>
          )}

          {/* Motif */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-800">Motif (optionnel)</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 bg-white text-slate-900 font-medium focus:outline-none focus:border-[#1a2b4b] focus:ring-2 focus:ring-[#1a2b4b]/20"
            >
              {EXCEPTION_REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-200/70 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 rounded-lg text-sm font-bold bg-rose-500 text-white hover:bg-rose-600 transition-all shadow-sm hover:shadow"
          >
            Bloquer cette période
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Composant principal ─────────────────────────────────────────────────────

export default function AvailabilityFormModal({ 
  ownerId, 
  onClose,
  isOpen
}: { 
  ownerId?: string;
  onClose?: () => void;
  isOpen?: boolean;
}) {
  if (!isOpen) return null;
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [exceptions, setExceptions] = useState<ExceptionData[]>([]);
  const [showSlotForm, setShowSlotForm] = useState(false);
  const [showExceptionForm, setShowExceptionForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Grouper les créneaux par jour
  const groupedSlots = slots.reduce((acc, slot) => {
    const dayLabel = DAYS_MAP.find((d) => d.value === slot.day)?.label || slot.day;
    if (!acc[dayLabel]) acc[dayLabel] = [];
    acc[dayLabel].push(slot);
    return acc;
  }, {} as Record<string, AvailabilitySlot[]>);

  // Ajouter un créneau
  const handleAddSlot = (newSlot: AvailabilitySlot) => {
    setSlots((prev) => [...prev, { ...newSlot, id: Date.now().toString() }]);
    setShowSlotForm(false);
    toast.success("Créneau ajouté !");
  };

  // Supprimer un créneau
  const handleRemoveSlot = (id: string) => {
    setSlots((prev) => prev.filter((s) => s.id !== id));
    toast.success("Créneau supprimé");
  };

  // Ajouter une exception
  const handleAddException = (newException: ExceptionData) => {
    setExceptions((prev) => [...prev, { ...newException, id: Date.now().toString() }]);
    setShowExceptionForm(false);
    toast.success("Exception ajoutée !");
  };

  // Supprimer une exception
  const handleRemoveException = (id: string) => {
    setExceptions((prev) => prev.filter((e) => e.id !== id));
    toast.success("Exception supprimée");
  };

  // Enregistrer toutes les disponibilités
  const handleSave = async () => {
    setIsLoading(true);

    try {
      // 1. Enregistrer tous les créneaux de disponibilité
      for (const slot of slots) {
        // Convertir le jour en date (ex: prochain lundi)
        const today = new Date();
        const dayIndex = DAYS_MAP.findIndex((d) => d.value === slot.day);
        const daysUntilTarget = (dayIndex - today.getDay() + 7) % 7 || 7;
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + daysUntilTarget);
        const dateStr = targetDate.toISOString().split("T")[0];

        await agendaService.createAvailability({
          date: dateStr,
          startTime: slot.startTime,
          endTime: slot.endTime,
        });
      }

      // 2. Enregistrer toutes les exceptions
      for (const exception of exceptions) {
        await agendaService.createException({
          date: exception.date,
          startTime: exception.type === "specific_slots" ? exception.startTime : undefined,
          endTime: exception.type === "specific_slots" ? exception.endTime : undefined,
          reason: exception.reason || "Indisponible",
        });
      }

      toast.success("Disponibilités enregistrées avec succès !");
      onClose?.();
    } catch (error: any) {
      console.error("Erreur lors de l'enregistrement:", error);
      toast.error(error.message || "Erreur lors de l'enregistrement");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden pointer-events-auto"
          style={{ maxHeight: "calc(100vh - 2rem)" }}
        >
          {/* Header */}
          <div className="bg-[#516a8f] text-white p-6 flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold mb-1">Gérer mes disponibilités</h2>
              <p className="text-sm text-blue-100">Définissez vos créneaux horaires réguliers</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            
            {/* Section Disponibilités */}
            <section className="space-y-4">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-[#1a2b4b] mt-0.5" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">Gérer mes disponibilités</h3>
                  <p className="text-sm text-slate-500">Ces disponibilités se répéteront chaque semaine automatiquement</p>
                </div>
              </div>

              {/* Liste des créneaux groupés par jour */}
              {Object.keys(groupedSlots).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(groupedSlots).map(([day, daySlots]) => (
                    <div key={day} className="bg-white border-2 border-slate-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-slate-900">{day}</h4>
                        <button className="text-sm font-semibold text-[#1a2b4b] hover:underline">
                          + Ajouter
                        </button>
                      </div>
                      <div className="space-y-2">
                        {daySlots.map((slot) => (
                          <div
                            key={slot.id}
                            className="flex items-center gap-3 bg-slate-50 rounded-lg px-4 py-2.5"
                          >
                            <div className="flex items-center gap-2 bg-[#1a2b4b] text-white px-3 py-1.5 rounded-md text-sm font-bold">
                              <Clock className="w-4 h-4" />
                              {slot.startTime}
                            </div>
                            <span className="text-slate-500 font-medium">à</span>
                            <div className="flex items-center gap-2 bg-[#1a2b4b] text-white px-3 py-1.5 rounded-md text-sm font-bold">
                              <Clock className="w-4 h-4" />
                              {slot.endTime}
                            </div>
                            <button
                              onClick={() => handleRemoveSlot(slot.id!)}
                              className="ml-auto p-1.5 text-rose-500 hover:bg-rose-50 rounded-md transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              {/* Formulaire d'ajout ou bouton */}
              {showSlotForm ? (
                <AddSlotForm onAdd={handleAddSlot} onCancel={() => setShowSlotForm(false)} />
              ) : (
                <button
                  onClick={() => setShowSlotForm(true)}
                  className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-600 font-semibold hover:border-[#1a2b4b] hover:text-[#1a2b4b] hover:bg-slate-50 transition-all"
                >
                  + Ajouter un créneau récurrent
                </button>
              )}
            </section>

            {/* Section Exceptions */}
            <section className="space-y-4">
              <div className="flex items-start gap-3">
                <Ban className="w-5 h-5 text-rose-500 mt-0.5" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">Exceptions (Congés, jours fériés)</h3>
                  <p className="text-sm text-slate-500">Bloquer une date ou une période spécifique</p>
                </div>
              </div>

              {/* Liste des exceptions */}
              {exceptions.map((exc) => (
                <div
                  key={exc.id}
                  className="flex items-center gap-3 bg-rose-50 border-2 border-rose-200 rounded-xl px-4 py-3"
                >
                  <div className="flex-1">
                    <div className="font-bold text-sm text-slate-900">
                      {new Date(exc.date).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </div>
                    <div className="text-xs text-rose-700 font-medium">
                      {exc.type === "full_day"
                        ? "Journée complète"
                        : `Créneaux spécifiques - ${exc.startTime} à ${exc.endTime}`}
                      {exc.reason && ` · ${exc.reason}`}
                    </div>
                  </div>
                  <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleRemoveException(exc.id!)}
                    className="p-2 text-rose-500 hover:bg-rose-100 rounded-md transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {/* Bouton d'ajout */}
              <button
                onClick={() => setShowExceptionForm(true)}
                className="w-full py-4 border-2 border-dashed border-rose-200 rounded-xl text-rose-600 font-semibold hover:border-rose-400 hover:bg-rose-50 transition-all"
              >
                + Ajouter une exception
              </button>
            </section>
          </div>

          {/* Footer */}
          <div className="p-5 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg border-2 border-slate-200 bg-white text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading || (slots.length === 0 && exceptions.length === 0)}
              className="px-6 py-2.5 rounded-lg bg-[#1a2b4b] text-white font-bold hover:bg-[#0f1a2e] transition-all shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Enregistrement..." : "Enregistrer les modifications"}
            </button>
          </div>
        </div>
      </div>

      {/* Modale d'exception */}
      {showExceptionForm && (
        <AddExceptionForm onAdd={handleAddException} onCancel={() => setShowExceptionForm(false)} />
      )}
    </>
  );
}
