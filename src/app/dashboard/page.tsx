"use client"

import {
  Bell,
  Building2,
  Calendar,
  ClipboardList,
  Crown,
  FileCheck2,
  FileText,
  LayoutGrid,
  MessageSquare,
  Plus,
  Settings,
  Star,
  Users,
  Wallet,
  Briefcase,
  LogOut,
  PieChart,
  Eye,
  Heart,
  UserCheck,
  Wrench,
  Gauge,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const performanceCards = [
  {
    title: 'Biens totaux',
    value: '24',
    change: '+3% ce mois',
    icon: Building2,
    tone: 'bg-indigo-50 text-indigo-600',
  },
  {
    title: 'Visites réservées',
    value: '156',
    change: '+12% ce mois',
    icon: Calendar,
    tone: 'bg-amber-50 text-amber-600',
  },
  {
    title: 'Locataires actifs',
    value: '18',
    change: '+2% ce mois',
    icon: Users,
    tone: 'bg-cyan-50 text-cyan-600',
  },
  {
    title: 'Ventes réalisées',
    value: '12.5M',
    change: '+8% ce mois',
    icon: FileCheck2,
    tone: 'bg-pink-50 text-pink-600',
  },
  {
    title: 'Loyers encaissés',
    value: '12.5M',
    change: '+5% ce mois',
    icon: Wallet,
    tone: 'bg-emerald-50 text-emerald-600',
  },
  {
    title: 'Dépenses',
    value: '3.2M',
    change: '-2% ce mois',
    icon: Gauge,
    tone: 'bg-rose-50 text-rose-600',
  },
]

const donutData = [
  {
    title: 'Biens',
    legend: [
      { label: 'Locations', color: '#F7901E' },
      { label: 'Ventes', color: '#12B981' },
      { label: 'Meublés', color: '#1E2A49' },
    ],
    gradient: 'conic-gradient(#12B981 0 35%, #F7901E 35% 65%, #1E2A49 65% 100%)',
  },
  {
    title: 'Visites',
    legend: [
      { label: 'À venir', color: '#F7901E' },
      { label: 'Réalisées', color: '#12B981' },
      { label: 'Non réalisées', color: '#EF4444' },
    ],
    gradient: 'conic-gradient(#F7901E 0 30%, #12B981 30% 70%, #EF4444 70% 100%)',
  },
  {
    title: 'Locataires',
    legend: [
      { label: 'En règle', color: '#12B981' },
      { label: 'En attente', color: '#F7901E' },
      { label: 'En retard', color: '#EF4444' },
    ],
    gradient: 'conic-gradient(#12B981 0 40%, #F7901E 40% 65%, #EF4444 65% 100%)',
  },
]

const chartCards = [
  {
    title: 'Biens (03 derniers mois)',
    legend: [
      { label: 'Loyers', color: '#F7901E' },
      { label: 'Ventes', color: '#12B981' },
      { label: 'Meublés', color: '#1E2A49' },
    ],
    bars: [
      { label: 'Jan', values: [70, 40, 90], colors: ['#F7901E', '#12B981', '#1E2A49'] },
      { label: 'Fev', values: [40, 70, 50], colors: ['#EF4444', '#12B981', '#F7901E'] },
      { label: 'Mars', values: [90, 45, 50], colors: ['#EF4444', '#F7901E', '#12B981'] },
    ],
  },
  {
    title: 'Loyers (03 derniers mois)',
    legend: [{ label: 'Loyers', color: '#12B981' }],
    bars: [
      { label: 'Avril', values: [45], colors: ['#12B981'] },
      { label: 'Mai', values: [70], colors: ['#12B981'] },
      { label: 'Juin', values: [90], colors: ['#12B981'] },
    ],
  },
  {
    title: 'Dépenses (03 derniers mois)',
    legend: [{ label: 'Dépenses', color: '#EF4444' }],
    bars: [
      { label: 'Jan', values: [55], colors: ['#EF4444'] },
      { label: 'Fev', values: [60], colors: ['#EF4444'] },
      { label: 'Mars', values: [75], colors: ['#EF4444'] },
    ],
  },
  {
    title: 'Ventes (03 derniers mois)',
    legend: [{ label: 'Ventes', color: '#1E2A49' }],
    bars: [
      { label: 'Jan', values: [55], colors: ['#1E2A49'] },
      { label: 'Fev', values: [60], colors: ['#1E2A49'] },
      { label: 'Mars', values: [75], colors: ['#1E2A49'] },
    ],
  },
]

export default function DashboardOverviewPage() {
  return (
    <>
      <header className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Tableau de bord</h1>
            <p className="text-sm text-slate-500 mt-2">
              Bienvenue Yves ZOGO, voici l&apos;état de votre activité immobilière en temps réel.
            </p>
          </div>
          <Button className="bg-slate-900 hover:bg-slate-800 gap-2">
            <Plus className="w-4 h-4" />
            Ajouter un bien
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
          <Card className="border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-slate-900 font-semibold mb-6">
                <PieChart className="w-4 h-4 text-indigo-500" />
                Performance Globale
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {performanceCards.map((card) => (
                  <div
                    key={card.title}
                    className="border border-slate-200 rounded-2xl p-5 bg-white shadow-sm"
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${card.tone}`}>
                      <card.icon className="w-5 h-5" />
                    </div>
                    <div className="mt-6">
                      <p className="text-3xl font-semibold text-slate-900">{card.value}</p>
                      <p className="text-sm text-slate-500">{card.title}</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-200 text-xs text-emerald-600">
                      ↑ {card.change}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6">
            <div className="bg-gradient-to-br from-[#1B2C4E] to-[#0F1D38] rounded-3xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-lg">
                  <Crown className="w-5 h-5 text-amber-300" />
                  Premium
                </div>
                <span className="px-3 py-1 rounded-full bg-white/20 text-xs">Actif</span>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-white/10 rounded-2xl p-4">
                  <p className="text-2xl font-semibold">45</p>
                  <p className="text-sm text-white/70">Jours restants</p>
                </div>
                <div className="bg-white/10 rounded-2xl p-4">
                  <p className="text-2xl font-semibold">23</p>
                  <p className="text-sm text-white/70">Visites restantes</p>
                </div>
              </div>
              <div className="mt-6">
                <div className="flex items-center justify-between text-xs text-white/70">
                  <span>Utilisation du forfait</span>
                  <span>77%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full mt-2">
                  <div className="h-2 bg-white rounded-full w-[77%]" />
                </div>
              </div>
              <button className="mt-6 w-full bg-white text-slate-900 rounded-xl py-3 font-semibold">
                Recharger maintenant
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6">
              <div className="flex items-center gap-2 font-semibold text-slate-900 mb-6">
                <Eye className="w-4 h-4 text-slate-700" />
                Visibilité
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-2xl p-4">
                  <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm">
                    <Eye className="w-4 h-4 text-slate-700" />
                  </div>
                  <p className="text-xl font-semibold text-slate-900 mt-4">1,234</p>
                  <p className="text-xs text-slate-500">Vues cumulées</p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4">
                  <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm">
                    <Heart className="w-4 h-4 text-pink-500" />
                  </div>
                  <p className="text-xl font-semibold text-slate-900 mt-4">89</p>
                  <p className="text-xs text-slate-500">Favoris</p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4">
                  <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm">
                    <Users className="w-4 h-4 text-slate-700" />
                  </div>
                  <p className="text-xl font-semibold text-slate-900 mt-4">5</p>
                  <p className="text-xs text-slate-500">Agents</p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4">
                  <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm">
                    <Wrench className="w-4 h-4 text-emerald-500" />
                  </div>
                  <p className="text-xl font-semibold text-slate-900 mt-4">12</p>
                  <p className="text-xs text-slate-500">Prestataires</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {donutData.map((donut) => (
              <div key={donut.title} className="bg-white border border-slate-200 rounded-2xl p-6">
                <p className="font-semibold text-slate-900">{donut.title}</p>
                <div className="mt-6 flex items-center gap-6">
                  <div
                    className="w-28 h-28 rounded-full"
                    style={{ background: donut.gradient }}
                  >
                    <div className="w-16 h-16 bg-white rounded-full mx-auto mt-6" />
                  </div>
                  <div className="space-y-3">
                    {donut.legend.map((item) => (
                      <div key={item.label} className="flex items-center gap-2 text-sm text-slate-500">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        {item.label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {chartCards.map((chart) => (
              <div key={chart.title} className="bg-white border border-slate-200 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="font-semibold text-slate-900">{chart.title}</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500 mb-6">
                  {chart.legend.map((item) => (
                    <div key={item.label} className="flex items-center gap-2">
                      <span className="w-6 h-3 rounded-sm" style={{ backgroundColor: item.color }} />
                      {item.label}
                    </div>
                  ))}
                </div>
                <div className="bg-slate-50 rounded-2xl p-4">
                  <div className="flex items-center justify-between text-sm text-slate-700 mb-4">
                    <button className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center">
                      ‹
                    </button>
                    <span>Janvier-Février - Mars</span>
                    <button className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center">
                      ›
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-6 items-end h-40 px-4">
                    {chart.bars.map((group) => (
                      <div key={group.label} className="flex flex-col items-center gap-3">
                        <div className="flex items-end gap-2 h-28">
                          {group.values.map((value, index) => (
                            <div
                              key={`${group.label}-${index}`}
                              className="w-6 rounded-full"
                              style={{
                                height: `${value}%`,
                                backgroundColor: group.colors[index],
                              }}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-slate-500">{group.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
