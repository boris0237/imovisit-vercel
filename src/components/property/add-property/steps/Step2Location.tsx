"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"

type Step = 1 | 2 | 3 | 4 | 5

export default function Step2Location() {
  const [step, setStep] = useState<Step>(2)

  if (step !== 2) return null

  return (
    <div className="space-y-6">

      {/* Header étape */}
      <div>
        <p className="text-sm text-slate-500">Étape 2 sur 4</p>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-emerald-500 text-white text-sm font-semibold">
          ✓
        </div>
        <div className="flex-1 h-1 bg-slate-200 rounded" />
        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-900 text-white text-sm font-semibold">
          2
        </div>
        <div className="flex-1 h-1 bg-slate-200 rounded" />
        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 text-slate-600 text-sm font-semibold">
          3
        </div>
        <div className="flex-1 h-1 bg-slate-200 rounded" />
        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 text-slate-600 text-sm font-semibold">
          4
        </div>
      </div>

      {/* Formulaire */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Pays */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Pays :
          </label>
          <Select>
            <SelectTrigger className="bg-white border-slate-200">
              <SelectValue placeholder="Cameroun" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cm">Cameroun</SelectItem>
              <SelectItem value="ci">Côte d'Ivoire</SelectItem>
              <SelectItem value="sn">Sénégal</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Ville */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Ville :
          </label>
          <Select>
            <SelectTrigger className="bg-white border-slate-200">
              <SelectValue placeholder="Sélectionner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yaounde">Yaoundé</SelectItem>
              <SelectItem value="douala">Douala</SelectItem>
              <SelectItem value="bafoussam">Bafoussam</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Quartier */}
        <div className="md:col-span-2 space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Quartier :
          </label>
          <Select>
            <SelectTrigger className="bg-white border-slate-200">
              <SelectValue placeholder="D'abord sélectionner une ville" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bastos">Bastos</SelectItem>
              <SelectItem value="mvan">Mvan</SelectItem>
              <SelectItem value="odza">Odza</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-slate-400">
            Ce site apparaîtra dans les résultats de recherche
          </p>
        </div>

        {/* Adresse */}
        <div className="md:col-span-2 space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Adresse exacte :
          </label>
          <Input
            placeholder="rue, numéro, immeuble, étage..."
            className="bg-white border-slate-200"
          />
        </div>

      </div>
    </div>
  )
}