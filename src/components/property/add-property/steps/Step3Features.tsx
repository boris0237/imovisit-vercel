"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Types

type Step = 1 | 2 | 3 | 4 | 5;

interface PropertyFormData {
  surface?: number;
  pieces?: string;
  sallesDeBain?: number;
  commodites: string[];
  
}

// Composant Étape 3

export default function Step3Features() {
  const [formData, setFormData] = useState<PropertyFormData>({
    commodites: [],
  });

  // Liste des commodités 
  const amenitiesList = [
    "Eau courante",
    "Électricité",
    "Wi-Fi",
    "Parking",
    "Forage",
    "Gardien",
    "Piscine",
    "Service nettoyage",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-sm text-slate-500">Étape 3 sur 4</p>
      </div>

      {/* Barre de progression – inchangée */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-emerald-500 text-white text-sm font-semibold">
          ✓
        </div>
        <div className="flex-1 h-1 bg-slate-900 rounded" />
        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-emerald-500 text-white text-sm font-semibold">
          ✓
        </div>
        <div className="flex-1 h-1 bg-slate-900 rounded" />
        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-900 text-white text-sm font-semibold">
          3
        </div>
        <div className="flex-1 h-1 bg-slate-200 rounded" />
        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 text-slate-600 text-sm font-semibold">
          4
        </div>
      </div>

      {/* Bloc d'information */}
      <div className="bg-slate-100 border-l-4 border-slate-900 p-4 rounded-md">
        <p className="text-sm font-semibold text-slate-800">Caractéristiques</p>
        <p className="text-sm text-slate-500">
          Détaillez les spécificités techniques du bien
        </p>
      </div>

      {/* Champs principaux */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Surface */}
        <div className="space-y-2">
          <label htmlFor="surface" className="text-sm font-medium text-slate-700">
            Surface (m²)
          </label>
          <div className="relative">
            <Input
              id="surface"
              type="number"
              min={0}
              placeholder="75"
              value={formData.surface ?? ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  surface: e.target.value === "" ? undefined : Number(e.target.value),
                }))
              }
              className="bg-white border-slate-200 pr-10"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 pointer-events-none">
              m²
            </span>
          </div>
        </div>

        {/* Nombre de pièces */}
        <div className="space-y-2">
          <label htmlFor="pieces" className="text-sm font-medium text-slate-700">
            Nombre de pièces
          </label>
          <Select
            value={formData.pieces}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, pieces: value }))
            }
          >
            <SelectTrigger id="pieces" className="bg-white border-slate-200">
              <SelectValue placeholder="Sélectionner le nombre de pièces" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 pièce</SelectItem>
              <SelectItem value="2">2 pièces</SelectItem>
              <SelectItem value="3">3 pièces</SelectItem>
              <SelectItem value="4">4 pièces</SelectItem>
              <SelectItem value="5">5 pièces</SelectItem>
              <SelectItem value="6">6 pièces</SelectItem>
              <SelectItem value="7">7 pièces</SelectItem>
              <SelectItem value="8+">8 pièces et plus</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Salles de bain */}
        <div className="space-y-2">
          <label htmlFor="sallesDeBain" className="text-sm font-medium text-slate-700">
            Salles de bain
          </label>
          <Input
            id="sallesDeBain"
            type="number"
            min={0}
            placeholder="1"
            value={formData.sallesDeBain ?? ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                sallesDeBain: e.target.value === "" ? undefined : Number(e.target.value),
              }))
            }
            className="bg-white border-slate-200"
          />
        </div>
      </div>

      {/* Commodités */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-slate-800">Commodités disponibles</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {amenitiesList.map((item) => {
            const isChecked = formData.commodites.includes(item);

            return (
              <label
                key={item}
                htmlFor={`amenity-${item}`}
                className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 bg-white cursor-pointer hover:border-slate-400 transition-colors"
              >
                <input
                  id={`amenity-${item}`}
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => {
                    setFormData((prev) => {
                      if (e.target.checked) {
                        return {
                          ...prev,
                          commodites: [...prev.commodites, item],
                        };
                      }
                      return {
                        ...prev,
                        commodites: prev.commodites.filter((c) => c !== item),
                      };
                    });
                  }}
                  className="accent-slate-900 h-4 w-4"
                />
                <span className="text-sm text-slate-700 select-none">{item}</span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}