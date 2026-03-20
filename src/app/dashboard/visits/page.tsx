"use client"

import { useCallback, useEffect, useMemo, useState } from 'react'
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
import { agendaService } from '@/services/agendaService'
import { useAuth } from '@/contexts/AuthContext'

interface VisitItem {
  id: string
  name: string
  propertyTitle: string
  propertyLocation: string
  time: string
  date: string
  type: 'Présentiel' | 'À distance'
  fee?: string
  status: 'upcoming' | 'done' | 'missed'
  image?: string
  raw?: any
}

export default function VisitsPage() {
  const { user } = useAuth()
  const [panelOpen, setPanelOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'done' | 'missed'>('upcoming')
  const [selectedVisit, setSelectedVisit] = useState<VisitItem | null>(null)
  const [visits, setVisits] = useState<VisitItem[]>([])
  const [loading, setLoading] = useState(false)
  const [propertyFilter, setPropertyFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [page, setPage] = useState(1)
  const pageSize = 10
  const [actionMode, setActionMode] = useState<'cancel' | 'reschedule' | null>(null)
  const [cancelReason, setCancelReason] = useState('')
  const [rescheduleDate, setRescheduleDate] = useState('')
  const [rescheduleTime, setRescheduleTime] = useState('')
  const [savingAction, setSavingAction] = useState(false)

  const loadVisits = useCallback(async () => {
    if (!user?.id) return
    setLoading(true)
    try {
      const res = await agendaService.getReservations({ ownerId: user.id, limit: 200 })
      const reservations = res?.data?.reservations || []
      const now = new Date()

      const mapped: VisitItem[] = reservations.map((r: any) => {
        const resDateStr = typeof r.date === 'string' && r.date.includes('T')
          ? r.date.split('T')[0]
          : new Date(r.date).toISOString().split('T')[0]
        const dateTime = new Date(`${resDateStr}T${r.startTime}`)
        const status: VisitItem['status'] =
          r.status === 'missed' || r.status === 'cancelled'
            ? 'missed'
            : dateTime < now
              ? 'done'
              : 'upcoming'

        const propertyTitle = r.property?.title || `Bien #${r.propertyId?.slice?.(-4) || ''}`
        const propertyLocation = [r.property?.neighborhood, r.property?.city].filter(Boolean).join(', ')
        const feeValue = Number(r.property?.visitFee || 0)

        return {
          id: r.id,
          name: r.client?.name || 'Client',
          propertyTitle,
          propertyLocation: propertyLocation || '—',
          time: r.startTime,
          date: resDateStr,
          type: r.visitType === 'in_person' ? 'Présentiel' : 'À distance',
          fee: feeValue > 0 ? `${feeValue.toLocaleString('fr-FR')} FCFA` : undefined,
          status,
          image: r.property?.images?.[0] || '/placeholder-property.jpg',
          raw: r,
        }
      })

      setVisits(mapped)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    loadVisits()
  }, [loadVisits])

  const filteredVisits = useMemo(() => {
    let list = visits
    if (activeTab !== 'all') list = list.filter((visit) => visit.status === activeTab)
    if (propertyFilter !== 'all') list = list.filter((visit) => visit.propertyTitle === propertyFilter)
    if (typeFilter !== 'all') list = list.filter((visit) => visit.type === typeFilter)
    return list
  }, [activeTab, propertyFilter, typeFilter, visits])

  useEffect(() => {
    setPage(1)
  }, [activeTab, propertyFilter, typeFilter])

  const totalPages = Math.max(1, Math.ceil(filteredVisits.length / pageSize))
  const paginatedVisits = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredVisits.slice(start, start + pageSize)
  }, [filteredVisits, page])

  const groupedByDate = useMemo(() => {
    return paginatedVisits.reduce((acc, visit) => {
      if (!acc[visit.date]) acc[visit.date] = []
      acc[visit.date].push(visit)
      return acc
    }, {} as Record<string, VisitItem[]>)
  }, [paginatedVisits])

  const stats = useMemo(() => {
    const total = visits.length
    const upcoming = visits.filter(v => v.status === 'upcoming').length
    const done = visits.filter(v => v.status === 'done').length
    const missed = visits.filter(v => v.status === 'missed').length

    return [
      {
        title: 'Total visites',
        value: String(total),
        subtitle: 'Ce mois-ci',
        tone: 'bg-blue-50 text-blue-700',
        icon: CalendarCheck,
      },
      {
        title: 'Confirmées',
        value: String(upcoming),
        subtitle: 'À venir',
        tone: 'bg-emerald-50 text-emerald-700',
        icon: Check,
      },
      {
        title: 'Réalisées',
        value: String(done),
        subtitle: 'Ce mois-ci',
        tone: 'bg-violet-50 text-violet-700',
        icon: FileCheck2,
      },
      {
        title: 'Non réalisées',
        value: String(missed),
        subtitle: 'Ce mois-ci',
        tone: 'bg-rose-50 text-rose-700',
        icon: X,
      },
    ]
  }, [visits])

  const tabs = useMemo(() => {
    const upcoming = visits.filter(v => v.status === 'upcoming').length
    const done = visits.filter(v => v.status === 'done').length
    const missed = visits.filter(v => v.status === 'missed').length
    const total = visits.length
    return [
      { key: 'upcoming', label: 'À venir', count: upcoming },
      { key: 'done', label: 'Réalisées', count: done },
      { key: 'missed', label: 'Non réalisées', count: missed },
      { key: 'all', label: 'Toutes les visites', count: total },
    ]
  }, [visits])

  const propertyOptions = useMemo(() => {
    return Array.from(new Set(visits.map(v => v.propertyTitle)))
  }, [visits])

  const typeOptions = useMemo(() => {
    return Array.from(new Set(visits.map(v => v.type)))
  }, [visits])

  const exportCsv = () => {
    const headers = ['Date', 'Heure', 'Visiteur', 'Bien', 'Localisation', 'Type', 'Frais', 'Statut']
    const rows = filteredVisits.map((visit) => [
      visit.date,
      visit.time,
      visit.name,
      visit.propertyTitle,
      visit.propertyLocation,
      visit.type,
      visit.fee || '',
      visit.status === 'upcoming' ? 'À venir' : visit.status === 'done' ? 'Réalisée' : 'Non réalisée',
    ])

    const escape = (value: string) => {
      const needsQuotes = /[",\n]/.test(value)
      const safe = value.replace(/"/g, '""')
      return needsQuotes ? `"${safe}"` : safe
    }

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => escape(String(cell))).join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const dateStr = new Date().toISOString().split('T')[0]
    link.href = url
    link.download = `visites-${dateStr}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const openVisitPanel = (visit: VisitItem) => {
    setSelectedVisit(visit)
    setPanelOpen(true)
    setActionMode(null)
    setCancelReason('')
    setRescheduleDate(visit.date)
    setRescheduleTime(visit.time)
  }

  const getDurationMinutes = (visit: VisitItem) => {
    const start = visit.raw?.startTime
    const end = visit.raw?.endTime
    if (!start || !end) return 30
    const [sh, sm] = start.split(':').map(Number)
    const [eh, em] = end.split(':').map(Number)
    return Math.max(30, (eh * 60 + em) - (sh * 60 + sm))
  }

  const addMinutes = (time: string, minutes: number) => {
    const [h, m] = time.split(':').map(Number)
    const total = h * 60 + m + minutes
    const nh = Math.floor(total / 60) % 24
    const nm = total % 60
    return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`
  }

  const handleUpdateReservation = async (payload: any) => {
    if (!selectedVisit) return
    setSavingAction(true)
    try {
      await agendaService.updateReservation(selectedVisit.id, payload)
      await loadVisits()
      setActionMode(null)
    } finally {
      setSavingAction(false)
    }
  }

  return (
    <div className="relative flex-1">
      <header className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Gestion des visites</h1>
            <p className="text-sm text-slate-500">Suivez et gérez toutes vos visites programmées</p>
          </div>
          <Button className="bg-slate-900 hover:bg-slate-800 gap-2" onClick={exportCsv}>
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
            <select
              value={propertyFilter}
              onChange={(e) => setPropertyFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-600"
            >
              <option value="all">Tous les biens</option>
              {propertyOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-600"
            >
              <option value="all">Tous les types</option>
              {typeOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <Card className="border-slate-200">
            <CardContent className="p-8 text-center text-slate-500">Chargement...</CardContent>
          </Card>
        ) : (
          Object.keys(groupedByDate).length === 0 ? (
            <Card className="border-slate-200">
              <CardContent className="p-8 text-center text-slate-500">Aucune visite trouvée.</CardContent>
            </Card>
          ) : (
            Object.entries(groupedByDate).map(([date, dayVisits]) => (
              <Card key={date} className="border-slate-200">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-900 font-semibold">
                      <span className="h-2 w-2 rounded-full bg-slate-900" />
                      {new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    <span className="text-sm text-slate-500">{dayVisits.length} visite{dayVisits.length > 1 ? 's' : ''}</span>
                  </div>
                  <div className="divide-y divide-slate-200">
                    {dayVisits.map((visit) => (
                      <button
                        key={visit.id}
                        onClick={() => openVisitPanel(visit)}
                        className="w-full text-left px-6 py-5 hover:bg-slate-50 flex flex-col md:flex-row md:items-center gap-4"
                      >
                        <img
                          src={visit.image}
                          alt={visit.propertyTitle}
                          className="w-20 h-20 rounded-xl object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900">{visit.name}</p>
                          <p className="text-sm text-slate-500">{visit.propertyTitle} - {visit.propertyLocation}</p>
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
                        <div className="ml-auto">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            visit.status === 'upcoming'
                              ? 'bg-emerald-100 text-emerald-700'
                              : visit.status === 'done'
                                ? 'bg-violet-100 text-violet-700'
                                : 'bg-rose-100 text-rose-700'
                          }`}>
                            {visit.status === 'upcoming' ? 'Visite' : visit.status === 'done' ? 'Réalisée' : 'Non réalisée'}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )
        )}

        {filteredVisits.length > 0 && (
          <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-sm text-slate-600">
            <span>
              Page {page} sur {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="bg-white border-slate-200"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Précédent
              </Button>
              <Button
                variant="outline"
                className="bg-white border-slate-200"
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Suivant
              </Button>
            </div>
          </div>
        )}
      </div>

      {panelOpen && selectedVisit && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-slate-900/30" onClick={() => { setPanelOpen(false); setActionMode(null); }} />
          <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl flex flex-col">
            <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Détails de la visite</h3>
              <button onClick={() => { setPanelOpen(false); setActionMode(null); }} className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 overflow-auto flex-1 space-y-6">
              <div className="flex items-center gap-4 bg-amber-50 border border-amber-100 rounded-xl p-4 text-amber-700">
                <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold">{selectedVisit.status === 'upcoming' ? 'À venir' : selectedVisit.status === 'done' ? 'Réalisée' : 'Non réalisée'}</p>
                  <p className="text-xs">ID: #{selectedVisit.id.slice(-5).toUpperCase()}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs uppercase text-slate-400">Visiteur</p>
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center text-xl font-semibold text-slate-600">
                    {selectedVisit.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{selectedVisit.name}</p>
                    <div className="flex flex-col gap-1 text-sm text-slate-500">
                      {selectedVisit.raw?.client?.phone && (
                        <span className="flex items-center gap-2">
                          <Phone className="w-4 h-4" /> {selectedVisit.raw.client.phone}
                        </span>
                      )}
                      {selectedVisit.raw?.client?.email && (
                        <span className="flex items-center gap-2">
                          <User className="w-4 h-4" /> {selectedVisit.raw.client.email}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs uppercase text-slate-400">Bien concerné</p>
                <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-4">
                  <img
                    src={selectedVisit.image}
                    alt={selectedVisit.propertyTitle}
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                  <div>
                    <p className="font-semibold text-slate-900">{selectedVisit.propertyTitle}</p>
                    <p className="text-sm text-slate-500">{selectedVisit.propertyLocation}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs uppercase text-slate-400">Détails de la visite</p>
                <div className="flex items-center justify-between border-b border-slate-200 pb-3 text-sm">
                  <span className="text-slate-500">Date</span>
                  <span className="text-slate-900 font-semibold">
                    {new Date(selectedVisit.date).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-200 pb-3 text-sm">
                  <span className="text-slate-500">Heure</span>
                  <span className="text-slate-900 font-semibold">{selectedVisit.time}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-200 pb-3 text-sm">
                  <span className="text-slate-500">Type</span>
                  <span className="text-slate-900 font-semibold">{selectedVisit.type}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-200 pb-3 text-sm">
                  <span className="text-slate-500">Frais de visite</span>
                  <span className="text-slate-900 font-semibold">{selectedVisit.fee || 'Gratuit'}</span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs uppercase text-slate-400">Notes</p>
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  {selectedVisit.raw?.visitContext || '—'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  className="bg-emerald-500 hover:bg-emerald-600 text-white gap-2"
                  loading={savingAction}
                  onClick={() => handleUpdateReservation({ status: 'done' })}
                >
                  <Check className="w-4 h-4" />
                  Confirmer
                </Button>
                <Button
                  className="bg-rose-500 hover:bg-rose-600 text-white gap-2"
                  loading={savingAction}
                  onClick={() => handleUpdateReservation({ status: 'missed' })}
                >
                  <X className="w-4 h-4" />
                  Refuser
                </Button>
              </div>
{/* 
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="bg-white border-slate-200"
                  onClick={() => setActionMode(actionMode === 'reschedule' ? null : 'reschedule')}
                >
                  Reporter
                </Button>
                <Button
                  variant="outline"
                  className="bg-white border-slate-200 text-rose-600"
                  onClick={() => setActionMode(actionMode === 'cancel' ? null : 'cancel')}
                >
                  Annuler
                </Button>
              </div> */}

              {actionMode === 'reschedule' && (
                <div className="space-y-3 rounded-xl border border-slate-200 p-4">
                  <p className="text-sm font-semibold text-slate-700">Reporter la visite</p>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="date"
                      value={rescheduleDate}
                      onChange={(e) => setRescheduleDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                    />
                    <input
                      type="time"
                      value={rescheduleTime}
                      onChange={(e) => setRescheduleTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                    />
                  </div>
                  <Button
                    className="w-full bg-slate-900 hover:bg-slate-800"
                    loading={savingAction}
                    onClick={() => {
                      if (!rescheduleDate || !rescheduleTime) return
                      const duration = getDurationMinutes(selectedVisit)
                      handleUpdateReservation({
                        date: rescheduleDate,
                        startTime: rescheduleTime,
                        endTime: addMinutes(rescheduleTime, duration),
                        status: 'confirmed',
                      })
                    }}
                  >
                    Enregistrer le report
                  </Button>
                </div>
              )}

              {actionMode === 'cancel' && (
                <div className="space-y-3 rounded-xl border border-rose-200 bg-rose-50/40 p-4">
                  <p className="text-sm font-semibold text-rose-700">Motif d'annulation</p>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-rose-200 px-3 py-2 text-sm"
                    placeholder="Expliquez la raison..."
                  />
                  <Button
                    className="w-full bg-rose-500 hover:bg-rose-600 text-white"
                    loading={savingAction}
                    onClick={() => {
                      if (!cancelReason.trim()) return
                      handleUpdateReservation({
                        status: 'cancelled',
                        cancelReason,
                        cancelledBy: user?.id || 'owner',
                      })
                    }}
                  >
                    Confirmer l'annulation
                  </Button>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
