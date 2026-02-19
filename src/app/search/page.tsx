"use client"

import { useState, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { SlidersHorizontal, Grid3X3, List } from 'lucide-react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { PropertyCard } from '@/components/PropertyCard'
import { SearchFilters } from '@/components/SearchFilters'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { mockProperties } from '@/data/mock'
import type { FilterOptions } from '@/types'

function SearchContent() {
  const searchParams = useSearchParams()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filters, setFilters] = useState<FilterOptions>({
    city: searchParams.get('city') || undefined,
    type: searchParams.get('type') || undefined,
    offerType: searchParams.get('offerType') || undefined,
  })

  const filteredProperties = useMemo(() => {
    return mockProperties.filter((property) => {
      if (filters.city && !property.city.toLowerCase().includes(filters.city.toLowerCase())) {
        return false
      }
      if (filters.neighborhood && property.neighborhood !== filters.neighborhood) {
        return false
      }
      if (filters.type && property.type !== filters.type) {
        return false
      }
      if (filters.offerType && property.offerType !== filters.offerType) {
        return false
      }
      if (filters.minPrice && property.price < filters.minPrice) {
        return false
      }
      if (filters.maxPrice && property.price > filters.maxPrice) {
        return false
      }
      if (filters.rooms && property.rooms < filters.rooms) {
        return false
      }
      return true
    })
  }, [filters])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-imo-primary">
                Rechercher un bien
              </h1>
              <p className="text-gray-600 mt-1">
                {filteredProperties.length} biens trouvés
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
                    Filtres
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[320px]">
                  <SheetHeader>
                    <SheetTitle>Filtres</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <SearchFilters filters={filters} onFilterChange={setFilters} />
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
                <h2 className="font-semibold text-lg mb-4">Filtres</h2>
                <SearchFilters filters={filters} onFilterChange={setFilters} />
              </div>
            </aside>

            {/* Results */}
            <div className="flex-1">
              {filteredProperties.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <SlidersHorizontal className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Aucun bien trouvé
                  </h3>
                  <p className="text-gray-500">
                    Essayez de modifier vos critères de recherche
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
                  {filteredProperties.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
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
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement...</div>}>
      <SearchContent />
    </Suspense>
  )
}
