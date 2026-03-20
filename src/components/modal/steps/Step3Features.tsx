"use client";

import { Input } from "@/components/ui/input";

interface PropertyFormData {
  surface?: number;
  rooms?: number;
  bathrooms?: number;
  amenities?: string[];
}

interface Props {
  data: PropertyFormData;
  updateData: (values: Partial<PropertyFormData>) => void;
  prev: () => void;
  next: () => void;
}

const amenitiesList = [
  "Eau courante",
  "Electricité",
  "Wi-Fi",
  "Parking",
  "Forage",
  "Gardien",
  "Piscine",
  "Service nettoyage",
];

export default function Step3Features({
  data,
  updateData,
  prev,
  next,
}: Props) {

  const toggleAmenity = (amenity: string) => {
    const current = data.amenities || [];
    const exists = current.includes(amenity);

    const updated = exists
      ? current.filter((a) => a !== amenity)
      : [...current, amenity];

    updateData({ amenities: updated });
  };

  const isValid =
    !!data.surface &&
    !!data.rooms &&
    !!data.bathrooms;

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-6 space-y-8">

      {/* Step indicator */}
      <div className="text-sm text-slate-500 font-medium">
        Étape 3 sur 4
      </div>

       {/* Progress bar */}
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 flex items-center justify-center rounded-md bg-emerald-500 text-white text-sm font-semibold">✓</div>
      <div className="flex-1 h-1 bg-slate-900 rounded" />
      <div className="w-8 h-8 flex items-center justify-center rounded-md bg-emerald-500 text-white text-sm font-semibold">✓</div>
      <div className="flex-1 h-1 bg-slate-900 rounded" />
      <div className="w-8 h-8 flex items-center justify-center rounded-md bg-slate-900 text-white text-sm font-semibold">3</div>
      <div className="flex-1 h-1 bg-slate-200 rounded" />
      <div className="w-8 h-8 flex items-center justify-center rounded-md bg-slate-200 text-slate-600 text-sm font-semibold">4</div>
    </div>

      {/* Bloc info */}
      <div className="bg-slate-100 rounded-lg p-4">
        <h3 className="font-medium text-slate-900">
          Caractéristiques
        </h3>
        <p className="text-sm text-slate-500">
          Détaillez les spécificités techniques du bien
        </p>
      </div>

      {/* Champs principaux */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="space-y-2 w-full">
          <label className="text-sm font-medium text-slate-700">
            Surface (m²) :
          </label>
          <Input
            type="number"
            value={data.surface ?? ""}
            onChange={(e) =>
              updateData({ surface: Number(e.target.value) })
            }
            className="h-11 w-full"
            placeholder="Ex: 75"
          />
        </div>

        <div className="space-y-2 w-full">
          <label className="text-sm font-medium text-slate-700">
            Nombre de pièces :
          </label>
          <Input
            type="number"
            value={data.rooms ?? ""}
            onChange={(e) =>
              updateData({ rooms: Number(e.target.value) })
            }
            className="h-11 w-full"
            placeholder="Ex: 3"
          />
        </div>

        <div className="space-y-2 w-full">
          <label className="text-sm font-medium text-slate-700">
            Salle de bain :
          </label>
          <Input
            type="number"
            value={data.bathrooms ?? ""}
            onChange={(e) =>
              updateData({ bathrooms: Number(e.target.value) })
            }
            className="h-11 w-full"
            placeholder="Ex: 1"
          />
        </div>

      </div>

      {/* Commodités */}
      <div className="space-y-4">
        <label className="text-sm font-medium text-slate-700">
          Commodités disponibles :
        </label>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

          {amenitiesList.map((amenity) => {
            const active = data.amenities?.includes(amenity);

            return (
              <button
                key={amenity}
                type="button"
                onClick={() => toggleAmenity(amenity)}
                className={`h-11 rounded-lg border text-sm font-medium transition
                ${active
                  ? "border-slate-900 bg-slate-50"
                  : "border-slate-200 hover:border-slate-400"
                }`}
              >
                {amenity}
              </button>
            );
          })}

        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-6 border-t">

        <button
          type="button"
          onClick={prev}
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          Précédent
        </button>

        <button
          type="button"
          onClick={next}
          className="px-6 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg
          hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Suivant →
        </button>

      </div>
    </div>
  );
}