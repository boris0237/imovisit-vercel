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

interface PropertyFormData {
  type?: string;
  offerType?: string;
  title?: string;
  description?: string;
}

interface Props {
  data: PropertyFormData;
  updateData: (values: Partial<PropertyFormData>) => void;
  next: () => void;
  prev: () => void;
}

export default function Step1GeneralInfo({
  data,
  updateData,
  next,
  prev,
}: Props) {

  const selectOffer = (value: "location" | "vente" | "meuble") => {
    updateData({ offerType: value });
  };

  const isValid =
    !!data.type &&
    !!data.offerType &&
    (data.title?.trim().length ?? 0) > 0;

  return (
    <div className="max-w-4xl mx-auto px-2 space-y-8">

      <div className="text-sm text-slate-500 font-medium">
        Étape 1 sur 4
      </div>

      <div className="flex items-center gap-3">
        <div className="w-8 h-8 flex items-center justify-center rounded-md bg-slate-900 text-white text-sm font-semibold">
          1
        </div>
        <div className="flex-1 h-1 bg-slate-200 rounded" />
        <div className="w-8 h-8 flex items-center justify-center rounded-md bg-slate-200 text-slate-600 text-sm font-semibold">
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

      <div className="bg-slate-100 border border-slate-200 rounded-xl p-5">
        <h3 className="font-semibold text-slate-900">
          Informations générales
        </h3>

        <p className="text-sm text-slate-500">
          Définissez le type de bien et l'offre souhaitée
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Type de bien
          </label>

          <Select
            value={data.type || ""}
            onValueChange={(value) => updateData({ type: value })}
          >
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Sélectionner un bien..." />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="appartement">Appartement</SelectItem>
              <SelectItem value="maison">Maison</SelectItem>
              <SelectItem value="terrain">Terrain</SelectItem>
            </SelectContent>
          </Select>

        </div>

        <div className="space-y-2">

          <label className="text-sm font-medium text-slate-700">
            Type d'offre
          </label>

          <div className="grid grid-cols-3 gap-3">

            <button
              type="button"
              onClick={() => selectOffer("location")}
              className={`border rounded-md py-3 text-sm flex flex-col items-center gap-1
              ${data.offerType === "location"
              ? "border-slate-900 bg-slate-100"
              : "border-slate-200 hover:border-slate-400"}`}
            >
              <KeyRound className="w-4 h-4" />
              Location
            </button>

            <button
              type="button"
              onClick={() => selectOffer("vente")}
              className={`border rounded-md py-3 text-sm flex flex-col items-center gap-1
              ${data.offerType === "vente"
              ? "border-slate-900 bg-slate-100"
              : "border-slate-200 hover:border-slate-400"}`}
            >
              <Tag className="w-4 h-4" />
              Vente
            </button>

            <button
              type="button"
              onClick={() => selectOffer("meuble")}
              className={`border rounded-md py-3 text-sm flex flex-col items-center gap-1
              ${data.offerType === "meuble"
              ? "border-slate-900 bg-slate-100"
              : "border-slate-200 hover:border-slate-400"}`}
            >
              <Armchair className="w-4 h-4" />
              Meublé
            </button>

          </div>

        </div>
      </div>

      <div className="space-y-2">

        <label className="text-sm font-medium text-slate-700">
          Titre du bien
        </label>

        <Input
          value={data.title || ""}
          onChange={(e) => updateData({ title: e.target.value })}
          placeholder="Ex: Appartement moderne avec balcon"
          className="h-12"
        />

      </div>

      <div className="space-y-2">

        <label className="text-sm text-slate-700">
          Description
        </label>

        <textarea
          value={data.description || ""}
          onChange={(e) => updateData({ description: e.target.value })}
          placeholder="Décrivez votre bien..."
          className="w-full min-h-[140px] border border-slate-200 rounded-xl p-3 text-sm"
          maxLength={500}
        />

        <div className="text-right text-xs text-slate-400">
          {(data.description?.length ?? 0)}/500
        </div>

      </div>

      <div className="flex items-center justify-between pt-6">

        <button
          onClick={prev}
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          Annuler
        </button>

        <button
          onClick={next}
          disabled={!isValid}
          className="px-8 py-3 bg-slate-900 text-white text-sm font-medium rounded-xl
          hover:bg-slate-800 disabled:opacity-50"
        >
          Suivant →
        </button>

      </div>

    </div>
  );
}