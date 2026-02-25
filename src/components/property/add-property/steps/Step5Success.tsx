"use client"

import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"

type Step5SuccessProps = {
  data: any
  onFinish: () => void
}

export default function Step5Success({ data, onFinish }: Step5SuccessProps) {
  return (
    <div className="flex flex-col items-center space-y-6 py-6">

      {/* Icône succès */}
      <div className="w-24 h-24 rounded-full bg-green-600 flex items-center justify-center">
        <Check className="text-white w-12 h-12" />
      </div>

      <p className="text-slate-600 text-center">
        Votre bien a été créé avec succès.
      </p>

      {/* Récapitulatif */}
      <div className="w-full bg-slate-50 rounded-xl p-6 space-y-3">

        <h3 className="font-semibold text-slate-700">Récapitulatif</h3>

        <div className="grid grid-cols-2 text-sm">
          <span className="text-slate-500">Type:</span>
          <span className="font-medium text-right">{data.type}</span>

          <span className="text-slate-500">Localisation:</span>
          <span className="font-medium text-right">
            {data.quarter}, {data.city}
          </span>

          <span className="text-slate-500">Surface:</span>
          <span className="font-medium text-right">
            {data.surface} m²
          </span>

          <span className="text-slate-500">Prix:</span>
          <span className="font-semibold text-green-600 text-right">
            {data.price} FCFA
          </span>
        </div>

      </div>

      <Button className="px-8" onClick={onFinish}>
        Suivant →
      </Button>

    </div>
  )
}