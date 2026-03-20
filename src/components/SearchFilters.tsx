import { useEffect, useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { propertyTypes, offerTypes } from '@/data/mock';
import type { FilterOptions } from '@/types';
import { useDictionary } from '@/hooks/useDictionary';

interface SearchFiltersProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  cities: { id: string; name: string }[];
  neighborhoods: { id: string; name: string }[];
  onCityChange?: (cityId?: string) => void;
}

export function SearchFilters({ filters, onFilterChange, cities, neighborhoods, onCityChange }: SearchFiltersProps) {
  const [localFilters, setLocalFilters] = useState<FilterOptions>(filters);
  const [priceRange, setPriceRange] = useState<[number, number]>([
    filters.minPrice || 0,
    filters.maxPrice || 2000000,
  ]);

  useEffect(() => {
    setLocalFilters(filters);
    setPriceRange([filters.minPrice || 0, filters.maxPrice || 2000000]);
  }, [filters]);

  useEffect(() => {
    if (onCityChange) {
      onCityChange(localFilters.cityId);
    }
  }, [localFilters.cityId, onCityChange]);

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

  const availableNeighborhoods = neighborhoods;
  const {dictionary} = useDictionary()
  const FilterContent = () => (
    <div className="space-y-6">
      {/* City */}
      <div className="space-y-2">
        <Label>{dictionary.searchFilter?.city || "City"}</Label>
        <Select
          value={localFilters.cityId}
          onValueChange={(value) =>
            setLocalFilters({
              ...localFilters,
              cityId: value || undefined,
              city: cities.find((city) => city.id === value)?.name,
              neighborhood: undefined,
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Toutes les villes" />
          </SelectTrigger>
          <SelectContent>
            {cities.map((city) => (
              <SelectItem key={city.id} value={city.id}>
                {city.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Neighborhood */}
      {localFilters.cityId && (
        <div className="space-y-2">
          <Label>{dictionary.searchFilter?.neighborhood || "Neighborhood"}</Label>
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
                <SelectItem key={neighborhood.id} value={neighborhood.name}>
                  {neighborhood.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Property Type */}
      <div className="space-y-2">
        <Label>{dictionary.searchFilter?.propertyType || "Property Type"}</Label>
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
        <Label>{dictionary.searchFilter?.offerType || "Offer Type"}</Label>
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
        <Label>{dictionary.searchFilter?.rooms || "Rooms"}</Label>
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
            <SelectItem value="1">1</SelectItem>
            <SelectItem value="2">2</SelectItem>
            <SelectItem value="3">3</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Price Range */}
      <div className="space-y-4">
        <Label>{dictionary.searchFilter?.minPrice || "Min Price"}</Label>
        <div className="grid grid-cols-2 gap-3">
          <Input
            type="number"
            min={0}
            placeholder="Prix min"
            value={priceRange[0]}
            onChange={(e) => setPriceRange([Number(e.target.value || 0), priceRange[1]])}
          />
          <Input
            type="number"
            min={0}
            placeholder="Prix max"
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value || 0)])}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button variant="outline" className="flex-1" onClick={handleReset}>
          <X className="w-4 h-4 mr-2" />
          {dictionary.searchFilter?.reset || "Reset"}
        </Button>
        <Button className="flex-1 bg-imo-primary hover:bg-imo-secondary" onClick={handleApplyFilters}>
          <Filter className="w-4 h-4 mr-2" />
          {dictionary.searchFilter?.apply || "Apply"}
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
            value={localFilters.search || ''}
            onChange={(e) => setLocalFilters({ ...localFilters, search: e.target.value })}
          />
        </div>
      </div>

      <FilterContent />
    </div>
  );
}
