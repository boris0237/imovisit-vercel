"use client";

import { CheckCircle2 } from "lucide-react";

interface PropertyFormData {
  type?: string;
  offerType?: string;
  title?: string;
  surface?: number;
  rooms?: number;
  bathrooms?: number;
  price?: number;
  visitFee?: number;
  images?: File[];
}

interface Props {
  data: PropertyFormData;
  onFinish: () => void;
}

export default function Step5Success({ data, onFinish }: Props) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">

      {/* Icône succès */}
      <div className="flex justify-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
      </div>

      {/* Message */}
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-slate-900">
          Bien ajouté avec succès
        </h2>
        <p className="text-slate-500 text-sm">
          Voici le récapitulatif du bien enregistré
        </p>
      </div>

      {/* Récapitulatif */}
      <div className="border rounded-xl p-5 space-y-3 bg-slate-50 text-sm">

        <div className="flex justify-between">
          <span className="text-slate-500">Titre</span>
          <span className="font-medium">{data.title}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-500">Type</span>
          <span className="font-medium">{data.type}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-500">Offre</span>
          <span className="font-medium">{data.offerType}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-500">Surface</span>
          <span className="font-medium">{data.surface} m²</span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-500">Prix</span>
          <span className="font-medium">{data.price} FCFA</span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-500">Frais de visite</span>
          <span className="font-medium">{data.visitFee} FCFA</span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-500">Photos</span>
          <span className="font-medium">
            {data.images?.length || 0}
          </span>
        </div>

      </div>

      {/* Bouton */}
      <div className="text-center">
        <button
          onClick={onFinish}
          className="px-8 py-3 bg-imo-primary text-white text-sm font-medium rounded-xl hover:bg-slate-800"
        >
          Terminer
        </button>
      </div>

    </div>
  );
}