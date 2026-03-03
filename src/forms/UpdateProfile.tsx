"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/services/userService';
import { ROLE_ALLOWED_FIELDS } from '@/types/constant'; // Ajustez le chemin de votre constante
import { toast } from 'sonner';
import { Loader2, UploadCloud, CheckCircle2 } from 'lucide-react';

// Dictionnaire pour afficher de jolis labels au lieu des clés techniques
const FIELD_LABELS: Record<string, string> = {
    name: "Nom complet",
    age: "Âge",
    phone: "Téléphone",
    city: "Ville",
    country: "Pays",
    profession: "Profession",
    avatar: "Photo de profil",
    services: "Services proposés",
    docCNI: "Document d'identité (CNI)",
    docDiplome: "Diplôme",
    docContribuable: "Carte de contribuable",
    docRCCM: "Extrait RCCM",
    docJust: "Justificatif de domicile",
    companyName: "Nom de l'entreprise",
    companyLogo: "Logo de l'entreprise",
    role: "Rôle",
    typeCompte: "Type de compte"
};

// Liste des champs qui doivent être traités comme des fichiers
const FILE_FIELDS = [
    "avatar", "docCNI", "docDiplome", "docContribuable",
    "docRCCM", "docJust", "companyLogo"
];

export default function UpdateProfile() {
    const { user, refreshUser } = useAuth();

    // États pour les champs textes/nombres et les champs fichiers
    const [formValues, setFormValues] = useState<Record<string, any>>({});
    const [fileValues, setFileValues] = useState<Record<string, File | null>>({});
    const [isLoading, setIsLoading] = useState(false);

    // Initialiser le formulaire avec les données existantes de l'utilisateur
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

    // Si l'utilisateur n'est pas encore chargé
    if (!user) return null;

    // Récupérer les champs autorisés (sans les doublons éventuels)
    const allowedFields = Array.from(new Set(ROLE_ALLOWED_FIELDS[user.role as keyof typeof ROLE_ALLOWED_FIELDS] || []));

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormValues(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value
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
            // 1. On crée manuellement le FormData (comme dans votre premier code)
            const formData = new FormData();

            // 2. Ajout des fichiers S'ILS SONT PRÉSENTS
            Object.entries(fileValues).forEach(([key, file]) => {
                if (file) {
                    formData.append(key, file); // Ici, le navigateur gère le binaire correctement
                }
            });

            // 3. Ajout des champs textes (Le "secret" qui faisait marcher votre ancien code)
            Object.entries(formValues).forEach(([key, value]) => {
                // On ignore les chaînes vides et les valeurs nulles
                if (value !== null && value !== undefined && value !== "") {
                    // On force la conversion en String, exactement comme vous le faisiez
                    formData.append(key, String(value));
                }
            });

            // (Optionnel) Pour le débogage : voir ce qu'on envoie vraiment
            console.log("--- Contenu du FormData envoyé ---");
            formData.forEach((value, key) => {
                console.log(`${key}:`, value);
            });

            // 4. Appel au service en lui passant DIRECTEMENT le FormData
            // (Notre userService ne le modifiera pas, car il détectera que c'est déjà un FormData)
            const response = await userService.updateProfile(formData);

            console.log("Réponse du service :", response);

            // 5. Mise à jour du contexte local
            refreshUser(response.data);
            toast.success(response.message || "Profil mis à jour avec succès !");

        } catch (error: any) {
            console.error("Erreur catchée :", error);
            toast.error(error.message || "Erreur lors de la mise à jour du profil.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {allowedFields.map((field) => {
                    const isFile = FILE_FIELDS.includes(field);
                    const label = FIELD_LABELS[field] || field;

                    // RENDU DES CHAMPS FICHIERS (Documents, Avatar, Logo)
                    if (isFile) {
                        return (
                            <div key={field} className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    {label}
                                </label>
                                <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-4 hover:bg-slate-50 transition-colors flex items-center justify-center">
                                    <input
                                        type="file"
                                        accept="image/*,.pdf" // Ajustez les extensions si besoin
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

                    // RENDU DES CHAMPS TEXTES ET NOMBRES
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
                                disabled={field === 'role' || field === 'typeCompte'} // Empêche l'édition de ces champs critiques
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