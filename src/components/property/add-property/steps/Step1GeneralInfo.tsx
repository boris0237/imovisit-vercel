"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { KeyRound, Tag, Armchair } from "lucide-react";

// ──────────────────────────────────────────────
// Types (idéalement à déplacer dans ../types.ts)
// ──────────────────────────────────────────────
export interface PropertyFormData {
  type?: "appartement" | "maison" | "terrain" | "";
  offerType?: "location" | "vente" | "meuble" | "";   // ← renommé category → offerType
  title: string;
  // ... autres champs des étapes suivantes
}

interface Props {
  data: PropertyFormData;
  updateData: (values: Partial<PropertyFormData>) => void;
  next: () => void;
}

// ──────────────────────────────────────────────
// Composant Étape 1
// ──────────────────────────────────────────────
export default function Step1GeneralInfo({ data, updateData, next }: Props) {
  const handleOfferType = (value: "location" | "vente" | "meuble") => {
    updateData({ offerType: value });
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-500">Étape 1 sur 4</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Type de bien */}
        <div className="space-y-2">
          <label
            htmlFor="property-type"
            className="text-sm font-medium text-slate-700"
          >
            Type de bien
          </label>
          <Select
            value={data.type || ""}
            onValueChange={(value) => updateData({ type: value as any })}
          >
            <SelectTrigger id="property-type">
              <SelectValue placeholder="Sélectionner un type..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="appartement">Appartement</SelectItem>
              <SelectItem value="maison">Maison</SelectItem>
              <SelectItem value="terrain">Terrain</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Type d'offre */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Type d'offre
          </label>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => handleOfferType("location")}
              className={`flex flex-col items-center justify-center gap-1.5 py-4 border rounded-lg transition-colors text-sm font-medium
                ${
                  data.offerType === "location"
                    ? "border-slate-800 bg-slate-50 shadow-sm"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
            >
              <KeyRound className="w-5 h-5 text-slate-600" />
              Location
            </button>

            <button
              type="button"
              onClick={() => handleOfferType("vente")}
              className={`flex flex-col items-center justify-center gap-1.5 py-4 border rounded-lg transition-colors text-sm font-medium
                ${
                  data.offerType === "vente"
                    ? "border-slate-800 bg-slate-50 shadow-sm"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
            >
              <Tag className="w-5 h-5 text-slate-600" />
              Vente
            </button>

            {/* À conserver seulement si "meublé" est vraiment une catégorie d'offre à part */}
            <button
              type="button"
              onClick={() => handleOfferType("meuble")}
              className={`flex flex-col items-center justify-center gap-1.5 py-4 border rounded-lg transition-colors text-sm font-medium
                ${
                  data.offerType === "meuble"
                    ? "border-slate-800 bg-slate-50 shadow-sm"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
            >
              <Armchair className="w-5 h-5 text-slate-600" />
              Meublé
            </button>
          </div>
        </div>
      </div>

      {/* Titre */}
      <div className="space-y-2">
        <label
          htmlFor="title"
          className="text-sm font-medium text-slate-700"
        >
          Titre de l'annonce
        </label>
        <Input
          id="title"
          value={data.title || ""}
          onChange={(e) => updateData({ title: e.target.value })}
          placeholder="Ex: Appartement F3 lumineux avec balcon – Yaoundé"
          className="h-11"
        />
        <p className="text-xs text-slate-500">
          Soyez précis et attractif (max 80 caractères recommandé)
        </p>
      </div>

      {/* Bouton continuer */}
      <div className="flex justify-end pt-4">
        <button
          onClick={next}
          disabled={!data.type || !data.offerType || !data.title.trim()}
          className="px-6 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg
            hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continuer
        </button>
      </div>
    </div>
  );
}