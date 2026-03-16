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

type DistrictStatus = 'active' | 'inactive'

type Country = {
  id: string
  name: string
  code: string
}

type City = {
  id: string
  name: string
  countryId: string
}

type District = {
  id: string
  name: string
  cityId: string
  isActive: boolean
  city?: {
    id: string
    name: string
    country?: Country
  }
}

export default function AdminNeighborhoodsPage() {
  const [districts, setDistricts] = useState<District[]>([])
  const [countries, setCountries] = useState<Country[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [search, setSearch] = useState('')
  const [countryFilter, setCountryFilter] = useState<string>('all')
  const [cityFilter, setCityFilter] = useState<string>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingDistrict, setEditingDistrict] = useState<District | null>(null)
  const [form, setForm] = useState({
    name: '',
    countryId: '',
    cityId: '',
    status: 'active' as DistrictStatus,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const limit = 10

  const filteredDistricts = useMemo(() => districts, [districts])

  const fetchCountries = async () => {
    try {
      const response = await fetchApi('/api/countries?limit=100')
      setCountries(response?.data?.data || [])
    } catch (err: any) {
      toast.error(err?.message || 'Erreur lors du chargement des pays.')
    }
  }

  const fetchCities = async (countryId?: string) => {
    try {
      const params = new URLSearchParams()
      params.set('limit', '100')
      if (countryId && countryId !== 'all') params.set('countryId', countryId)
      const response = await fetchApi(`/api/cities?${params.toString()}`)
      setCities(response?.data?.data || [])
    } catch (err: any) {
      toast.error(err?.message || 'Erreur lors du chargement des villes.')
    }
  }

  const fetchDistricts = async (query = '', pageToLoad = 1, countryId?: string, cityId?: string) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (query) params.set('search', query)
      if (countryId && countryId !== 'all') params.set('countryId', countryId)
      if (cityId && cityId !== 'all') params.set('cityId', cityId)
      params.set('limit', String(limit))
      params.set('page', String(pageToLoad))
      const response = await fetchApi(`/api/districts?${params.toString()}`)
      setDistricts(response?.data?.data || [])
      setTotalPages(response?.data?.pagination?.totalPages || 1)
      setPage(response?.data?.pagination?.page || 1)
    } catch (err: any) {
      setError(err?.message || 'Erreur lors du chargement des quartiers.')
      toast.error(err?.message || 'Erreur lors du chargement des quartiers.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCountries()
    fetchCities()
    fetchDistricts('', 1, countryFilter, cityFilter)
  }, [])

  useEffect(() => {
    fetchCities(countryFilter)
  }, [countryFilter])

  useEffect(() => {
    const id = setTimeout(() => {
      fetchDistricts(search.trim(), 1, countryFilter, cityFilter)
    }, 300)
    return () => clearTimeout(id)
  }, [search, countryFilter, cityFilter])

  const openCreate = () => {
    setEditingDistrict(null)
    setForm({ name: '', countryId: '', cityId: '', status: 'active' })
    setIsModalOpen(true)
  }

  const openEdit = (district: District) => {
    setEditingDistrict(district)
    const countryId = district.city?.country?.id || ''
    setForm({
      name: district.name,
      countryId,
      cityId: district.cityId,
      status: district.isActive ? 'active' : 'inactive',
    })
    if (countryId) fetchCities(countryId)
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.name.trim() || !form.cityId) return
    setLoading(true)
    setError(null)
    try {
      if (editingDistrict) {
        await fetchApi(`/api/districts/${editingDistrict.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            name: form.name,
            cityId: form.cityId,
            isActive: form.status === 'active',
          }),
        })
      } else {
        await fetchApi('/api/districts', {
          method: 'POST',
          body: JSON.stringify({
            name: form.name,
            cityId: form.cityId,
          }),
        })
      }
      setIsModalOpen(false)
      toast.success(editingDistrict ? 'Quartier modifié avec succès.' : 'Quartier créé avec succès.')
      await fetchDistricts(search.trim(), page, countryFilter, cityFilter)
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
      await fetchApi(`/api/districts/${id}`, { method: 'DELETE' })
      toast.success('Quartier supprimé avec succès.')
      await fetchDistricts(search.trim(), page, countryFilter, cityFilter)
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
            <h1 className="text-2xl font-semibold text-slate-900">Gestion des quartiers</h1>
            <p className="text-sm text-slate-500">
              Ajoutez, modifiez et désactivez les quartiers.
            </p>
          </div>
          <Button className="bg-slate-900 hover:bg-slate-800 gap-2" onClick={openCreate}>
            <Plus className="w-4 h-4" />
            Ajouter un quartier
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
                  placeholder="Rechercher un quartier..."
                  className="pl-9 bg-white border-slate-200"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap items-center gap-3">
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
                <Select value={cityFilter} onValueChange={setCityFilter}>
                  <SelectTrigger className="w-56 bg-white border-slate-200">
                    <SelectValue placeholder="Toutes les villes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les villes</SelectItem>
                    {cities.map((city) => (
                      <SelectItem key={city.id} value={city.id}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="text-sm text-slate-500">{filteredDistricts.length} quartiers</div>
              </div>
            </div>

            {error && (
              <div className="text-sm text-rose-600">{error}</div>
            )}

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="grid grid-cols-[2fr_1.2fr_1.2fr_1fr_120px] bg-slate-50 text-xs text-slate-500 font-semibold px-4 py-3">
                <div>Quartier</div>
                <div>Ville</div>
                <div>Pays</div>
                <div>Statut</div>
                <div className="text-right">Actions</div>
              </div>
              <div className="divide-y divide-slate-200">
                {filteredDistricts.map((district) => (
                  <div key={district.id} className="grid grid-cols-[2fr_1.2fr_1.2fr_1fr_120px] items-center px-4 py-4 text-sm">
                    <div className="flex items-center gap-3 text-slate-900 font-medium">
                      <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-slate-500" />
                      </span>
                      {district.name}
                    </div>
                    <div className="text-slate-600">{district.city?.name || '—'}</div>
                    <div className="text-slate-600">{district.city?.country?.name || '—'}</div>
                    <div>
                      <Badge className={district.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}>
                        {district.isActive ? 'Actif' : 'Inactif'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openEdit(district)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleDelete(district.id)}
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
                {!loading && filteredDistricts.length === 0 && (
                  <div className="px-4 py-10 text-center text-sm text-slate-500">
                    Aucun quartier trouvé.
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
                  onClick={() => fetchDistricts(search.trim(), page - 1, countryFilter, cityFilter)}
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
                      onClick={() => fetchDistricts(search.trim(), pageNumber, countryFilter, cityFilter)}
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
                  onClick={() => fetchDistricts(search.trim(), page + 1, countryFilter, cityFilter)}
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
        title={editingDistrict ? 'Modifier un quartier' : 'Ajouter un quartier'}
        size="md"
        showBlur
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm text-slate-600">Nom du quartier</label>
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
              onValueChange={(value) => {
                setForm((prev) => ({ ...prev, countryId: value, cityId: '' }))
                fetchCities(value)
              }}
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
            <label className="text-sm text-slate-600">Ville</label>
            <Select
              value={form.cityId}
              onValueChange={(value) => setForm((prev) => ({ ...prev, cityId: value }))}
            >
              <SelectTrigger className="w-full bg-white border-slate-200 mt-2">
                <SelectValue placeholder="Sélectionner une ville" />
              </SelectTrigger>
              <SelectContent>
                {cities
                  .filter((city) => (form.countryId ? city.countryId === form.countryId : true))
                  .map((city) => (
                    <SelectItem key={city.id} value={city.id}>
                      {city.name}
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
              {editingDistrict ? 'Enregistrer' : 'Créer'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
