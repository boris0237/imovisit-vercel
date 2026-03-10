"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User as UserIcon, Settings, ShieldCheck, AlertCircle, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { useDictionary } from '@/hooks/useDictionary';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {translateRole} from '@/utils/translateRole';

interface ProfileDropdownProps {
    isOpen: boolean;
    setIsOpen: (value: boolean) => void;
    onOpenUpdateProfile: () => void; // Fonction pour ouvrir le modal de mise à jour
}

export default function ProfileDropdown({ onOpenUpdateProfile, isOpen, setIsOpen }: ProfileDropdownProps) {
    const { user, logout } = useAuth();
    console.log('user>', user);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string | null>(null);
    const { dictionary } = useDictionary();


    // Fermer le dropdown quand on clique à l'extérieur
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            setError(dictionary?.logoutError || "Erreur lors de la déconnexion.");
        }
    };
    const stringToColor = (string: string) => {
        let hash = 0;
        for (let i = 0; i < string.length; i++) {
            hash = string.charCodeAt(i) + ((hash << 5) - hash);
        }
        // Génération d'une couleur HSL pour garder une bonne luminosité
        const h = Math.abs(hash) % 360;
        return `hsl(${h}, 70%, 45%)`; // 70% saturation, 45% luminosité
    };

    const bgColor = user?.name ? stringToColor(user?.name) : "#ccc";
    const initials = user?.name
        ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
        : "??";
    const name = user?.name || dictionary?.defaultName || "utilisateur";
    const role = user?.role || dictionary?.defaultRole || "pas de rôle";


    return (
        <div className="relative" ref={dropdownRef}>

            {/* 1. Le Trigger (Votre Avatar) */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full transition-transform active:scale-95"
            >
                <Avatar className="w-12 h-12">
                    <AvatarImage src={user?.avatar || ""} alt={name.split("")[0].toUpperCase()} />
                    <AvatarFallback
                        className="text-white"
                        style={{ backgroundColor: bgColor }}
                    >
                        {initials}
                    </AvatarFallback>
                </Avatar>
                <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${user?.isActive === true ? 'bg-emerald-500' : 'bg-gray-400'}`} />
            </button>

            {/* 2. Le Dropdown */}
            {isOpen === true && (
                <div className="absolute left-0 mt-3 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">

                    {/* En-tête du Dropdown : Infos Utilisateur */}
                    <div className="p-5 bg-slate-50 border-b border-slate-100">
                        <p className="text-base font-bold text-slate-800 truncate">{name}</p>
                        <p className="text-sm text-slate-500 truncate mb-3">{user?.email}</p>

                        <div className="flex items-center gap-2">
                            {/* Badge Rôle */}
                            <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-md flex items-center gap-1">
                                {role === 'visitor' ? <UserIcon size={12} /> : <Building2 size={12} />}
                                <span className="capitalize">{translateRole(role, dictionary)}</span>
                            </span>
                            {/* Badge Statut du compte */}
                            {user?.verified === true ? (
                                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-md flex items-center gap-1">
                                    <ShieldCheck size={12} /> 
                                    {dictionary.profil?.verified || "Vérifié"}
                                </span>
                            ) : (
                                <span className="px-2.5 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-md flex items-center gap-1">
                                    <AlertCircle size={12} /> 
                                    <p>{dictionary.profil?.unverified || "Non vérifié"}</p>
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Corps du Dropdown : Actions */}
                    <div className="p-2">
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                onOpenUpdateProfile();
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition-colors"
                        >
                            <UserIcon size={18} />
                            {dictionary.profil?.updateProfile || " Mettre à jour le profil"}
                        </button>

                        <button
                            onClick={() => setIsOpen(false)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition-colors"
                        >
                            <Settings size={18} />
                            {dictionary.profil?.settings || "Paramètres du compte"}
                        </button>

                        <div className="h-px bg-slate-100 my-2 mx-2" />

                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        >
                            <LogOut size={18} />
                            {dictionary.profil?.logout || "Déconnexion"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}