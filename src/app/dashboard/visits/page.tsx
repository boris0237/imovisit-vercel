"use client"

import { useMemo, useState } from 'react'
import {
  CalendarCheck,
  Check,
  Download,
  Eye,
  FileCheck2,
  Phone,
  Timer,
  User,
  Video,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'


const stats = [
  {
    title: 'Total visites',
    value: '24',
    subtitle: 'Ce mois-ci',
    tone: 'bg-blue-50 text-blue-700',
    icon: CalendarCheck,
  },
  {
    title: 'Confirmées',
    value: '12',
    subtitle: 'À venir',
    tone: 'bg-emerald-50 text-emerald-700',
    icon: Check,
  },
  {
    title: 'Réalisées',
    value: '7',
    subtitle: 'Ce mois-ci',
    tone: 'bg-violet-50 text-violet-700',
    icon: FileCheck2,
  },
  {
    title: 'Non réalisées',
    value: '5',
    subtitle: 'Ce mois-ci',
    tone: 'bg-rose-50 text-rose-700',
    icon: X,
  },
]

const tabs = [
  { key: 'all', label: 'Toutes les visites', count: 2 },
  { key: 'upcoming', label: 'À venir', count: 1 },
  { key: 'done', label: 'Réalisées', count: 5 },
  { key: 'missed', label: 'Non réalisées', count: 5 },
]

const visits = [
  {
    id: 'v1',
    name: 'Marie Claire',
    property: 'Appartement T3 - Yaoundé',
    time: '12:00',
    type: 'À distance',
    fee: '5,000 FCFA',
    status: 'upcoming',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400',
  },
  {
    id: 'v2',
    name: 'Sophie Ndongo',
    property: 'Appartement T3 - Yaoundé',
    time: '11:00',
    type: 'Présentiel',
    status: 'done',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400',
  },
]

export default function VisitsPage() {
  const [panelOpen, setPanelOpen] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'done' | 'missed'>('all')

  const filteredVisits = useMemo(() => {
    if (activeTab === 'all') return visits
    return visits.filter((visit) => visit.status === activeTab)
  }, [activeTab])

  return (
    <div className="relative flex-1">
      <header className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Gestion des visites</h1>
            <p className="text-sm text-slate-500">Suivez et gérez toutes vos visites programmées</p>
          </div>
          <Button className="bg-slate-900 hover:bg-slate-800 gap-2">
            <Download className="w-4 h-4" />
            Exporter
          </Button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="border-slate-200">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">{stat.title}</p>
                  <p className="text-2xl font-semibold text-slate-900">{stat.value}</p>
                  <p className="text-xs text-slate-500">{stat.subtitle}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.tone}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="inline-flex bg-slate-100 p-1 rounded-xl">
            {tabs.map((tab) => (
              <button
                key={tab.label}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${
                  activeTab === tab.key ? 'bg-white shadow text-slate-900' : 'text-slate-500'
                }`}
              >
                {tab.label}
                <span className="h-5 min-w-[20px] rounded-full bg-amber-100 text-amber-700 text-xs flex items-center justify-center">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="bg-white border-slate-200">
              Tous les biens
            </Button>
            <Button variant="outline" className="bg-white border-slate-200">
              Tous les types
            </Button>
          </div>
        </div>

        <Card className="border-slate-200">
          <CardContent className="p-0">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div className="flex items-center gap-2 text-slate-900 font-semibold">
                <span className="h-2 w-2 rounded-full bg-slate-900" />
                Mercredi 18 Février 2026
              </div>
              <span className="text-sm text-slate-500">2 visites</span>
            </div>
            <div className="divide-y divide-slate-200">
              {filteredVisits.map((visit) => (
                <button
                  key={visit.id}
                  onClick={() => setPanelOpen(true)}
                  className="w-full text-left px-6 py-5 hover:bg-slate-50 flex flex-col md:flex-row md:items-center gap-4"
                >
                  <img
                    src={visit.image}
                    alt={visit.property}
                    className="w-20 h-20 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{visit.name}</p>
                    <p className="text-sm text-slate-500">{visit.property}</p>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
                      <div className="flex items-center gap-1">
                        <Timer className="w-4 h-4" />
                        {visit.time}
                      </div>
                      <div className="flex items-center gap-1">
                        {visit.type === 'À distance' ? <Video className="w-4 h-4" /> : <User className="w-4 h-4" />}
                        {visit.type}
                      </div>
                      {visit.fee && (
                        <div className="flex items-center gap-1 text-emerald-600">
                          <Eye className="w-4 h-4" />
                          {visit.fee}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {panelOpen && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-slate-900/30" onClick={() => setPanelOpen(false)} />
          <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl flex flex-col">
            <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Détails de la visite</h3>
              <button onClick={() => setPanelOpen(false)} className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 overflow-auto flex-1 space-y-6">
              <div className="flex items-center gap-4 bg-amber-50 border border-amber-100 rounded-xl p-4 text-amber-700">
                <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold">Toutes les visites</p>
                  <p className="text-xs">ID: #0003</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs uppercase text-slate-400">Visiteur</p>
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center text-xl font-semibold text-slate-600">
                    S
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Marie Claire</p>
                    <div className="flex flex-col gap-1 text-sm text-slate-500">
                      <span className="flex items-center gap-2">
                        <Phone className="w-4 h-4" /> +237 655 44 33 22
                      </span>
                      <span className="flex items-center gap-2">
                        <User className="w-4 h-4" /> sophie@gmail.com
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs uppercase text-slate-400">Bien concerné</p>
                <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-4">
                  <img
                    src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=300"
                    alt="Appartement"
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                  <div>
                    <p className="font-semibold text-slate-900">Appartement meublé - Yaoundé</p>
                    <p className="text-sm text-slate-500">Rue 1.123, Bastos</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs uppercase text-slate-400">Détails de la visite</p>
                <div className="flex items-center justify-between border-b border-slate-200 pb-3 text-sm">
                  <span className="text-slate-500">Date</span>
                  <span className="text-slate-900 font-semibold">Mercredi 18 février 2026</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-200 pb-3 text-sm">
                  <span className="text-slate-500">Heure</span>
                  <span className="text-slate-900 font-semibold">12:00</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Type</span>
                  <span className="text-slate-900 font-semibold">À distance</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
