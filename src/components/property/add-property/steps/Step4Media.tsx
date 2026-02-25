"use client";

import { useState, useId } from "react";
import { Input } from "@/components/ui/input"; // ← si tu utilises shadcn, sinon garde ton input natif

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────
type Step = 1 | 2 | 3 | 4 | 5;

interface PropertyFormData {
  photos: File[];               // ou string[] si tu stockes des URLs temporaires
  prixTotal: number | "";
  fraisVisite: number | "";
  // ... autres champs des étapes précédentes si besoin
}

// ──────────────────────────────────────────────
// Composant Étape 4
// ──────────────────────────────────────────────
export default function Step4Media() {
  const id = useId(); // pour générer des ids uniques

  const [formData, setFormData] = useState<PropertyFormData>({
    photos: [],
    prixTotal: "",
    fraisVisite: 0,
  });

  const maxPhotos = 5;

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const newFiles = Array.from(e.target.files);
    const currentCount = formData.photos.length;

    if (currentCount + newFiles.length > maxPhotos) {
      alert(`Maximum ${maxPhotos} photos autorisées`);
      return;
    }

    setFormData((prev) => ({
      ...prev,
      photos: [...prev.photos, ...newFiles],
    }));
  };

  const removePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">

        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-200">
          <p className="text-sm text-gray-600">Étape 4 sur 4</p>
        </div>

        {/* Progress bar – mise à jour pour cohérence avec étape 3 */}
        <div className="flex items-center gap-3 px-8 py-5 bg-gray-100">
          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-emerald-500 text-white text-sm font-semibold">
            ✓
          </div>
          <div className="flex-1 h-1 bg-emerald-500 rounded" />
          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-emerald-500 text-white text-sm font-semibold">
            ✓
          </div>
          <div className="flex-1 h-1 bg-emerald-500 rounded" />
          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-emerald-500 text-white text-sm font-semibold">
            ✓
          </div>
          <div className="flex-1 h-1 bg-emerald-500 rounded" />
          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-600 text-white text-sm font-semibold">
            4
          </div>
        </div>

        {/* Contenu principal */}
        <div className="p-8 lg:p-10 space-y-10">
          <div className="flex items-center gap-3">
            <svg
              className="w-7 h-7 text-blue-600"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
            </svg>
            <h2 className="text-xl font-medium text-gray-900">
              Photos et tarification
            </h2>
          </div>

          <p className="text-gray-600">
            Ajoutez des photos attractives et définissez votre prix
          </p>

          {/* ─── PHOTOS ──────────────────────────────────────── */}
          <div className="space-y-3">
            <label className="block text-gray-700 font-medium">
              Photos du bien <span className="text-red-600">*</span>
            </label>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
              {/* Photos déjà ajoutées */}
              {formData.photos.map((file, index) => (
                <div key={index} className="relative aspect-square rounded-xl overflow-hidden group">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => removePhoto(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    type="button"
                  >
                    ×
                  </button>
                </div>
              ))}

              {/* Slots vides + input caché */}
              {formData.photos.length < maxPhotos && (
                <label
                  htmlFor={`photo-upload-${id}`}
                  className="aspect-square border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:border-blue-400 hover:bg-blue-50/30 transition-colors cursor-pointer flex items-center justify-center"
                >
                  <input
                    id={`photo-upload-${id}`}
                    type="file"
                    accept="image/jpeg,image/png"
                    multiple
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                  <span className="text-4xl text-gray-400">+</span>
                </label>
              )}

              {/* Slots vides restants (non cliquables) */}
              {Array.from({ length: maxPhotos - formData.photos.length - (formData.photos.length < maxPhotos ? 1 : 0) }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="aspect-square border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 flex items-center justify-center"
                >
                  <span className="text-4xl text-gray-300">+</span>
                </div>
              ))}
            </div>

            <p className="text-sm text-gray-500">
              {formData.photos.length} / {maxPhotos} photos • La première est l’image principale
              <br />
              JPG, PNG — max 5 Mo par photo
            </p>
          </div>

          {/* ─── TARIFICATION ────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Prix total */}
            <div className="space-y-2">
              <label htmlFor="prixTotal" className="block text-gray-700 font-medium">
                Prix <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <Input
                  id="prixTotal"
                  type="number"
                  min={0}
                  value={formData.prixTotal}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      prixTotal: e.target.value === "" ? "" : Number(e.target.value),
                    }))
                  }
                  className="pl-4 pr-16 py-6 text-lg"
                  placeholder="150000"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                  FCFA
                </span>
              </div>
              {formData.prixTotal !== "" && (
                <p className="text-sm text-gray-600">
                  {formData.prixTotal.toLocaleString("fr-FR")} FCFA — prix total pour la vente
                </p>
              )}
            </div>

            {/* Frais de visite */}
            <div className="space-y-2">
              <label htmlFor="fraisVisite" className="block text-gray-700 font-medium">
                Frais de visite
              </label>
              <div className="relative">
                <Input
                  id="fraisVisite"
                  type="number"
                  min={0}
                  value={formData.fraisVisite}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      fraisVisite: e.target.value === "" ? 0 : Number(e.target.value),
                    }))
                  }
                  className="pl-4 pr-16 py-6 text-lg"
                  placeholder="0"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                  FCFA
                </span>
              </div>
              <p className="text-sm text-gray-500">
                Payés par le visiteur avant confirmation de visite
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}