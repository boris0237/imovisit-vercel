import React, { useState } from 'react';
import { 
  Home, 
  Building2, 
  Handshake, 
  BedDouble, 
  Store, 
  UserRound, 
  Construction, 
  UploadCloud, 
  CheckCircle2 
} from 'lucide-react';

// Définition des types de bailleurs
const LANDLORD_TYPES = [
  { id: 'proprietaire', label: 'Propriétaire', icon: Home },
  { id: 'gestionnaire', label: 'Gestionnaire', icon: Building2 },
  { id: 'demarcheur', label: 'Démarcheur', icon: Handshake },
  { id: 'residence', label: 'Résidence meublée', icon: BedDouble },
  { id: 'agence', label: 'Agence', icon: Store },
  { id: 'agent', label: 'Agent', icon: UserRound },
  { id: 'promoteur', label: 'Promoteur', icon: Construction },
];

export default function UpdateRegister() {
  const [selectedType, setSelectedType] = useState('agence');

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white font-sans text-[#1a2b4b]">
      {/* Header */}
      <header className="text-center mb-10">
        <h1 className="text-3xl font-extrabold mb-2">Type de bailleur</h1>
        <p className="text-gray-500 text-sm">Précisez votre compte professionnel</p>
      </header>

      {/* Grid de sélection */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {LANDLORD_TYPES.map((type) => {
          const Icon = type.icon;
          const isSelected = selectedType === type.id;
          
          return (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all duration-200 group
                ${isSelected 
                  ? 'border-[#2b3a67] bg-[#eef2f8] shadow-sm' 
                  : 'border-gray-100 hover:border-gray-300 bg-white'
                }`}
            >
              <div className={`mb-3 p-3 rounded-lg transition-transform group-hover:scale-110`}>
                <Icon size={32} className={isSelected ? 'text-[#2b3a67]' : 'text-gray-400'} />
              </div>
              <span className={`text-sm font-bold ${isSelected ? 'text-[#1a2b4b]' : 'text-gray-600'}`}>
                {type.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Formulaire dynamique (exemple pour Agence) */}
      <div className="space-y-8">
        {/* Nom de la société */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-gray-700">Nom de la société</label>
          <input 
            type="text" 
            placeholder="Imovisit.com"
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2b3a67] focus:border-transparent transition-all"
          />
        </div>

        {/* Upload Logo */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-gray-700">Logo de l'agence</label>
          <div className="border-2 border-dashed border-gray-200 rounded-2xl p-10 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer group">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4 group-hover:bg-gray-300 transition-colors overflow-hidden">
                <Store size={40} className="text-gray-500" />
            </div>
            <p className="text-sm font-bold mb-1">Cliquer pour ajouter votre logo</p>
            <p className="text-xs text-gray-400">Format recommandé : PNG, JPG (max 2MB)</p>
            <p className="text-[10px] text-gray-300 mt-1 italic">Ce logo sera visible sur votre profil et vos annonces</p>
          </div>
        </div>

        {/* Documents justificatifs */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-gray-700">Documents justificatifs (optionnel)</label>
          <div className="border-2 border-dashed border-gray-200 rounded-2xl p-10 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer group">
            <UploadCloud size={48} className="text-gray-300 mb-4 group-hover:text-gray-400 transition-colors" />
            <p className="text-xs text-gray-400 text-center max-w-[250px] leading-relaxed">
              Cliquer pour ajouter des documents CNI, Titre foncier, RCCM etc
            </p>
          </div>
        </div>

        {/* Bouton de validation */}
        <button className="w-full bg-[#1a2b4b] hover:bg-[#121d33] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98]">
          Finaliser l'inscription
          <CheckCircle2 size={18} />
        </button>
      </div>
    </div>
  );
}