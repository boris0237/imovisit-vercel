"use client"

import { useEffect, Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { SlidersHorizontal, Grid3X3, List } from 'lucide-react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { PropertyCard } from '@/components/PropertyCard'
import { SearchFilters } from '@/components/SearchFilters'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import type { FilterOptions } from '@/types'
import { useDictionary } from '@/hooks/useDictionary'
import { fetchApi } from '@/services/apiConfig'

function SearchContent() {
  const searchParams = useSearchParams()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filters, setFilters] = useState<FilterOptions>({
    search: searchParams.get('search') || undefined,
    city: searchParams.get('city') || undefined,
    type: searchParams.get('type') || undefined,
    offerType: searchParams.get('offerType') || undefined,
  })
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [limit] = useState(12)
  const [total, setTotal] = useState(0)
  const [cities, setCities] = useState<{ id: string; name: string }[]>([])
  const [neighborhoods, setNeighborhoods] = useState<{ id: string; name: string }[]>([])
  const [filterCityId, setFilterCityId] = useState<string | undefined>(undefined)

  const fetchCities = async () => {
    try {
      const res = await fetchApi('/api/cities?limit=100');
      setCities(res?.data?.data || []);
    } catch {
      setCities([]);
    }
  };

  const fetchNeighborhoods = async (cityId?: string) => {
    if (!cityId) {
      setNeighborhoods([]);
      return;
    }
    try {
      const res = await fetchApi(`/api/districts?limit=100&cityId=${cityId}`);
      const list = res?.data?.data || [];
      setNeighborhoods(list);
    } catch {
      setNeighborhoods([]);
    }
  };

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(limit));
      if (filters.search) params.set('search', filters.search);
      if (filters.city) params.set('city', filters.city);
      if (filters.neighborhood) params.set('neighborhood', filters.neighborhood);
      if (filters.type) params.set('type', filters.type);
      if (filters.offerType) params.set('offerType', filters.offerType);
      if (filters.rooms) params.set('rooms', String(filters.rooms));
      if (filters.minPrice !== undefined) params.set('minPrice', String(filters.minPrice));
      if (filters.maxPrice !== undefined) params.set('maxPrice', String(filters.maxPrice));

      const res = await fetchApi(`/api/biens/public?${params.toString()}`);
      const payload = res?.data || {};
      setProperties(payload?.properties || []);
      setTotal(payload?.total || 0);
    } catch {
      setProperties([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCities();
  }, []);

  useEffect(() => {
    if (!filters.city && cities.length > 0) {
      const cityMatch = searchParams.get('city');
      if (cityMatch) {
        const found = cities.find((city) => city.name.toLowerCase() === cityMatch.toLowerCase());
        if (found) {
          setFilters((prev) => ({ ...prev, cityId: found.id, city: found.name }));
          setFilterCityId(found.id);
        }
      }
    }
  }, [cities, filters.city, searchParams]);

  useEffect(() => {
    if (filters.cityId) {
      setFilterCityId(filters.cityId);
    }
  }, [filters.cityId]);

  useEffect(() => {
    fetchNeighborhoods(filterCityId);
  }, [filterCityId]);

  useEffect(() => {
    fetchProperties();
  }, [filters, page, limit]);

  const { dictionary } = useDictionary()

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-imo-primary">
                {dictionary.searchPage?.title1 || "Rechercher un bien"}
              </h1>
              <p className="text-gray-600 mt-1">
                {total}
                {dictionary.searchPage?.paragraph1 || " biens trouvés"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* View Mode Toggle 
              <div className="hidden md:flex items-center bg-white rounded-lg border p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="icon"
                  className={viewMode === 'grid' ? 'bg-imo-primary' : ''}
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="icon"
                  className={viewMode === 'list' ? 'bg-imo-primary' : ''}
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>*/}

              {/* Mobile Filters */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="md:hidden gap-2">
                    <SlidersHorizontal className="w-4 h-4" />
                    {dictionary.searchPage?.filterButton || "Filtres"}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[320px]">
                  <SheetHeader>
                    <SheetTitle>{dictionary.searchPage?.filterButton || "Filtres"}</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <SearchFilters
                      filters={filters}
                      onFilterChange={(next) => {
                        setFilters(next);
                        setPage(1);
                      }}
                      cities={cities}
                      neighborhoods={neighborhoods}
                      onCityChange={(cityId) => setFilterCityId(cityId)}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Content */}
          <div className="flex gap-8">
            {/* Sidebar Filters - Desktop */}
            <aside className="hidden md:block w-72 flex-shrink-0">
              <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
                <h2 className="font-semibold text-lg mb-4">{dictionary.searchPage?.filterButton || "Filtres"}</h2>
                <SearchFilters
                  filters={filters}
                  onFilterChange={(next) => {
                    setFilters(next);
                    setPage(1);
                  }}
                  cities={cities}
                  neighborhoods={neighborhoods}
                  onCityChange={(cityId) => setFilterCityId(cityId)}
                />
              </div>
            </aside>

            {/* Results */}
            <div className="flex-1">
              {loading ? (
                <div className="bg-white rounded-xl p-12 text-center text-gray-500">
                  {dictionary.searchPage?.loading || "Chargement..."}
                </div>
              ) : properties.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <SlidersHorizontal className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    {dictionary.searchPage?.title2 || "Aucun bien trouvé"}
                  </h3>
                  <p className="text-gray-500">
                      {dictionary.searchPage?.paragraph2 || "Essayez de modifier vos critères de recherche"}
                  </p>
                </div>
              ) : (
                <div
                  className={`grid gap-6 ${
                    viewMode === 'grid'
                      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                      : 'grid-cols-1'
                  }`}
                >
                  {properties.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
              )}

              {total > 0 && (
                <div className="flex items-center justify-between border-t border-gray-200 mt-8 pt-4 text-sm text-gray-600">
                  <div>
                    Page {page} sur {totalPages}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      className="h-9"
                      onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                      disabled={page === 1}
                    >
                      Précédent
                    </Button>
                    <Button
                      variant="outline"
                      className="h-9"
                      onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={page >= totalPages}
                    >
                      Suivant
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function SearchPage() {
  const { dictionary } = useDictionary()
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"> {dictionary.searchPage?.loading || "Chargement..."} </div>}>
      <SearchContent />
    </Suspense>
  )
}
