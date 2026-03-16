"use client"

import { useEffect, useMemo, useState } from 'react'
import { Plus, Search, Pencil, Trash2, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import Modal from '@/components/ui/modal'
import { fetchApi } from '@/services/apiConfig'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type CityStatus = 'active' | 'inactive'

type Country = {
  id: string
  name: string
  code: string
}

type City = {
  id: string
  name: string
  countryId: string
  country?: Country
  isActive: boolean
}

export default function AdminCitiesPage() {
  const [cities, setCities] = useState<City[]>([])
  const [countries, setCountries] = useState<Country[]>([])
  const [search, setSearch] = useState('')
  const [countryFilter, setCountryFilter] = useState<string>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCity, setEditingCity] = useState<City | null>(null)
  const [form, setForm] = useState({ name: '', countryId: '', status: 'active' as CityStatus })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const limit = 10

  const countryById = useMemo(() => {
    return countries.reduce<Record<string, Country>>((acc, country) => {
      acc[country.id] = country
      return acc
    }, {})
  }, [countries])

  const filteredCities = useMemo(() => cities, [cities])

  const fetchCountries = async () => {
    try {
      const response = await fetchApi('/api/countries?limit=100')
      setCountries(response?.data?.data || [])
    } catch (err: any) {
      toast.error(err?.message || 'Erreur lors du chargement des pays.')
    }
  }

  const fetchCities = async (query = '', pageToLoad = 1, countryId?: string) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (query) params.set('search', query)
      if (countryId && countryId !== 'all') params.set('countryId', countryId)
      params.set('limit', String(limit))
      params.set('page', String(pageToLoad))
      const response = await fetchApi(`/api/cities?${params.toString()}`)
      setCities(response?.data?.data || [])
      setTotalPages(response?.data?.pagination?.totalPages || 1)
      setPage(response?.data?.pagination?.page || 1)
    } catch (err: any) {
      setError(err?.message || 'Erreur lors du chargement des villes.')
      toast.error(err?.message || 'Erreur lors du chargement des villes.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCountries()
    fetchCities('', 1, countryFilter)
  }, [])

  useEffect(() => {
    const id = setTimeout(() => {
      fetchCities(search.trim(), 1, countryFilter)
    }, 300)
    return () => clearTimeout(id)
  }, [search, countryFilter])

  const openCreate = () => {
    setEditingCity(null)
    setForm({ name: '', countryId: '', status: 'active' })
    setIsModalOpen(true)
  }

  const openEdit = (city: City) => {
    setEditingCity(city)
    setForm({
      name: city.name,
      countryId: city.countryId,
      status: city.isActive ? 'active' : 'inactive',
    })
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.name.trim() || !form.countryId) return
    setLoading(true)
    setError(null)
    try {
      if (editingCity) {
        await fetchApi(`/api/cities/${editingCity.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            name: form.name,
            countryId: form.countryId,
            isActive: form.status === 'active',
          }),
        })
      } else {
        await fetchApi('/api/cities', {
          method: 'POST',
          body: JSON.stringify({
            name: form.name,
            countryId: form.countryId,
          }),
        })
      }
      setIsModalOpen(false)
      toast.success(editingCity ? 'Ville modifiée avec succès.' : 'Ville créée avec succès.')
      await fetchCities(search.trim(), page, countryFilter)
    } catch (err: any) {
      setError(err?.message || "Erreur lors de l'enregistrement.")
      toast.error(err?.message || "Erreur lors de l'enregistrement.")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      await fetchApi(`/api/cities/${id}`, { method: 'DELETE' })
      toast.success('Ville supprimée avec succès.')
      await fetchCities(search.trim(), page, countryFilter)
    } catch (err: any) {
      setError(err?.message || "Erreur lors de la suppression.")
      toast.error(err?.message || "Erreur lors de la suppression.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1">
      <header className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Gestion des villes</h1>
            <p className="text-sm text-slate-500">
              Ajoutez, modifiez et désactivez les villes disponibles.
            </p>
          </div>
          <Button className="bg-slate-900 hover:bg-slate-800 gap-2" onClick={openCreate}>
            <Plus className="w-4 h-4" />
            Ajouter une ville
          </Button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <Card className="border-slate-200">
          <CardContent className="p-6 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="relative w-full lg:max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Rechercher une ville..."
                  className="pl-9 bg-white border-slate-200"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3">
                <Select value={countryFilter} onValueChange={setCountryFilter}>
                  <SelectTrigger className="w-56 bg-white border-slate-200">
                    <SelectValue placeholder="Tous les pays" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les pays</SelectItem>
                    {countries.map((country) => (
                      <SelectItem key={country.id} value={country.id}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="text-sm text-slate-500">{filteredCities.length} villes</div>
              </div>
            </div>

            {error && (
              <div className="text-sm text-rose-600">{error}</div>
            )}

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="grid grid-cols-[2fr_1.2fr_1fr_120px] bg-slate-50 text-xs text-slate-500 font-semibold px-4 py-3">
                <div>Ville</div>
                <div>Pays</div>
                <div>Statut</div>
                <div className="text-right">Actions</div>
              </div>
              <div className="divide-y divide-slate-200">
                {filteredCities.map((city) => (
                  <div key={city.id} className="grid grid-cols-[2fr_1.2fr_1fr_120px] items-center px-4 py-4 text-sm">
                    <div className="flex items-center gap-3 text-slate-900 font-medium">
                      <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-slate-500" />
                      </span>
                      {city.name}
                    </div>
                    <div className="text-slate-600">{countryById[city.countryId]?.name || '—'}</div>
                    <div>
                      <Badge className={city.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}>
                        {city.isActive ? 'Actif' : 'Inactif'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openEdit(city)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleDelete(city.id)}
                        disabled={loading}
                      >
                        <Trash2 className="w-4 h-4 text-rose-500" />
                      </Button>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="px-4 py-10 text-center text-sm text-slate-500">
                    Chargement...
                  </div>
                )}
                {!loading && filteredCities.length === 0 && (
                  <div className="px-4 py-10 text-center text-sm text-slate-500">
                    Aucune ville trouvée.
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-slate-500">
                Page {page} / {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1 || loading}
                  onClick={() => fetchCities(search.trim(), page - 1, countryFilter)}
                >
                  Précédent
                </Button>
                {Array.from({ length: totalPages }).map((_, index) => {
                  const pageNumber = index + 1
                  return (
                    <Button
                      key={pageNumber}
                      variant={pageNumber === page ? 'default' : 'outline'}
                      size="sm"
                      className={pageNumber === page ? 'bg-slate-900 hover:bg-slate-800 text-white' : ''}
                      onClick={() => fetchCities(search.trim(), pageNumber, countryFilter)}
                      disabled={loading}
                    >
                      {pageNumber}
                    </Button>
                  )
                })}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages || loading}
                  onClick={() => fetchCities(search.trim(), page + 1, countryFilter)}
                >
                  Suivant
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCity ? 'Modifier une ville' : 'Ajouter une ville'}
        size="md"
        showBlur
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm text-slate-600">Nom de la ville</label>
            <Input
              className="mt-2"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-sm text-slate-600">Pays</label>
            <Select
              value={form.countryId}
              onValueChange={(value) => setForm((prev) => ({ ...prev, countryId: value }))}
            >
              <SelectTrigger className="w-full bg-white border-slate-200 mt-2">
                <SelectValue placeholder="Sélectionner un pays" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.id} value={country.id}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm text-slate-600">Statut</label>
            <div className="mt-2 flex items-center gap-3">
              <button
                type="button"
                className={`px-4 py-2 rounded-lg text-sm border ${form.status === 'active'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 text-slate-600'
                  }`}
                onClick={() => setForm((prev) => ({ ...prev, status: 'active' }))}
              >
                Actif
              </button>
              <button
                type="button"
                className={`px-4 py-2 rounded-lg text-sm border ${form.status === 'inactive'
                  ? 'border-rose-200 bg-rose-50 text-rose-700'
                  : 'border-slate-200 text-slate-600'
                  }`}
                onClick={() => setForm((prev) => ({ ...prev, status: 'inactive' }))}
              >
                Inactif
              </button>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Annuler
            </Button>
            <Button className="bg-slate-900 hover:bg-slate-800" onClick={handleSave} disabled={loading}>
              {editingCity ? 'Enregistrer' : 'Créer'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
