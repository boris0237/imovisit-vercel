"use client"

import { useMemo, useState } from 'react'
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  X,
  Users,
  Video,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type ViewMode = 'day' | 'week' | 'month'

const weekDays = [
  { label: 'Lun', date: 9 },
  { label: 'Mar', date: 10 },
  { label: 'Mer', date: 11 },
  { label: 'Jeu', date: 12 },
  { label: 'Ven', date: 13 },
  { label: 'Sam', date: 14, blocked: true },
  { label: 'Dim', date: 15, blocked: true },
]

const hours = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00']

const monthDays = [
  { date: 17 }, { date: 18 }, { date: 19 }, { date: 20, badge: 1 }, { date: 21 }, { date: 22, weekend: true }, { date: 23, weekend: true },
  { date: 24, badge: 2 }, { date: 25 }, { date: 26 }, { date: 27 }, { date: 28 }, { date: 1 }, { date: 2, weekend: true, blocked: true, badge: 1 },
]

const dayVisits = [
  {
    id: 'v1',
    time: '10:00',
    name: 'Sophie Ndongo',
    property: 'Appartement meublé - Bastos',
    type: 'Présentiel',
    status: 'confirmed',
  },
  {
    id: 'v2',
    time: '14:00',
    name: 'Sophie Ndongo',
    property: 'Studio - Douala',
    type: 'Distance',
    status: 'pending',
  },
]

export default function CalendarPage() {
  const [view, setView] = useState<ViewMode>('day')
  const [isPanelOpen, setIsPanelOpen] = useState(false)

  const headerTitle = useMemo(() => {
    if (view === 'day') return 'vendredi 13 février 2026'
    return 'février 2026'
  }, [view])

  return (
    <div className="relative flex-1">
      <header className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Calendrier des visites</h1>
            <p className="text-sm text-slate-500">Gérez vos disponibilités et les demandes de visite</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="inline-flex rounded-xl bg-slate-100 p-1 text-sm">
              {([
                { key: 'day', label: 'Jour' },
                { key: 'week', label: 'Semaine' },
                { key: 'month', label: 'Mois' },
              ] as const).map((item) => (
                <button
                  key={item.key}
                  onClick={() => setView(item.key)}
                  className={`px-6 py-2 rounded-lg transition-colors ${
                    view === item.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <Button className="bg-slate-900 hover:bg-slate-800 gap-2">
              <Clock className="w-4 h-4" />
              Mes disponibilités
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-4 text-slate-700">
            <button className="h-10 w-10 rounded-full border border-slate-200 flex items-center justify-center">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h2 className="text-lg font-semibold text-slate-900">{headerTitle}</h2>
            <button className="h-10 w-10 rounded-full border border-slate-200 flex items-center justify-center">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <button className="text-sm text-slate-500 hover:text-slate-800">Aujourd&apos;hui</button>
        </div>

        {view === 'day' && (
          <div className="py-16 flex flex-col items-center text-center text-slate-500">
            <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center mb-6">
              <Calendar className="w-10 h-10" />
            </div>
            <p className="text-lg font-semibold text-slate-400">Aucune visite prévue ce jour</p>
            <button className="mt-2 text-slate-900 font-semibold">Définir les disponibilités</button>
          </div>
        )}

        {view === 'week' && (
          <div className="mt-6">
            <Card className="border-slate-200">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <div
                    className="grid text-sm text-slate-500 border-b border-slate-200 min-w-[860px]"
                    style={{ gridTemplateColumns: '90px repeat(7, minmax(0, 1fr))' }}
                  >
                    <div className="py-4 pl-6 font-medium">Heure</div>
                    {weekDays.map((day) => (
                      <div key={day.label} className="py-4 text-center font-medium text-slate-700">
                        {day.label}
                        <div className={`text-lg font-semibold ${day.blocked ? 'text-rose-500' : 'text-slate-900'}`}>
                          {day.date}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div
                    className="grid gap-y-4 p-4 min-w-[860px]"
                    style={{ gridTemplateColumns: '90px repeat(7, minmax(0, 1fr))' }}
                  >
                    {hours.map((hour) => (
                      <div key={hour} className="contents">
                        <div className="text-sm text-slate-500 py-3 pl-2">{hour}</div>
                        {weekDays.map((day) => {
                          if (day.blocked) {
                            return (
                              <div key={`${day.label}-${hour}`} className="px-2">
                                <div className="h-12 rounded-lg border border-rose-200 bg-rose-50 text-rose-500 text-[11px] flex items-center justify-center gap-2">
                                  <span className="h-4 w-4 rounded-full border border-rose-400 flex items-center justify-center text-[10px]">
                                    ✕
                                  </span>
                                  Bloqué - congés
                                </div>
                              </div>
                            )
                          }
                          const isOrange = day.label === 'Mar' && hour === '10:00'
                          const isGray = day.label === 'Lun' && hour === '11:00'
                          if (isOrange) {
                            return (
                              <div key={`${day.label}-${hour}`} className="px-2">
                                <div className="h-12 rounded-lg border border-orange-200 bg-orange-50 text-[11px] px-3 py-2 text-orange-600">
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-3 h-3" />
                                    {hour}
                                  </div>
                                  <div className="text-orange-600">Sophie Ndongo</div>
                                </div>
                              </div>
                            )
                          }
                          if (isGray) {
                            return (
                              <div key={`${day.label}-${hour}`} className="px-2">
                                <div className="h-12 rounded-lg border border-slate-200 bg-white text-[11px] px-3 py-2 text-slate-500">
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-3 h-3" />
                                    {hour}
                                  </div>
                                  <div className="text-slate-700">Marie Juliette</div>
                                </div>
                              </div>
                            )
                          }
                          return (
                            <div key={`${day.label}-${hour}`} className="px-2">
                              <button className="h-12 w-full rounded-lg border border-dashed border-emerald-300 bg-emerald-50/40 text-emerald-500 flex items-center justify-center">
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {view === 'month' && (
          <div className="mt-6">
            <Card className="border-slate-200 overflow-hidden">
              <CardContent className="p-0">
                <div className="grid grid-cols-7 bg-slate-900 text-white text-sm">
                  {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((d) => (
                    <div key={d} className="py-3 text-center font-medium">
                      {d}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7">
                  {monthDays.map((day, index) => (
                    <button
                      key={`${day.date}-${index}`}
                      onClick={() => setIsPanelOpen(true)}
                      className={`h-32 border border-slate-100 text-left p-3 transition-colors hover:bg-slate-50 ${
                        day.weekend ? 'text-rose-500' : 'text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold">{day.date}</span>
                        {day.badge && (
                          <span className="h-5 w-5 rounded-full bg-slate-200 text-[10px] text-slate-700 flex items-center justify-center">
                            {day.badge}
                          </span>
                        )}
                      </div>
                      <div className="mt-3 space-y-2">
                        {day.date === 20 && (
                          <div className="text-[11px] bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
                            11:00 - Sophie Ndongo
                          </div>
                        )}
                        {day.date === 24 && (
                          <div className="text-[11px] bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
                            11:00 - Sophie Ndongo
                          </div>
                        )}
                        {day.date === 27 && (
                          <div className="text-[11px] border border-orange-300 text-orange-600 px-2 py-1 rounded-md">
                            11:00 - Sophie Ndongo
                          </div>
                        )}
                        {day.blocked && (
                          <div className="text-[11px] border border-rose-300 text-rose-500 px-2 py-1 rounded-md">
                            Bloqué - congés
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {isPanelOpen && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-slate-900/30" onClick={() => setIsPanelOpen(false)} />
          <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl flex flex-col">
            <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Détails du jour</h3>
              <button onClick={() => setIsPanelOpen(false)} className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 overflow-auto flex-1 space-y-6">
              <div className="text-center">
                <p className="text-4xl font-semibold text-slate-900">24</p>
                <p className="text-sm text-slate-500">Février</p>
              </div>

              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-slate-900">Visites prévues(2)</h4>
                <Button variant="outline" size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Ajouter
                </Button>
              </div>

              {dayVisits.map((visit) => (
                <Card key={visit.id} className="border-slate-200">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xl font-semibold text-slate-900">{visit.time}</p>
                        <p className="text-sm text-slate-600">{visit.name}</p>
                        <p className="text-xs text-slate-500">{visit.property}</p>
                      </div>
                      <Badge className="bg-slate-100 text-slate-600 border-0">
                        {visit.type === 'Présentiel' ? (
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" /> {visit.type}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Video className="w-3 h-3" /> {visit.type}
                          </span>
                        )}
                      </Badge>
                    </div>
                    {visit.status === 'confirmed' ? (
                      <Badge className="bg-emerald-100 text-emerald-700 border-0 w-fit">
                        <Check className="w-3 h-3 mr-1" /> Confirmer
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-100 text-amber-700 border-0 w-fit">En attente</Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="p-6 border-t border-slate-200">
              <Button className="w-full bg-slate-900 hover:bg-slate-800 gap-2">
                <Plus className="w-4 h-4" />
                Ajouter une nouvelle visite
              </Button>
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
