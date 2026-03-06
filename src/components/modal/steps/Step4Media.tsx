"use client";

import { Input } from "@/components/ui/input";
import { useRef } from "react";
import { useContext, createContext } from "react";

interface PropertyFormData {
  images?: File[];
  price?: number;
  visitFee?: number;
}

interface Props {
  data: PropertyFormData;
  updateData: (values: Partial<PropertyFormData>) => void;
  prev: () => void;
  next: () => void;
}

export default function Step4Media({
  data,
  updateData,
  prev,
  next,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const fileArray = Array.from(files);
    updateData({ images: [...(data.images || []), ...fileArray] });
  };

  const removeImage = (index: number) => {
    const updated = [...(data.images || [])];
    updated.splice(index, 1);
    updateData({ images: updated });
  };

  const isValid =
    data.price &&
    data.visitFee &&
    data.images &&
    data.images.length > 0;

  return (
    <div className="max-w-3xl mx-auto space-y-8">

       {/* Step indicator */}
      <div className="text-sm text-slate-500 font-medium">
        Étape 4 sur 4
      </div>

        {/* Progress bar */}
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 flex items-center justify-center rounded-md bg-emerald-500 text-white text-sm font-semibold">✓</div>
      <div className="flex-1 h-1 bg-slate-900 rounded" />
      <div className="w-8 h-8 flex items-center justify-center rounded-md bg-emerald-500 text-white text-sm font-semibold">✓</div>
      <div className="flex-1 h-1 bg-slate-900 rounded" />
      <div className="w-8 h-8 flex items-center justify-center rounded-md bg-emerald-500 text-white text-sm font-semibold">✓</div>
      <div className="flex-1 h-1 bg-slate-200 rounded" />
      <div className="w-8 h-8 flex items-center justify-center rounded-md bg-slate-200 text-slate-600 text-sm font-semibold">4</div>
    </div>

      {/* Bloc info */}
      <div className="bg-slate-100 rounded-lg p-4">
        <h3 className="font-medium text-slate-900">
          Photos et tarification
        </h3>
        <p className="text-sm text-slate-500">
          Ajoutez des images du bien et définissez les tarifs
        </p>
      </div>

      {/* Tarification */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Prix du bien (FCFA) :
          </label>
          <Input
            type="number"
            value={data.price || ""}
            onChange={(e) =>
              updateData({ price: Number(e.target.value) })
            }
            placeholder="Ex: 150000"
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Frais de visite (FCFA) :
          </label>
          <Input
            type="number"
            value={data.visitFee || ""}
            onChange={(e) =>
              updateData({ visitFee: Number(e.target.value) })
            }
            placeholder="Ex: 5000"
            className="h-11"
          />
        </div>
      </div>

      {/* Upload images horizontal */}
      <div className="space-y-3">
        <label className="text-sm font-medium">
          Photos du bien :
        </label>

        <div className="flex gap-3 overflow-x-auto pb-2">

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="min-w-[110px] h-[90px] border-2 border-dashed border-slate-300
            rounded-lg flex items-center justify-center text-sm text-slate-500
            hover:border-slate-500 transition"
          >
            + Ajouter
          </button>

          {(data.images || []).map((file, index) => (
            <div
              key={index}
              className="relative min-w-[110px] h-[90px] rounded-lg overflow-hidden border"
            >
              <img
                src={URL.createObjectURL(file)}
                alt="preview"
                className="w-full h-full object-cover"
              />

              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-white text-xs px-1.5 py-0.5 rounded shadow"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <Input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => {
            if (!e.target.files) return;

            const filesArray = Array.from(e.target.files);
            updateData({ images: filesArray });
          }}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4">
        <button
          onClick={prev}
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          Précédent
        </button>

        <button
          onClick={next}
          className="px-6 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg
          hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Valider le bien →
        </button>
      </div>
    </div>
  );
}

interface PropertyFormData {
  images?: File[];
  price?: number;
  visitFee?: number;
}

interface Step4MediaProps {
  data: PropertyFormData;
  updateData: (values: Partial<PropertyFormData>) => void;
  next: () => void;
  prev: () => void;
}