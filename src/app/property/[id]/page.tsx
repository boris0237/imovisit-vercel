"use client"

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { MapPin, Bed, Bath, Maximize, Calendar, Phone, Share2, Heart, ArrowLeft, BadgeCheck, Home, Check } from 'lucide-react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
      <main className="flex-1 bg-gray-50">
        {/* Back Button */}
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => router.back()} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Button>
        </div>

        <div className="container mx-auto px-4 pb-12">
          {/* Image Gallery */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
            <div className="aspect-[4/3] rounded-xl overflow-hidden">
              <img
                src={property.images[selectedImage]}
                alt={property.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {property.images.slice(0, 4).map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 ${
                    selectedImage === index ? 'border-imo-primary' : 'border-transparent'
                  }`}
                >
                  <img src={image} alt={`${property.title} ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Header */}
              <div className="bg-white rounded-xl p-6 mb-6">
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className="bg-imo-primary">{getOfferTypeLabel(property.offerType)}</Badge>
                  <Badge variant="secondary">{getTypeLabel(property.type)}</Badge>
                  {property.ownerVerified && (
                    <Badge className="bg-green-500">
                      <BadgeCheck className="w-3 h-3 mr-1" />
                      Bailleur vérifié
                    </Badge>
                  )}
                </div>

                <h1 className="text-2xl md:text-3xl font-bold text-imo-primary mb-2">
                  {property.title}
                </h1>

                <div className="flex items-center gap-2 text-gray-600 mb-4">
                  <MapPin className="w-5 h-5" />
                  <span>{property.address}, {property.neighborhood}, {property.city}</span>
                </div>

                <div className="text-3xl font-bold text-imo-primary">
                  {formatPrice(property.price, property.offerType)}
                </div>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="details" className="bg-white rounded-xl">
                <TabsList className="w-full justify-start p-4 border-b">
                  <TabsTrigger value="details">Détails</TabsTrigger>
                  <TabsTrigger value="amenities">Commodités</TabsTrigger>
                  <TabsTrigger value="location">Localisation</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="p-6">
                  <h3 className="font-semibold text-lg mb-4">Description</h3>
                  <p className="text-gray-600 leading-relaxed mb-6">{property.description}</p>

                  <h3 className="font-semibold text-lg mb-4">Caractéristiques</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <Maximize className="w-5 h-5 text-imo-primary" />
                      <div>
                        <div className="text-sm text-gray-500">Surface</div>
                        <div className="font-semibold">{property.surface} m²</div>
                      </div>
                    </div>
                    {property.bedrooms !== undefined && (
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                        <Bed className="w-5 h-5 text-imo-primary" />
                        <div>
                          <div className="text-sm text-gray-500">Chambres</div>
                          <div className="font-semibold">{property.bedrooms}</div>
                        </div>
                      </div>
                    )}
                    {property.bathrooms !== undefined && (
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                        <Bath className="w-5 h-5 text-imo-primary" />
                        <div>
                          <div className="text-sm text-gray-500">Salles de bain</div>
                          <div className="font-semibold">{property.bathrooms}</div>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <Home className="w-5 h-5 text-imo-primary" />
                      <div>
                        <div className="text-sm text-gray-500">Pièces</div>
                        <div className="font-semibold">{property.rooms}</div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="amenities" className="p-6">
                  <h3 className="font-semibold text-lg mb-4">Commodités incluses</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {property.amenities.map((amenityId) => {
                      const amenity = amenitiesList.find((a) => a.id === amenityId)
                      return (
                        <div key={amenityId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Check className="w-5 h-5 text-green-500" />
                          <span>{amenity?.name || amenityId}</span>
                        </div>
                      )
                    })}
                  </div>
                </TabsContent>

                <TabsContent value="location" className="p-6">
                  <h3 className="font-semibold text-lg mb-4">Localisation</h3>
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <MapPin className="w-12 h-12 mx-auto mb-2" />
                      <p>Carte interactive</p>
                      <p className="text-sm">{property.address}</p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Owner Card */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-4">Propriétaire</h3>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-imo-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-imo-primary">
                        {property.ownerName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{property.ownerName}</span>
                        {property.ownerVerified && (
                          <BadgeCheck className="w-5 h-5 text-blue-500" />
                        )}
                      </div>
                      <div className="text-sm text-gray-500">Membre depuis 2023</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button className="w-full bg-imo-primary hover:bg-imo-secondary gap-2">
                      <Calendar className="w-4 h-4" />
                      Réserver une visite
                    </Button>
                    <Button variant="outline" className="w-full gap-2">
                      <Phone className="w-4 h-4" />
                      Contacter
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Actions Card */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className={`flex-1 gap-2 ${isFavorite ? 'text-red-500 border-red-500' : ''}`}
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

              {/* Visit Info */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-4">Informations visite</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Type de visite</span>
                      <span className="font-medium">
                        {property.visitType === 'in-person'
                          ? 'Présentiel'
                          : property.visitType === 'remote'
                          ? 'À distance'
                          : 'Présentiel ou à distance'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Frais de visite</span>
                      <span className="font-medium">
                        {property.visitFee > 0 ? `${property.visitFee.toLocaleString()} FCFA` : 'Gratuit'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Disponibilité</span>
                      <Badge className={property.isAvailable ? 'bg-green-500' : 'bg-red-500'}>
                        {property.isAvailable ? 'Disponible' : 'Indisponible'}
                      </Badge>
                    </div>
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
