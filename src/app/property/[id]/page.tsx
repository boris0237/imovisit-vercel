"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
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
import { amenitiesList } from '@/data/mock'
import { useDictionary } from '@/hooks/useDictionary'
import { fetchApi } from '@/services/apiConfig'

export default function PropertyDetail() {
  const {dictionary} = useDictionary()
  const params = useParams()
  const router = useRouter()
  const [selectedImage, setSelectedImage] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const [property, setProperty] = useState<any | null>(null)
  const [similarProperties, setSimilarProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [favoriteLoading, setFavoriteLoading] = useState(false)
  const hasViewedRef = useRef<string | null>(null)

  const propertyId = useMemo(() => {
    if (!params?.id) return '';
    return Array.isArray(params.id) ? params.id[0] : params.id;
  }, [params]);

  useEffect(() => {
    if (!propertyId) return;
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const res = await fetchApi(`/api/biens/${propertyId}`);
        setProperty(res?.data || null);
      } catch {
        setProperty(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [propertyId]);

  useEffect(() => {
    if (!propertyId) return;
    if (hasViewedRef.current === propertyId) return;
    hasViewedRef.current = propertyId;
    const incrementView = async () => {
      try {
        const res = await fetchApi(`/api/biens/${propertyId}/view`, { method: 'POST' });
        if (res?.data?.views && property) {
          setProperty((prev: any) => (prev ? { ...prev, views: res.data.views } : prev));
        }
      } catch {
        // ignore
      }
    };
    incrementView();
  }, [propertyId, property]);

  useEffect(() => {
    if (!propertyId) return;
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('token');
    if (!token) return;
    const fetchFavorite = async () => {
      try {
        const res = await fetchApi(`/api/biens/${propertyId}/favorite`);
        setIsFavorite(!!res?.data?.isFavorite);
      } catch {
        // ignore (not logged in or error)
      }
    };
    fetchFavorite();
  }, [propertyId]);

  useEffect(() => {
    if (!property) return;
    setSelectedImage(0);
    const fetchSimilar = async () => {
      try {
        const params = new URLSearchParams();
        params.set('limit', '6');
        if (property.city) params.set('city', property.city);
        if (property.type) params.set('type', property.type);
        const res = await fetchApi(`/api/biens/public?${params.toString()}`);
        const list = (res?.data?.properties || []).filter((item: any) => item.id !== property.id);
        setSimilarProperties(list.slice(0, 4));
      } catch {
        setSimilarProperties([]);
      }
    };
    fetchSimilar();
  }, [property]);

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-700 mb-4">
              {loading ? (dictionary.propertyPage?.loading || "Chargement...") : (dictionary.propertyPage?.title1 || "Bien non trouvé")}
            </h1>
            {!loading && (
              <Button onClick={() => router.push('/search')}>
                {dictionary.propertyPage?.btn1 || "Retour à la recherche"}
              </Button>
            )}
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const formatPrice = (price: number, priceType?: string, offerType?: string) => {
    const formatted = price?.toLocaleString() ?? '0'
    if (offerType === 'sale' || priceType === 'sale') return `${formatted} FCFA`
    if (priceType === 'daily') return `${formatted} F / jour`
    if (priceType === 'yearly') return `${formatted} F / an`
    return `${formatted} F / mois`
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
            <span>{dictionary.propertyPage?.sp1 || "Bien que location"} </span>
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
                      src={property.images?.[selectedImage] || property.images?.[0] || '/placeholder-property.jpg'}
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
                      onClick={async () => {
                        if (favoriteLoading) return;
                        try {
                          setFavoriteLoading(true);
                          const res = await fetchApi(`/api/biens/${propertyId}/favorite`, { method: 'POST' });
                          if (typeof res?.data?.isFavorite === 'boolean') {
                            setIsFavorite(res.data.isFavorite);
                          }
                        } catch (error: any) {
                          if (error?.status === 401) {
                            router.push('/login');
                          }
                        } finally {
                          setFavoriteLoading(false);
                        }
                      }}
                      className="absolute top-4 right-4 h-9 w-9 rounded-full bg-white/90 flex items-center justify-center text-slate-700 hover:bg-white"
                      aria-label="Ajouter aux favoris"
                    >
                      <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current text-rose-500' : ''}`} />
                    </button>
                  </div>
                  <div className="grid grid-cols-5 gap-2 p-4">
                    {(property.images || []).slice(0, 5).map((image: string, index: number) => (
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
                        <span>{property.neighborhood}, {property.city}, {dictionary.propertyPage?.sp2 || "Cameroun"}</span>
                      </div>
                    </div>
                    {(property.ownerVerified ?? property.userVerified) && (
                      <Badge className="bg-emerald-100 text-emerald-700 border-0">
                        <ShieldCheck className="w-3 h-3 mr-1" />
                        {dictionary.propertyPage?.badge || "Bien vérifié"}
                      </Badge>
                    )}
                  </div>

                  <div className="text-2xl font-semibold text-slate-900">
                    {formatPrice(property.price, property.priceType, property.offerType)}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{property.views} {dictionary.propertyPage?.sp3 || "vues"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CalendarCheck className="w-4 h-4" />
                      <span>{property.visitsCount} {dictionary.propertyPage?.sp4 || "visites réservées"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>
                        {dictionary.propertyPage?.sp5 || "Publié le"}{' '}
                        {property.createdAt ? new Date(property.createdAt).toLocaleDateString('fr-FR') : '--'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-3">
                      <Maximize className="w-4 h-4 text-slate-700" />
                      <div className="text-xs">
                        <p className="text-slate-500">{dictionary.propertyPage?.p1 || "Surface"}</p>
                        <p className="font-semibold text-slate-900">{property.surface} m²</p>
                      </div>
                    </div>
                    {(property.bedrooms !== undefined || property.rooms !== undefined) && (
                      <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-3">
                        <Bed className="w-4 h-4 text-slate-700" />
                        <div className="text-xs">
                          <p className="text-slate-500">{dictionary.propertyPage?.p2 || "Chambres"}</p>
                          <p className="font-semibold text-slate-900">{property.bedrooms ?? property.rooms}</p>
                        </div>
                      </div>
                    )}
                    {property.bathrooms !== undefined && (
                      <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-3">
                        <Bath className="w-4 h-4 text-slate-700" />
                        <div className="text-xs">
                          <p className="text-slate-500">{dictionary.propertyPage?.p3 || "Salles de bain"}</p>
                          <p className="font-semibold text-slate-900">{property.bathrooms}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-3">
                      <Car className="w-4 h-4 text-slate-700" />
                      <div className="text-xs">
                        <p className="text-slate-500">{dictionary.propertyPage?.p4 || "Parking"}</p>
                        <p className="font-semibold text-slate-900">
                          {property.amenities.includes('parking') ? '2 places' : 'Non inclus'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
                    <p>
                      {dictionary.propertyPage?.p5 || "Magnifique appartement rénové situé dans un quartier résidentiel calme. Proche de toutes commodités, transports en commun et écoles."}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Amenities */}
              <Card className="border-slate-200">
                <CardContent className="p-6">
                  <h2 className="text-sm font-semibold text-slate-800 mb-4">{dictionary.propertyPage?.title2 || "Commodités"}</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {(() => {
                      const list = Array.isArray(property.amenities)
                        ? property.amenities
                        : typeof property.amenities === 'string'
                          ? property.amenities.split(',').map((item: string) => item.trim()).filter(Boolean)
                          : [];
                      return list.map((amenityId: string) => {
                        const amenity = amenitiesList.find((a) => a.id === amenityId)
                        return (
                          <div key={amenityId} className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                            <Check className="w-4 h-4 text-emerald-500" />
                            <span>{amenity?.name || amenityId}</span>
                          </div>
                        )
                      })
                    })()}
                  </div>
                </CardContent>
              </Card>

              {/* Owner */}
              <Card className="border-slate-200">
                <CardContent className="p-6 space-y-4">
                  <h2 className="text-sm font-semibold text-slate-800">{dictionary.propertyPage?.title3 || "Propriétaire"}</h2>
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-semibold">
                        {(property.ownerName || property.userName || 'U').charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-slate-900">{property.ownerName || property.userName || 'Utilisateur'}</p>
                          <Badge className="bg-emerald-100 text-emerald-700 border-0">
                            {dictionary.propertyPage?.badge2 || "Agence immobilière"}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500">
                          {dictionary.propertyPage?.p6 || "Membre depuis Juin 2021"} 
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
                          <span>4.8</span>
                          <span>({dictionary.propertyPage?.sp6 || "24 avis"})</span>
                        </div>
                      </div>
                    </div>
                    
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{dictionary.propertyPage?.sp7 || "Signaler ce bailleur"}</span>
                    {(property.ownerVerified ?? property.userVerified) && (
                      <span className="flex items-center gap-1 text-emerald-600">
                        <BadgeCheck className="w-4 h-4" />
                        {dictionary.propertyPage?.sp8 || "Bailleur vérifié"}
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
                    <h2 className="text-lg font-semibold">{dictionary.propertyPage?.title4 || "Biens similaires"}</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {similarProperties.map((item) => (
                        <Card key={item.id} className="border-slate-200 overflow-hidden">
                          <CardContent className="p-0">
                            <div className="relative">
                              <img
                                src={item.images?.[0] || '/placeholder-property.jpg'}
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
                                  <span>{item.bedrooms ?? item.rooms ?? 1}</span>
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
                                    {(item.ownerName || item.userName || 'U').charAt(0)}
                                  </div>
                                  <span>{item.ownerName || item.userName || 'Utilisateur'}</span>
                                  {(item.ownerVerified ?? item.userVerified) && (
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
                      {dictionary.propertyPage?.btn3 || "Voir plus de bien"}
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
                    <h2 className="text-sm font-semibold text-slate-800 mb-2">{dictionary.propertyPage?.title5 || "Réserver une visite"}</h2>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{dictionary.propertyPage?.sp9 || "Frais de visite"}</span>
                      <span className="font-semibold text-slate-900">
                        {property.visitFee > 0 ? `${property.visitFee.toLocaleString()} FCFA` : 'Gratuit'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-2">{dictionary.propertyPage?.p7 || "Type de visite"}</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" className="h-12 flex-col gap-1 text-xs">
                        <MapPin className="w-4 h-4" />
                        {dictionary.propertyPage?.btn4 || "En présentiel"}
                      </Button>
                      <Button variant="outline" className="h-12 flex-col gap-1 text-xs">
                        <Video className="w-4 h-4" />
                        {dictionary.propertyPage?.btn5 || "À distance"}
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <BadgeCheck className="w-4 h-4 text-emerald-500" />
                      <span>{dictionary.propertyPage?.sp10 || "Vous recevrez l'adresse exacte quelques heures avant la visite."}</span>
                    </div>
                  </div> 

                  <div>
                    <p className="text-xs text-slate-500 mb-2">{dictionary.propertyPage?.p8 || "Date souhaitée"}</p>
                    <Input type="date" className="bg-white border-slate-200" />
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-2">{dictionary.propertyPage?.p9 || "Créneau horaire"}</p>
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
                    {dictionary.propertyPage?.btn6 || "Réserver la visite"}
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
