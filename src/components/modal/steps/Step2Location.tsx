"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PropertyFormData {
  country?: string;
  city?: string;
  district?: string;
  address?: string;
}

interface Props {
  data: PropertyFormData;
  updateData: (values: Partial<PropertyFormData>) => void;
  prev: () => void;
  next: () => void;
}

export default function Step2Location({
  data,
  updateData,
  prev,
  next,
}: Props) {

  const isValid =
    !!data.country &&
    !!data.city &&
    !!data.district &&
    !!data.address;

  return (
    <div className="max-w-3xl mx-auto space-y-8">

      <div className="text-sm text-slate-500 font-medium">
        Étape 2 sur 4
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 flex items-center justify-center rounded-md bg-emerald-500 text-white text-sm font-semibold">
          ✓
        </div>

        <div className="flex-1 h-1 bg-slate-200 rounded" />

        <div className="w-8 h-8 flex items-center justify-center rounded-md bg-slate-900 text-white text-sm font-semibold">
          2
        </div>

        <div className="flex-1 h-1 bg-slate-200 rounded" />

        <div className="w-8 h-8 flex items-center justify-center rounded-md bg-slate-200 text-slate-600 text-sm font-semibold">
          3
        </div>

        <div className="flex-1 h-1 bg-slate-200 rounded" />

        <div className="w-8 h-8 flex items-center justify-center rounded-md bg-slate-200 text-slate-600 text-sm font-semibold">
          4
        </div>
      </div>

      {/* Info */}
      <div className="bg-slate-100 rounded-lg p-4">
        <h3 className="font-medium text-slate-900">
          Localisation du bien
        </h3>

        <p className="text-sm text-slate-500">
          Indiquez l’emplacement précis du bien immobilier
        </p>
      </div>

      {/* Pays + Ville */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div className="space-y-2">

          <label className="text-sm font-medium">
            Pays *
          </label>

          <Select
            value={data.country || ""}
            onValueChange={(value) =>
              updateData({ country: value })
            }
          >
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Sélectionner un pays" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="cameroon">Cameroun</SelectItem>
              <SelectItem value="france">France</SelectItem>
              <SelectItem value="canada">Canada</SelectItem>
            </SelectContent>

          </Select>
        </div>

        <div className="space-y-2">

          <label className="text-sm font-medium">
            Ville *
          </label>

          <Select
            value={data.city || ""}
            onValueChange={(value) =>
              updateData({ city: value })
            }
          >
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Sélectionner une ville" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="yaounde">Yaoundé</SelectItem>
              <SelectItem value="douala">Douala</SelectItem>
              <SelectItem value="bafoussam">Bafoussam</SelectItem>
            </SelectContent>

          </Select>

        </div>

      </div>

      {/* Quartier */}
      <div className="space-y-2">

        <label className="text-sm font-medium">
          Quartier *
        </label>

        <Input
          value={data.district || ""}
          disabled={!data.city}
          onChange={(e) =>
            updateData({ district: e.target.value })
          }
          placeholder="Ex : Bastos, Bonapriso..."
          className="h-11"
        />

      </div>

      {/* Adresse */}
      <div className="space-y-2">

        <label className="text-sm font-medium">
          Adresse exacte *
        </label>

        <Input
          value={data.address || ""}
          onChange={(e) =>
            updateData({ address: e.target.value })
          }
          placeholder="Rue, numéro, immeuble..."
          className="h-11"
        />

      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4">

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
          disabled={!isValid}
          className="px-6 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg
          hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Suivant →
        </button>

      </div>

    </div>
  );
}