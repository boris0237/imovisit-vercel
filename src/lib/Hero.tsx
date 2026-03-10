"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cities, propertyTypes, offerTypes } from '@/data/mock'
import { useLanguage } from '@/contexts/LanguageContext';
import { useDictionary } from '@/hooks/useDictionary'


export function Hero() {
  const { dictionary } = useDictionary()
  const router = useRouter()
  const [searchParams, setSearchParams] = useState({
    city: '',
    type: '',
    offerType: '',
  })

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (searchParams.city) params.set('city', searchParams.city)
    if (searchParams.type) params.set('type', searchParams.type)
    if (searchParams.offerType) params.set('offerType', searchParams.offerType)
    router.push(`/search?${params.toString()}`)
  }

  const stats = [
    { value: '10,000+', label: dictionary.hero?.lab1 || 'Biens disponibles' },
    { value: '5,000+', label: dictionary.hero?.lab2 || 'Utilisateurs actifs' },
    { value: '2,000+', label: dictionary.hero?.lab3 || 'Visites réalisées' },
    { value: '98%', label: dictionary.hero?.lab4 || 'Satisfaction client' },
  ]

  return (
    <section className="relative bg-gradient-to-br from-imo-primary via-imo-secondary to-imo-primary overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-imo-accent rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-white/90 text-sm">{dictionary.hero?.badge || 'Plateforme #1 des visites immobilières'}</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
           {dictionary.hero?.title1 || 'Trouver le'} <span className="text-imo-highlight">{dictionary.hero?.title2 || 'bien'} </span> {dictionary.hero?.title3 || 'que'}
            <br />
            {dictionary.hero?.title4 || 'vous souhaitez visiter '} 
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto">
           {dictionary.hero?.description1 || 'Visitez de milliers de biens immobiliers en location, en'}  <br /> {dictionary.hero?.description2 || 'vente ou meublés à distance ou en présentiel'}
          </p>

          {/* Search Box */}
          <div className="bg-white rounded-2xl p-4 md:p-6 shadow-2xl max-w-3xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* City */}
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Select
                  value={searchParams.city}
                  onValueChange={(value) =>
                    setSearchParams({ ...searchParams, city: value })
                  }
                >
                  <SelectTrigger className="pl-10 h-12">
                    <SelectValue placeholder={dictionary.hero?.town || "Ville"} />
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

              {/* Property Type */}
              <div className="relative">
                <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Select
                  value={searchParams.type}
                  onValueChange={(value) =>
                    setSearchParams({ ...searchParams, type: value })
                  }
                >
                  <SelectTrigger className="pl-10 h-12">
                    <SelectValue placeholder={dictionary.hero?.propertyTypes || "Type de bien"} />
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
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Select
                  value={searchParams.offerType}
                  onValueChange={(value) =>
                    setSearchParams({ ...searchParams, offerType: value })
                  }
                >
                  <SelectTrigger className="pl-10 h-12">
                    <SelectValue placeholder={dictionary.hero?.offerTypes || "Type d'offre"} /> 
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

              {/* Search Button */}
              <Button
                className="h-12 bg-imo-primary hover:bg-imo-secondary text-white font-semibold"
                onClick={handleSearch}
              >
                <Search className="w-5 h-5 mr-2" />
                {dictionary.hero?.search || 'Rechercher'}
                
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <span className="text-white/60 text-sm">
              {dictionary.hero?.popular || "Populaires :"}
            </span>
            {[
              dictionary.hero?.tag1 || "Appartement Yaoundé",
              dictionary.hero?.tag2 || "Villa Douala",
              dictionary.hero?.tag3 || "Studio meublé",
              dictionary.hero?.tag4 || "Terrain"
            ].map((tag) => (
              <button
                key={tag}
                className="text-white/80 text-sm hover:text-white underline underline-offset-2 transition-colors"
                onClick={() => router.push(`/search?q=${encodeURIComponent(tag)}`)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                {stat.value}
              </div>
              <div className="text-white/70 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
