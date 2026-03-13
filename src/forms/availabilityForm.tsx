"use client"

import React, { useState } from 'react';
import { Plus, Trash2, CalendarDays, Clock, AlertCircle, X, Ban, RefreshCcw } from 'lucide-react';

// --- TYPES ---
interface TimeSlot {
    start: string;
    end: string;
}

interface DaySchedule {
    active: boolean;
    slots: TimeSlot[];
}

interface ExceptionSchedule {
    id: string;
    date: string;
    isAvailable: boolean;
    slots: TimeSlot[];
}

// --- CONSTANTES ---
const DAYS = [
    { id: 'monday', label: 'Lundi' },
    { id: 'tuesday', label: 'Mardi' },
    { id: 'wednesday', label: 'Mercredi' },
    { id: 'thursday', label: 'Jeudi' },
    { id: 'friday', label: 'Vendredi' },
    { id: 'saturday', label: 'Samedi' },
    { id: 'sunday', label: 'Dimanche' },
];

const DEFAULT_SLOT = { start: '09:00', end: '17:00' };

export default function AvailabilityForm() {
    // --- ÉTATS ---
    const [isWeeklyModalOpen, setIsWeeklyModalOpen] = useState(false);
    const [tempSelectedDays, setTempSelectedDays] = useState<string[]>(['monday', 'tuesday', 'wednesday', 'thursday', 'friday']);
    const [tempSlots, setTempSlots] = useState<TimeSlot[]>([{ ...DEFAULT_SLOT }]);
    const [schedule, setSchedule] = useState<Record<string, DaySchedule>>({
        monday: { active: true, slots: [{ ...DEFAULT_SLOT }] },
        tuesday: { active: true, slots: [{ ...DEFAULT_SLOT }] },
        wednesday: { active: true, slots: [{ ...DEFAULT_SLOT }] },
        thursday: { active: true, slots: [{ ...DEFAULT_SLOT }] },
        friday: { active: true, slots: [{ ...DEFAULT_SLOT }] },
        saturday: { active: false, slots: [{ ...DEFAULT_SLOT }] },
        sunday: { active: false, slots: [{ ...DEFAULT_SLOT }] },
    });
    // Gérer la sélection/désélection d'un jour dans la modale
    const toggleTempDay = (dayId: string) => {
        setTempSelectedDays(prev =>
            prev.includes(dayId)
                ? prev.filter(d => d !== dayId)
                : [...prev, dayId]
        );
    };

    // Sauvegarder ce qu'on a fait dans la modale vers le vrai "schedule"
    const handleSaveWeekly = () => {
        setSchedule(prev => {
            const newSchedule = { ...prev };
            // On désactive tout d'abord
            Object.keys(newSchedule).forEach(day => {
                newSchedule[day].active = false;
                newSchedule[day].slots = [];
            });
            // On active uniquement les jours sélectionnés avec les horaires choisis
            tempSelectedDays.forEach(day => {
                newSchedule[day].active = true;
                newSchedule[day].slots = [...tempSlots];
            });
            return newSchedule;
        });
        setIsWeeklyModalOpen(false); // On ferme la modale
    };

    // 2. Exceptions (Jours spécifiques)
    const [exceptions, setExceptions] = useState<ExceptionSchedule[]>([]);

    // --- HANDLERS POUR LA SEMAINE ---
    const toggleDay = (dayId: string) => {
        setSchedule(prev => ({
            ...prev,
            [dayId]: { ...prev[dayId], active: !prev[dayId].active }
        }));
    };

    const addSlot = (dayId: string) => {
        setSchedule(prev => ({
            ...prev,
            [dayId]: { ...prev[dayId], slots: [...prev[dayId].slots, { ...DEFAULT_SLOT }] }
        }));
    };

    const updateSlot = (dayId: string, index: number, field: 'start' | 'end', value: string) => {
        setSchedule(prev => {
            const newSlots = [...prev[dayId].slots];
            newSlots[index] = { ...newSlots[index], [field]: value };
            return { ...prev, [dayId]: { ...prev[dayId], slots: newSlots } };
        });
    };

    const removeSlot = (dayId: string, index: number) => {
        setSchedule(prev => {
            const newSlots = prev[dayId].slots.filter((_, i) => i !== index);
            return { ...prev, [dayId]: { ...prev[dayId], slots: newSlots } };
        });
    };

    // --- HANDLERS POUR LES EXCEPTIONS ---
    const addException = () => {
        const newException: ExceptionSchedule = {
            id: Math.random().toString(36).substr(2, 9),
            date: '',
            isAvailable: false,
            slots: [{ ...DEFAULT_SLOT }]
        };
        setExceptions([...exceptions, newException]);
    };

    const removeException = (id: string) => {
        setExceptions(exceptions.filter(exc => exc.id !== id));
    };

    const updateException = (id: string, field: keyof ExceptionSchedule, value: any) => {
        setExceptions(exceptions.map(exc => exc.id === id ? { ...exc, [field]: value } : exc));
    };

    const updateExceptionSlot = (id: string, index: number, field: 'start' | 'end', value: string) => {
        setExceptions(exceptions.map(exc => {
            if (exc.id === id) {
                const newSlots = [...exc.slots];
                newSlots[index] = { ...newSlots[index], [field]: value };
                return { ...exc, slots: newSlots };
            }
            return exc;
        }));
    };

    // --- COMPOSANT SWITCH CUSTOM ---
    const Switch = ({ checked, onChange }: { checked: boolean, onChange: () => void }) => (
        <button
            type="button"
            onClick={onChange}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${checked ? 'bg-[#1a2b4b]' : 'bg-gray-200'
                }`}
        >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'
                    }`}
            />
        </button>
    );

    return (
        <div className="-mt-2">
            {/* En-tête de la section */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-9">
                <div>
                    <div className='flex flex-col-2 items-center gap-2'>
                        <RefreshCcw className="mb-2 opacity-300 text-imo-primary" size={20} />
                        <h3 className="text-xl font-bold text-[#1a2b4b] mb-1">
                            Gérer mes disponibilités
                        </h3>
                    </div>
                    <p className="text-sm text-gray-500">
                        Ces disponibilités se répètent chaque semaine automatiquement
                    </p>
                </div>
                <button
                    onClick={() => setIsWeeklyModalOpen(true)} // <-- MODIFICATION ICI
                    className="text-center py-4 border-2 border-dashed border-gray-300 rounded-2xl items-center hover:bg-slate-50 transition-colors font-semibold py-2.5 px-5 flex items-center justify-center gap-2 text-sm whitespace-nowrap text-[#1a2b4b]"
                >
                    <Plus size={18} strokeWidth={2.5} />
                    Ajouter un créneau récurrent
                </button>
            </div>

            {/* Liste des exceptions */}
            <div>
                <div className="space-y-4">
                    {exceptions.length === 0 ? (
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-9">
                            <div className='mb-2'>
                                <div className='flex flex-col-2 items-center gap-2'>
                                    <Ban className="mb-2 opacity-100 text-red-400" size={20} />
                                    <h3 className="text-xl font-bold text-[#1a2b4b] mb-1">
                                        Exeptions (Congés; jours fériés)
                                    </h3>
                                </div>
                                <p className="text-sm text-gray-500">
                                    Ces disponibilités se répètent chaque semaine automatiquement
                                </p>
                            </div>
                            <button
                                onClick={addException} // Assurez-vous que cette fonction existe dans votre composant
                                className="text-center py-4 border-2 border-dashed border-gray-300 rounded-2xl items-center hover:bg-slate-50 transition-colors font-semibold py-2.5 px-5 flex items-center justify-center gap-2 text-sm whitespace-nowrap"
                            >
                                <Plus size={18} strokeWidth={2.5} />
                                Ajouter une exception
                            </button>
                        </div>
                    ) : (isWeeklyModalOpen && (
                        <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl animate-in zoom-in-95 duration-200">

                            {/* Header Modale */}
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-[#1a2b4b]">Ajouter un créneau récurrent</h2>
                                <button
                                    onClick={() => setIsWeeklyModalOpen(false)}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Section 1 : Sélection des jours */}
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-gray-700 mb-3">
                                    Sélectionnez les jours
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {DAYS.map(day => {
                                        const isSelected = tempSelectedDays.includes(day.id);
                                        return (
                                            <button
                                                key={day.id}
                                                onClick={() => toggleTempDay(day.id)}
                                                className={`px-4 py-2.5 rounded-full text-sm font-semibold transition-colors ${isSelected
                                                    ? 'bg-[#1a2b4b] text-white'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {day.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Section 2 : Temps de disponibilité */}
                            <div className="mb-8">
                                <label className="block text-sm font-bold text-gray-700 mb-3">
                                    Temps de disponibilité
                                </label>

                                <div className="space-y-3">
                                    {tempSlots.map((slot, index) => (
                                        <div key={index} className="flex items-center gap-3">
                                            <div className="flex items-center gap-2 bg-slate-50 border border-gray-200 rounded-xl p-3 flex-1">
                                                <input
                                                    type="time"
                                                    value={slot.start}
                                                    onChange={(e) => {
                                                        const newSlots = [...tempSlots];
                                                        newSlots[index].start = e.target.value;
                                                        setTempSlots(newSlots);
                                                    }}
                                                    className="bg-transparent focus:outline-none text-sm font-bold text-gray-700 w-full text-center"
                                                />
                                                <span className="text-gray-400 font-bold">-</span>
                                                <input
                                                    type="time"
                                                    value={slot.end}
                                                    onChange={(e) => {
                                                        const newSlots = [...tempSlots];
                                                        newSlots[index].end = e.target.value;
                                                        setTempSlots(newSlots);
                                                    }}
                                                    className="bg-transparent focus:outline-none text-sm font-bold text-gray-700 w-full text-center"
                                                />
                                            </div>
                                            {tempSlots.length > 1 && (
                                                <button
                                                    onClick={() => setTempSlots(tempSlots.filter((_, i) => i !== index))}
                                                    className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl border border-transparent hover:border-red-100 transition-colors"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => setTempSlots([...tempSlots, { ...DEFAULT_SLOT }])}
                                    className="text-sm font-bold text-[#1a2b4b] mt-4 flex items-center gap-1 hover:underline"
                                >
                                    <Plus size={16} strokeWidth={3} /> Ajouter un temps
                                </button>
                            </div>

                        </div>
                    )
                    )}
                </div>
                {/* Footer Modale : Boutons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                    <button
                        onClick={() => setIsWeeklyModalOpen(false)}
                        className="px-6 py-3 font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleSaveWeekly}
                        className="px-6 py-3 bg-[#1a2b4b] text-white font-bold rounded-xl hover:bg-[#121d33] transition-colors shadow-md"
                    >
                        Enregistrer
                    </button>
                </div>
            </div>
        </div>
    );
}