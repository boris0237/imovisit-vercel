"use client"

import Link from 'next/link'
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PropertyCard } from '@/components/PropertyCard';
import { mockProperties } from '@/data/mock';

export function FeaturedProperties() {
  const featuredProperties = mockProperties.slice(0, 6);

  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-imo-primary mb-3">
              Biens en vedette
            </h2>
            <p className="text-gray-600 max-w-xl">
              Découvrez notre sélection de biens immobiliers soigneusement vérifiés 
              par notre équipe d'experts.
            </p>
          </div>
          <Link href="/search">
            <Button variant="outline" className="gap-2 border-imo-primary text-imo-primary hover:bg-imo-primary hover:text-white">
              Voir tous les biens
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Vous ne trouvez pas ce que vous cherchez ?
          </p>
          <Link href="/search">
            <Button className="bg-imo-primary hover:bg-imo-secondary gap-2">
              Explorer tous les biens
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
