import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { cities, neighborhoods, propertyTypes, offerTypes } from '@/data/mock';
import type { FilterOptions } from '@/types';

interface SearchFiltersProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
}

export function SearchFilters({ filters, onFilterChange }: SearchFiltersProps) {
  const [localFilters, setLocalFilters] = useState<FilterOptions>(filters);
  const [priceRange, setPriceRange] = useState<[number, number]>([
    filters.minPrice || 0,
    filters.maxPrice || 2000000,
  ]);

  const handleApplyFilters = () => {
    onFilterChange({
      ...localFilters,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
    });
  };

  const handleReset = () => {
    setLocalFilters({});
    setPriceRange([0, 2000000]);
    onFilterChange({});
  };

  const availableNeighborhoods = localFilters.city ? neighborhoods[localFilters.city] || [] : [];

  const FilterContent = () => (
    <div className="space-y-6">
      {/* City */}
      <div className="space-y-2">
        <Label>Ville</Label>
        <Select
          value={localFilters.city}
          onValueChange={(value) =>
            setLocalFilters({ ...localFilters, city: value, neighborhood: undefined })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Toutes les villes" />
          </SelectTrigger>
          <SelectContent>
            {cities.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Neighborhood */}
      {localFilters.city && (
        <div className="space-y-2">
          <Label>Quartier</Label>
          <Select
            value={localFilters.neighborhood}
            onValueChange={(value) =>
              setLocalFilters({ ...localFilters, neighborhood: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Tous les quartiers" />
            </SelectTrigger>
            <SelectContent>
              {availableNeighborhoods.map((neighborhood) => (
                <SelectItem key={neighborhood} value={neighborhood}>
                  {neighborhood}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Property Type */}
      <div className="space-y-2">
        <Label>Type de bien</Label>
        <Select
          value={localFilters.type}
          onValueChange={(value) => setLocalFilters({ ...localFilters, type: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Tous les types" />
          </SelectTrigger>
          <SelectContent>
            {propertyTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Offer Type */}
      <div className="space-y-2">
        <Label>Type d'offre</Label>
        <Select
          value={localFilters.offerType}
          onValueChange={(value) => setLocalFilters({ ...localFilters, offerType: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Toutes les offres" />
          </SelectTrigger>
          <SelectContent>
            {offerTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Rooms */}
      <div className="space-y-2">
        <Label>Nombre de pièces</Label>
        <Select
          value={localFilters.rooms?.toString()}
          onValueChange={(value) =>
            setLocalFilters({ ...localFilters, rooms: value ? parseInt(value) : undefined })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Toutes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 pièce</SelectItem>
            <SelectItem value="2">2 pièces</SelectItem>
            <SelectItem value="3">3 pièces</SelectItem>
            <SelectItem value="4">4 pièces</SelectItem>
            <SelectItem value="5">5+ pièces</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Price Range */}
      <div className="space-y-4">
        <Label>Fourchette de prix</Label>
        <Slider
          value={priceRange}
          onValueChange={(value) => setPriceRange(value as [number, number])}
          max={2000000}
          step={50000}
        />
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{priceRange[0].toLocaleString()} FCFA</span>
          <span>{priceRange[1].toLocaleString()} FCFA</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button variant="outline" className="flex-1" onClick={handleReset}>
          <X className="w-4 h-4 mr-2" />
          Réinitialiser
        </Button>
        <Button className="flex-1 bg-imo-primary hover:bg-imo-secondary" onClick={handleApplyFilters}>
          <Filter className="w-4 h-4 mr-2" />
          Appliquer
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Rechercher par mot-clé..."
            className="pl-10"
            value={localFilters.city || ''}
            onChange={(e) => setLocalFilters({ ...localFilters, city: e.target.value })}
          />
        </div>
        
        {/* Mobile Filters */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="md:hidden">
              <Filter className="w-4 h-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[320px]">
            <SheetHeader>
              <SheetTitle>Filtres</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Filters */}
      <div className="hidden md:block">
        <FilterContent />
      </div>
    </div>
  );
}
