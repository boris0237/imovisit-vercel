"use client"

import { useEffect, useMemo, useState } from 'react'
import { Plus, Search, Pencil, Trash2, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import Modal from '@/components/ui/modal'
import { fetchApi } from '@/services/apiConfig'
import { toast } from 'sonner'

type CountryStatus = 'active' | 'inactive'

type Country = {
  id: string
  name: string
  code: string
  isActive: boolean
}

export default function AdminCountriesPage() {
  const [countries, setCountries] = useState<Country[]>([])
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCountry, setEditingCountry] = useState<Country | null>(null)
  const [form, setForm] = useState({ name: '', code: '', status: 'active' as CountryStatus })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const limit = 10

  const filteredCountries = useMemo(() => countries, [countries])

  const fetchCountries = async (query = '', pageToLoad = 1) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (query) params.set('search', query)
      params.set('limit', String(limit))
      params.set('page', String(pageToLoad))
      const response = await fetchApi(`/api/countries?${params.toString()}`)
      setCountries(response?.data?.data || [])
      setTotalPages(response?.data?.pagination?.totalPages || 1)
      setPage(response?.data?.pagination?.page || 1)
    } catch (err: any) {
      setError(err?.message || 'Erreur lors du chargement des pays.')
      toast.error(err?.message || 'Erreur lors du chargement des pays.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCountries('', 1)
  }, [])

  useEffect(() => {
    const id = setTimeout(() => {
      fetchCountries(search.trim(), 1)
    }, 300)
    return () => clearTimeout(id)
  }, [search])

  const openCreate = () => {
    setEditingCountry(null)
    setForm({ name: '', code: '', status: 'active' })
    setIsModalOpen(true)
  }

  const openEdit = (country: Country) => {
    setEditingCountry(country)
    setForm({
      name: country.name,
      code: country.code,
      status: country.isActive ? 'active' : 'inactive',
    })
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.name.trim() || !form.code.trim()) return
    setLoading(true)
    setError(null)
    try {
      if (editingCountry) {
        await fetchApi(`/api/countries/${editingCountry.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            name: form.name,
            code: form.code.toUpperCase(),
            isActive: form.status === 'active',
          }),
        })
      } else {
        await fetchApi('/api/countries', {
          method: 'POST',
          body: JSON.stringify({
            name: form.name,
            code: form.code.toUpperCase(),
          }),
        })
      }
      setIsModalOpen(false)
      toast.success(editingCountry ? 'Pays modifié avec succès.' : 'Pays créé avec succès.')
      await fetchCountries(search.trim(), page)
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
      await fetchApi(`/api/countries/${id}`, { method: 'DELETE' })
      toast.success('Pays supprimé avec succès.')
      await fetchCountries(search.trim(), page)
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
            <h1 className="text-2xl font-semibold text-slate-900">Gestion des pays</h1>
            <p className="text-sm text-slate-500">
              Ajoutez, modifiez et désactivez les pays disponibles sur la plateforme.
            </p>
          </div>
          <Button className="bg-slate-900 hover:bg-slate-800 gap-2" onClick={openCreate}>
            <Plus className="w-4 h-4" />
            Ajouter un pays
          </Button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <Card className="border-slate-200">
          <CardContent className="p-6 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="relative w-full md:max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Rechercher un pays, code ou indicatif..."
                  className="pl-9 bg-white border-slate-200"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="text-sm text-slate-500">{filteredCountries.length} pays</div>
            </div>
            {error && (
              <div className="text-sm text-rose-600">{error}</div>
            )}

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="grid grid-cols-[2fr_1fr_1fr_120px] bg-slate-50 text-xs text-slate-500 font-semibold px-4 py-3">
                <div>Pays</div>
                <div>Code</div>
                <div>Statut</div>
                <div className="text-right">Actions</div>
              </div>
              <div className="divide-y divide-slate-200">
                {filteredCountries.map((country) => (
                  <div key={country.id} className="grid grid-cols-[2fr_1fr_1fr_120px] items-center px-4 py-4 text-sm">
                    <div className="flex items-center gap-3 text-slate-900 font-medium">
                      <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                        <Globe className="w-4 h-4 text-slate-500" />
                      </span>
                      {country.name}
                    </div>
                    <div className="text-slate-600">{country.code}</div>
                    <div>
                      <Badge className={country.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}>
                        {country.isActive ? 'Actif' : 'Inactif'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openEdit(country)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleDelete(country.id)}
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
                {!loading && filteredCountries.length === 0 && (
                  <div className="px-4 py-10 text-center text-sm text-slate-500">
                    Aucun pays trouvé.
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
                  onClick={() => fetchCountries(search.trim(), page - 1)}
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
                      onClick={() => fetchCountries(search.trim(), pageNumber)}
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
                  onClick={() => fetchCountries(search.trim(), page + 1)}
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
        title={editingCountry ? 'Modifier un pays' : 'Ajouter un pays'}
        size="md"
        showBlur
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm text-slate-600">Nom du pays</label>
            <Input
              className="mt-2"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-sm text-slate-600">Code</label>
            <Input
              className="mt-2"
              value={form.code}
              onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value }))}
            />
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
              {editingCountry ? 'Enregistrer' : 'Créer'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
