"use client"

import Link from 'next/link'
import { MapPin, Bed, Bath, Maximize, Heart, Eye, Calendar, BadgeCheck, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Property } from '@/types'; 

interface PropertyCardProps {
  property: Property;
  showActions?: boolean;
}

export function PropertyCard({ property, showActions = true }: PropertyCardProps) {
  const formatPrice = (price: number, priceType?: string, offerType?: string) => {
    const formatted = price?.toLocaleString() ?? '0';
    if (offerType === 'sale' || priceType === 'sale') return `${formatted} FCFA`;
    if (priceType === 'daily') return `${formatted} F/jour`;
    if (priceType === 'yearly') return `${formatted} F/an`;
    return `${formatted} F/mois`;
  };

  const getOfferTypeLabel = (offerType: string) => {
    switch (offerType) {
      case 'rent':
        return 'Location';
      case 'sale':
        return 'Vente';
      case 'furnished':
        return 'Meublé';
      default:
        return offerType;
    }
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      apartment: 'Appartement',
      house: 'Maison',
      studio: 'Studio',
      villa: 'Villa',
      duplex: 'Duplex',
      land: 'Terrain',
      office: 'Bureau',
      shop: 'Boutique',
      building: 'Immeuble',
    };
    return types[type] || type;
  };

  return (
    <Link href={`/property/${property.id}`} className="block">
    <Card className="overflow-hidden group hover:shadow-lg transition-shadow">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={property.images[0] || '/placeholder-property.jpg'}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <Badge className="bg-imo-primary text-white">
            {getOfferTypeLabel(property.offerType)}
          </Badge>
          <Badge variant="secondary" className="bg-white/90 text-gray-700">
            {getTypeLabel(property.type)}
          </Badge>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="absolute top-3 right-3 flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 bg-white/90 hover:bg-white rounded-full"
            >
              <Heart className="w-4 h-4 text-gray-600" />
            </Button>
          </div>
        )}

        {/* Price overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <p className="text-white font-bold text-lg">
            {formatPrice(property.price, property.priceType, property.offerType)}
          </p>
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg text-imo-primary hover:text-imo-secondary transition-colors line-clamp-1">
          {property.title}
        </h3>

        <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
          <MapPin className="w-4 h-4" />
          <span className="line-clamp-1">{property.neighborhood}, {property.city}</span>
        </div>

        {/* Features */}
        <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
          {(property.bedrooms !== undefined || property.rooms !== undefined) && (
            <div className="flex items-center gap-1">
              <Bed className="w-4 h-4" />
              <span>{property.bedrooms ?? property.rooms}</span>
            </div>
          )}
          {property.bathrooms !== undefined && (
            <div className="flex items-center gap-1">
              <Bath className="w-4 h-4" />
              <span>{property.bathrooms}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Maximize className="w-4 h-4" />
            <span>{property.surface} m²</span>
          </div>
        </div>

        {/* Owner & Stats */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-imo-primary/10 flex items-center justify-center">
              <span className="text-sm font-medium text-imo-primary">
                {(property.ownerName || property.userName || 'U').charAt(0)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-sm text-gray-600">{property.ownerName || property.userName || 'Utilisateur'}</span>
              {(property.ownerVerified ?? property.userVerified) && (
                <BadgeCheck className="w-4 h-4 text-blue-500" />
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {property.views}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
    </Link>
  );
}
