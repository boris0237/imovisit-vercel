"use client"

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  MapPin,
  Bed,
  Bath,
  Maximize,
  Calendar,
  Phone,
  Share2,
  Heart,
  BadgeCheck,
  Check,
  Home,
  Car,
  Eye,
  Clock,
  ShieldCheck,
  Star,
  CalendarCheck,
  ChevronRight,
  Video,
} from 'lucide-react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { mockProperties, amenitiesList } from '@/data/mock'

export default function PropertyDetail() {
  const params = useParams()
  const router = useRouter()
  const [selectedImage, setSelectedImage] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)

  const property = mockProperties.find((p) => p.id === params.id)

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-700 mb-4">Bien non trouvé</h1>
            <Button onClick={() => router.push('/search')}>Retour à la recherche</Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const formatPrice = (price: number, type: string) => {
    if (type === 'sale') {
      return `${price.toLocaleString()} FCFA`
    }
    return `${price.toLocaleString()} F / mois`
  }

  const getOfferTypeLabel = (offerType: string) => {
    switch (offerType) {
      case 'rent':
        return 'Location'
      case 'sale':
        return 'Vente'
      case 'furnished':
        return 'Meublé'
      default:
        return offerType
    }
  }

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
    }
    return types[type] || type
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-slate-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Bien en {getOfferTypeLabel(property.offerType).toLowerCase()}</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-700">{property.title}</span>
          </div>
        </div>

        <div className="container mx-auto px-4 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image Gallery */}
              <Card className="border-slate-200 overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative">
                    <img
                      src={property.images[selectedImage]}
                      alt={property.title}
                      className="w-full h-[340px] object-cover"
                    />
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <Badge className="bg-slate-900 text-white border-0">
                        {getOfferTypeLabel(property.offerType)}
                      </Badge>
                      <Badge className="bg-white/90 text-slate-700 border-0">
                        {getTypeLabel(property.type)}
                      </Badge>
                    </div>
                    <button
                      onClick={() => setIsFavorite(!isFavorite)}
                      className="absolute top-4 right-4 h-9 w-9 rounded-full bg-white/90 flex items-center justify-center text-slate-700 hover:bg-white"
                      aria-label="Ajouter aux favoris"
                    >
                      <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current text-rose-500' : ''}`} />
                    </button>
                  </div>
                  <div className="grid grid-cols-5 gap-2 p-4">
                    {property.images.slice(0, 5).map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`h-20 rounded-lg overflow-hidden border ${
                          selectedImage === index ? 'border-slate-900' : 'border-transparent'
                        }`}
                      >
                        <img src={image} alt={`${property.title} ${index + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Summary */}
              <Card className="border-slate-200">
                <CardContent className="p-6 space-y-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h1 className="text-2xl font-semibold text-slate-900">
                        {property.title} - {property.neighborhood}
                      </h1>
                      <div className="flex items-center gap-2 text-sm text-slate-500 mt-2">
                        <MapPin className="w-4 h-4" />
                        <span>{property.neighborhood}, {property.city}, Cameroun</span>
                      </div>
                    </div>
                    {property.ownerVerified && (
                      <Badge className="bg-emerald-100 text-emerald-700 border-0">
                        <ShieldCheck className="w-3 h-3 mr-1" />
                        Bien vérifié
                      </Badge>
                    )}
                  </div>

                  <div className="text-2xl font-semibold text-slate-900">
                    {formatPrice(property.price, property.offerType)}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{property.views} vues</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CalendarCheck className="w-4 h-4" />
                      <span>{property.visitsCount} visites réservées</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>Publié il y a 2 jours</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-3">
                      <Maximize className="w-4 h-4 text-slate-700" />
                      <div className="text-xs">
                        <p className="text-slate-500">Surface</p>
                        <p className="font-semibold text-slate-900">{property.surface} m²</p>
                      </div>
                    </div>
                    {property.bedrooms !== undefined && (
                      <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-3">
                        <Bed className="w-4 h-4 text-slate-700" />
                        <div className="text-xs">
                          <p className="text-slate-500">Chambres</p>
                          <p className="font-semibold text-slate-900">{property.bedrooms}</p>
                        </div>
                      </div>
                    )}
                    {property.bathrooms !== undefined && (
                      <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-3">
                        <Bath className="w-4 h-4 text-slate-700" />
                        <div className="text-xs">
                          <p className="text-slate-500">Salles de bain</p>
                          <p className="font-semibold text-slate-900">{property.bathrooms}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-3">
                      <Car className="w-4 h-4 text-slate-700" />
                      <div className="text-xs">
                        <p className="text-slate-500">Parking</p>
                        <p className="font-semibold text-slate-900">
                          {property.amenities.includes('parking') ? '2 places' : 'Non inclus'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
                    <p>{property.description}</p>
                    <p>
                      L&apos;appartement comprend un vaste salon lumineux avec balcon, une cuisine
                      moderne entièrement équipée et des finitions premium dans toutes les pièces.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Amenities */}
              <Card className="border-slate-200">
                <CardContent className="p-6">
                  <h2 className="text-sm font-semibold text-slate-800 mb-4">Commodités</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {property.amenities.map((amenityId) => {
                      const amenity = amenitiesList.find((a) => a.id === amenityId)
                      return (
                        <div key={amenityId} className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                          <Check className="w-4 h-4 text-emerald-500" />
                          <span>{amenity?.name || amenityId}</span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Owner */}
              <Card className="border-slate-200">
                <CardContent className="p-6 space-y-4">
                  <h2 className="text-sm font-semibold text-slate-800">Propriétaire</h2>
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-semibold">
                        {property.ownerName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-slate-900">{property.ownerName}</p>
                          <Badge className="bg-emerald-100 text-emerald-700 border-0">
                            Agence immobilière
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500">Membre depuis juin 2021</p>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
                          <span>4.8</span>
                          <span>(24 avis)</span>
                        </div>
                      </div>
                    </div>
                    <Button className="bg-slate-900 hover:bg-slate-800 gap-2">
                      <Phone className="w-4 h-4" />
                      Contacter
                    </Button>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Signaler ce bailleur</span>
                    {property.ownerVerified && (
                      <span className="flex items-center gap-1 text-emerald-600">
                        <BadgeCheck className="w-4 h-4" />
                        Bailleur vérifié
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Similar Properties */}
              <Card className="border-slate-200">
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-center gap-2 text-slate-900">
                    <Home className="w-5 h-5" />
                    <h2 className="text-lg font-semibold">Biens similaires</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {mockProperties
                      .filter((item) => item.id !== property.id)
                      .slice(0, 4)
                      .map((item) => (
                        <Card key={item.id} className="border-slate-200 overflow-hidden">
                          <CardContent className="p-0">
                            <div className="relative">
                              <img
                                src={item.images[0]}
                                alt={item.title}
                                className="w-full h-44 object-cover"
                              />
                              <div className="absolute top-3 left-3 flex items-center gap-2">
                                <Badge className="bg-slate-900 text-white border-0">
                                  {getOfferTypeLabel(item.offerType)}
                                </Badge>
                                <Badge className="bg-white/90 text-slate-700 border-0">
                                  {getTypeLabel(item.type)}
                                </Badge>
                              </div>
                              <button
                                className="absolute top-3 right-3 h-9 w-9 rounded-full bg-white/90 flex items-center justify-center text-slate-700 hover:bg-white"
                                aria-label="Ajouter aux favoris"
                              >
                                <Heart className="w-4 h-4" />
                              </button>
                              <div className="absolute bottom-3 left-3 text-white text-sm font-semibold drop-shadow">
                                {formatPrice(item.price, item.offerType)}
                              </div>
                            </div>

                            <div className="p-4 space-y-3">
                              <div>
                                <h3 className="font-semibold text-slate-900">{item.title}</h3>
                                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                  <MapPin className="w-4 h-4" />
                                  <span>{item.neighborhood}, {item.city}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-slate-500">
                                <div className="flex items-center gap-1">
                                  <Bed className="w-4 h-4" />
                                  <span>{item.bedrooms ?? 1}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Bath className="w-4 h-4" />
                                  <span>{item.bathrooms ?? 1}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Maximize className="w-4 h-4" />
                                  <span>{item.surface} m²</span>
                                </div>
                              </div>
                              <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-xs text-slate-500">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[11px] font-semibold">
                                    {item.ownerName.charAt(0)}
                                  </div>
                                  <span>{item.ownerName}</span>
                                  {item.ownerVerified && (
                                    <Badge className="bg-emerald-100 text-emerald-700 border-0">
                                      <BadgeCheck className="w-3 h-3" />
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-1">
                                    <Eye className="w-4 h-4" />
                                    <span>{item.views}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <CalendarCheck className="w-4 h-4" />
                                    <span>{item.visitsCount}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>

                  <div>
                    <Button className="bg-slate-900 hover:bg-slate-800 gap-2">
                      Voir plus de bien
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="border-slate-200">
                <CardContent className="p-6 space-y-5">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-800 mb-2">Réserver une visite</h2>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Frais de visite</span>
                      <span className="font-semibold text-slate-900">
                        {property.visitFee > 0 ? `${property.visitFee.toLocaleString()} FCFA` : 'Gratuit'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-2">Type de visite</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" className="h-12 flex-col gap-1 text-xs">
                        <MapPin className="w-4 h-4" />
                        En présentiel
                      </Button>
                      <Button variant="outline" className="h-12 flex-col gap-1 text-xs">
                        <Video className="w-4 h-4" />
                        À distance
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <BadgeCheck className="w-4 h-4 text-emerald-500" />
                      <span>Vous recevrez l&apos;adresse exacte quelques heures avant la visite.</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-2">Date souhaitée</p>
                    <Input type="date" className="bg-white border-slate-200" />
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-2">Créneau horaire</p>
                    <div className="grid grid-cols-2 gap-2">
                      {['9h00', '10h30', '14h00', '15h30', '16h30'].map((slot) => (
                        <Button key={slot} variant="outline" className="h-9 text-xs">
                          {slot}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Button className="w-full bg-slate-900 hover:bg-slate-800 gap-2">
                    <Calendar className="w-4 h-4" />
                    Réserver la visite
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardContent className="p-6">
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className={`flex-1 gap-2 ${isFavorite ? 'text-rose-500 border-rose-500' : ''}`}
                      onClick={() => setIsFavorite(!isFavorite)}
                    >
                      <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                      {isFavorite ? 'Favori' : 'Favoris'}
                    </Button>
                    <Button variant="outline" size="icon">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  )
}
