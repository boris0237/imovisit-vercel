"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext'; // Vérifiez bien le chemin (contexts ou context)
import { userService } from '@/services/userService';
import { ROLE_ALLOWED_FIELDS } from '@/types/constant';
import { useDictionary } from '@/hooks/useDictionary';
import { Loader2, UploadCloud, CheckCircle2 } from 'lucide-react';

// 👉 N'oubliez pas d'ajuster le chemin vers votre composant InternationalPhoneInput
import InternationalPhoneInput from '@/components/ui/InternationalPhoneInput';
import Toast from '@/components/ui/toast';

const FILE_FIELDS = [
    "avatar", "docCNI", "docDiplome", "docContribuable",
    "docRCCM", "docJust", "companyLogo"
];

export default function UpdateProfile() {
    const { user, refreshUser } = useAuth();

    const [formValues, setFormValues] = useState<Record<string, any>>({});
    const [fileValues, setFileValues] = useState<Record<string, File | null>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showToast, setShowToast] = useState(false);
    const { dictionary } = useDictionary();

    
const FIELD_LABELS: Record<string, string> = {
    name: dictionary.updateProfil?.name || "Nom complet",
    age: dictionary.updateProfil?.year || "Âge",
    phone: dictionary.updateProfil?.phone || "Téléphone",
    city: dictionary.updateProfil?.city || "Ville",
    country: dictionary.updateProfil?.country || "Pays",
    profession: dictionary.updateProfil?.job || "Profession",
    avatar: dictionary.updateProfil?.avatar || "Photo de profil",
    services: dictionary.updateProfil?.services || "Services proposés",
    docCNI: dictionary.updateProfil?.docCNI || "Document d'identité (CNI)",
    docDiplome: dictionary.updateProfil?.docDiplome || "Diplôme",
    docContribuable: dictionary.updateProfil?.docContribuablle || "Carte de contribuable",
    docRCCM: dictionary.updateProfil?.docRCCM || "Extrait RCCM",
    docJust: dictionary.updateProfil?.dosJust || "Justificatif de domicile",
    companyName: dictionary.updateProfil?.companyName || "Nom de l'entreprise",
    companyLogo: dictionary.updateProfil?.companyLogo || "Logo de l'entreprise",
    role: dictionary.updateProfil?.role || "Rôle",
    typeCompte: dictionary.updateProfil?.typeCompte || "Type de compte"
};

    useEffect(() => {
        if (user) {
            const initialValues: Record<string, any> = {};
            const allowed = ROLE_ALLOWED_FIELDS[user.role as keyof typeof ROLE_ALLOWED_FIELDS] || [];

            allowed.forEach(field => {
                if (!FILE_FIELDS.includes(field)) {
                    initialValues[field] = user[field as keyof typeof user] || "";
                }
            });
            setFormValues(initialValues);
        }
    }, [user]);

    if (!user) return null;

    // Suppression des doublons potentiels dans votre array constant
    const allowedFields = Array.from(new Set(ROLE_ALLOWED_FIELDS[user.role as keyof typeof ROLE_ALLOWED_FIELDS] || []));

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormValues(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value
        }));
    };

    // Nouvelle fonction spécifique pour le téléphone
    const handlePhoneChange = (value: string) => {
        setFormValues(prev => ({
            ...prev,
            phone: value
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
        const file = e.target.files?.[0] || null;
        setFileValues(prev => ({ ...prev, [fieldName]: file }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const formData = new FormData();

            // Ajout des fichiers
            Object.entries(fileValues).forEach(([key, file]) => {
                if (file) {
                    formData.append(key, file);
                }
            });

            // Ajout des champs textes (inclut le téléphone formaté)
            Object.entries(formValues).forEach(([key, value]) => {
                if (value !== null && value !== undefined && value !== "") {
                    formData.append(key, String(value));
                }
            });

            const response = await userService.updateProfile(formData);

            refreshUser(response.data);
            if (response.status === 200) {
                setSuccessMessage(response.message || "Profil mis à jour avec succès !");
                setShowToast(true);
                setTimeout(() => {
                    setShowToast(false);
                    setSuccessMessage("");
                    setError("");
                }, 3000);

            } else {
                setError(response.message || "Erreur lors de la mise à jour du profil.");
                setShowToast(true);
            }

        } catch (error: any) {
            console.error("Erreur catchée :", error);
            setError(error.message || "Erreur lors de la mise à jour du profil.");
            setShowToast(true);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {showToast && successMessage && !error && (
                <Toast isOpen={showToast} onClose={() => setShowToast(false)} type="success">
                    {successMessage}
                </Toast>
            )}
            {showToast && !successMessage && error && (
                <Toast isOpen={showToast} onClose={() => setShowToast(false)} type="error">
                    {error}
                </Toast>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {allowedFields.map((field) => {
                    const isFile = FILE_FIELDS.includes(field);
                    const label = FIELD_LABELS[field] || field;

                    // 1. RENDU DES CHAMPS FICHIERS
                    if (isFile) {
                        return (
                            <div key={field} className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    {label}
                                </label>
                                <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-4 hover:bg-slate-50 transition-colors flex items-center justify-center">
                                    <input
                                        type="file"
                                        accept={field.includes('doc') ? ".pdf,image/*" : "image/*"}
                                        onChange={(e) => handleFileChange(e, field)}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <div className="flex flex-col items-center text-gray-500 pointer-events-none">
                                        {fileValues[field] ? (
                                            <>
                                                <CheckCircle2 className="text-emerald-500 mb-2" size={24} />
                                                <span className="text-sm font-medium text-slate-800">
                                                    {fileValues[field]?.name}
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <UploadCloud className="mb-2 text-gray-400" size={24} />
                                                <span className="text-sm">
                                                    Cliquez ou glissez pour modifier {label.toLowerCase()}
                                                </span>
                                                {user[field as keyof typeof user] && (
                                                    <span className="text-xs text-blue-500 mt-1">
                                                        (Un fichier est déjà enregistré)
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    }

                    // 2. RENDU SPÉCIFIQUE POUR LE TÉLÉPHONE
                    if (field === 'phone') {
                        return (
                            <div key={field} className="col-span-1">
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    {label}
                                </label>
                                <InternationalPhoneInput
                                    value={formValues[field] || ''}
                                    onChange={handlePhoneChange}
                                // Ajoutez ici les autres props nécessaires à votre composant (ex: defaultCountry="CM")
                                />
                            </div>
                        );
                    }

                    // 3. RENDU DES AUTRES CHAMPS TEXTES ET NOMBRES
                    return (
                        <div key={field} className="col-span-1">
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                {label}
                            </label>
                            <input
                                type={field === 'age' ? 'number' : 'text'}
                                name={field}
                                value={formValues[field] || ''}
                                onChange={handleTextChange}
                                disabled={ field === 'typeCompte'} // Empêche la modification de ces champs si présents
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a2b4b] disabled:opacity-50 disabled:cursor-not-allowed"
                                placeholder={`Votre ${label.toLowerCase()}`}
                            />
                        </div>
                    );
                })}
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-[#1a2b4b] hover:bg-[#121d33] text-white font-bold py-3 px-8 rounded-xl transition-all active:scale-[0.98] flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                            <Loader2 size={18} className="animate-spin" />
                            Enregistrement...
                        </>
                    ) : (
                        "Enregistrer les modifications"
                    )}
                </button>
            </div>
        </form>
    );
}