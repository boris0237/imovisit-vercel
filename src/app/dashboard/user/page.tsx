"use client"

import {
  Building2,
  Calendar,
  Plus,
  MapPin,
  BedDouble,
  Bath,
  Ruler,
  Search,
  KeyRound,
  Tag,
  Sofa,
  Eye,
  Edit,
  X,
  Check,
  Image as ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useMemo, useRef, useState } from "react";
import LanguageDropdown from '@/components/LanguageDropdown';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDictionary } from '@/hooks/useDictionary';
import Modal from '@/components/ui/modal';
import { Checkbox } from '@/components/ui/checkbox';
import { fetchApi } from '@/services/apiConfig';
import { toast } from 'sonner';

type Country = { id: string; name: string; code: string };
type City = { id: string; name: string; countryId: string };
type District = { id: string; name: string; cityId: string };

export default function Dashboard() {

  const { language, setLanguage } = useLanguage()
  const {dictionary} = useDictionary();
  const { user } = useAuth();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [statsData, setStatsData] = useState<any>(null);
  const [loadingList, setLoadingList] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [limit] = useState(9);
  const [total, setTotal] = useState(0);
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [images, setImages] = useState<(File | null)[]>(() => Array(5).fill(null));
  const [imagePreviews, setImagePreviews] = useState<(string | null)[]>(() => Array(5).fill(null));
  const [activeImageSlot, setActiveImageSlot] = useState(0);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    type: '',
    offerType: 'rent',
    priceType: 'monthly',
    title: '',
    description: '',
    countryId: '',
    cityId: '',
    districtId: '',
    address: '',
    surface: '',
    rooms: '',
    bathrooms: '',
    amenities: [] as string[],
    price: '',
    visitFee: '',
  });

const stats = [
  { title: dictionary.dashboard?.stats1 || "Total Properties", value: statsData?.properties?.totalProperties ?? 0, icon: Building2, color: 'bg-slate-100 text-slate-600' },
  { title: dictionary.dashboard?.stats2 || "Properties for Rent", value: statsData?.properties?.totalRent ?? 0, icon: KeyRound, color: 'bg-emerald-100 text-emerald-600' },
  { title: dictionary.dashboard?.stats3 || "Properties for Sale", value: statsData?.properties?.totalSale ?? 0, icon: Tag, color: 'bg-amber-100 text-amber-600' },
  { title: dictionary.dashboard?.stats4 || "Furnished Properties", value: statsData?.properties?.totalFurnished ?? 0, icon: Sofa, color: 'bg-indigo-100 text-indigo-600' },
];

const typeLabels: Record<string, string> = {
  apartment: 'Appartement',
  villa: 'Villa',
  studio: 'Studio',
  duplex: 'Duplex',
  office: 'Bureau',
  land: 'Terrain',
  house: 'Maison',
  shop: 'Boutique',
};

const offerLabels: Record<string, { label: string; className: string }> = {
  rent: { label: 'Location', className: 'bg-blue-100 text-blue-700' },
  sale: { label: 'A vendre', className: 'bg-amber-100 text-amber-700' },
  furnished: { label: 'Meublé', className: 'bg-emerald-100 text-emerald-700' },
};
  const formatPrice = (price: number, priceType?: string) => {
    const formatted = price?.toLocaleString('fr-FR') ?? '0';
    if (priceType === 'daily') return `${formatted} F/jour`;
    if (priceType === 'monthly') return `${formatted} F/mois`;
    if (priceType === 'yearly') return `${formatted} F/an`;
    if (priceType === 'sale') return `${formatted} FCFA`;
    return `${formatted} FCFA`;
  };
  const amenities = [
    { label: 'Eau courante', value: 'water' },
    { label: 'Electricité', value: 'electricity' },
    { label: 'Wi‑Fi', value: 'wifi' },
    { label: 'Parking', value: 'parking' },
    { label: 'Forage', value: 'borehole' },
    { label: 'Gardien', value: 'security' },
    { label: 'Piscine', value: 'pool' },
    { label: 'Service nettoyage', value: 'cleaning' },
  ];

  const canNext = useMemo(() => {
    if (step === 1) return form.type && form.offerType && form.title.trim() && form.description.trim();
    if (step === 2) return form.countryId && form.cityId && form.districtId && form.address.trim();
    if (step === 3) return form.surface && form.rooms && form.bathrooms;
    if (step === 4) {
      const hasImages = images.some(Boolean) || imagePreviews.some(Boolean);
      return form.price.trim() !== '' && hasImages;
    }
    return true;
  }, [step, form, images, imagePreviews]);

  const resetForm = () => {
    setStep(1);
    setImages(Array(5).fill(null));
    setImagePreviews(Array(5).fill(null));
    setActiveImageSlot(0);
   setForm({
  type: '',
  offerType: 'rent',
  priceType: 'monthly', 
  title: '',
  description: '',
  countryId: '',
  cityId: '',
  districtId: '',
  address: '',
  surface: '',
  rooms: '', 
  bathrooms: '',
  amenities: [] as string[],
  price: '',
  visitFee: '',
});
  };

  const fetchCountries = async () => {
    const res = await fetchApi('/api/countries?limit=100');
    setCountries(res?.data?.data || []);
  };

  const fetchCities = async (countryId: string) => {
    if (!countryId) {
      setCities([]);
      return;
    }
    const res = await fetchApi(`/api/cities?limit=100&countryId=${countryId}`);
    setCities(res?.data?.data || []);
  };

  const fetchDistricts = async (cityId: string) => {
    if (!cityId) {
      setDistricts([]);
      return;
    }
    const res = await fetchApi(`/api/districts?limit=100&cityId=${cityId}`);
    setDistricts(res?.data?.data || []);
  };

  useEffect(() => {
    if (isCreateOpen) {
      fetchCountries();
    }
  }, [isCreateOpen]);

  useEffect(() => {
    if (form.countryId) {
      fetchCities(form.countryId);
    } else {
      setCities([]);
    }
    setForm((prev) => ({ ...prev, cityId: '', districtId: '' }));
  }, [form.countryId]);

  useEffect(() => {
    if (form.cityId) {
      fetchDistricts(form.cityId);
    } else {
      setDistricts([]);
    }
    setForm((prev) => ({ ...prev, districtId: '' }));
  }, [form.cityId]);

  useEffect(() => {
    if (form.offerType === 'sale') {
      setForm((prev) => ({ ...prev, priceType: 'sale' }));
    } else if (form.priceType === 'sale') {
      setForm((prev) => ({ ...prev, priceType: 'monthly' }));
    }
  }, [form.offerType]);

  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [imagePreviews]);

  const handleImagesChange = (files: FileList | null) => {
    if (!files) return;
    const selected = Array.from(files);
    if (selected.length === 0) return;
    const maxCount = 5 - activeImageSlot;
    const slice = selected.slice(0, maxCount);
    if (slice.length === 0) return;

    setImages((prev) => {
      const next = [...prev];
      slice.forEach((file, idx) => {
        next[activeImageSlot + idx] = file;
      });
      return next;
    });

    setImagePreviews((prev) => {
      const next = [...prev];
      slice.forEach((file, idx) => {
        const slot = activeImageSlot + idx;
        const old = next[slot];
        if (old && old.startsWith('blob:')) {
          URL.revokeObjectURL(old);
        }
        next[slot] = URL.createObjectURL(file);
      });
      return next;
    });

    setActiveImageSlot((prev) => Math.min(prev + slice.length, 4));
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const submitProperty = async () => {
    if (!canNext) return;
    try {
      setSubmitting(true);
      const cityName = cities.find((c) => c.id === form.cityId)?.name || '';
      const districtName = districts.find((d) => d.id === form.districtId)?.name || '';
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('price', form.price);
      formData.append('priceType', form.priceType);
      formData.append('type', form.type);
      formData.append('offerType', form.offerType);
      formData.append('city', cityName);
      formData.append('neighborhood', districtName);
      formData.append('address', form.address);
      formData.append('surface', form.surface);
      formData.append('rooms', form.rooms);
      formData.append('bathrooms', form.bathrooms);
      formData.append('visitType', 'both');
      if (form.visitFee) formData.append('visitFee', form.visitFee);

      form.amenities.forEach((amenity) => {
        formData.append('amenities', amenity);
      });

      images.filter(Boolean).forEach((file) => {
        formData.append('images', file as File);
      });

      if (mode === 'create') {
        await fetchApi('/api/biens', {
          method: 'POST',
          body: formData,
        });
        toast.success('Bien créé avec succès.');
      } else if (editingId) {
        await fetchApi(`/api/biens/${editingId}`, {
          method: 'PATCH',
          body: formData,
        });
        toast.success('Bien modifié avec succès.');
      }

      await Promise.all([fetchProperties(), fetchStats()]);
      setStep(5);
    } catch (error: any) {
      toast.error(error?.message || "Erreur lors de la création du bien.");
    } finally {
      setSubmitting(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetchApi('/api/biens/stats');
      setStatsData(res?.data || null);
    } catch (error: any) {
      toast.error(error?.message || "Erreur lors du chargement des statistiques.");
    }
  };

  const fetchProperties = async () => {
    setLoadingList(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(limit));
      if (searchQuery) params.set('search', searchQuery);
      if (typeFilter !== 'all') params.set('type', typeFilter);
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const res = await fetchApi(`/api/biens?${params.toString()}`);
      const payload = res?.data || {};
      const list = payload?.properties || [];
      setProperties(list);
      setTotal(payload?.total || 0);
    } catch (error: any) {
      toast.error(error?.message || "Erreur lors du chargement des biens.");
    } finally {
      setLoadingList(false);
    }
  };

  const openCreateModal = () => {
    setMode('create');
    setEditingId(null);
    resetForm();
    setIsCreateOpen(true);
  };

  const openEditModal = async (property: any) => {
    setMode('edit');
    setEditingId(property.id);
    setIsCreateOpen(true);
    setStep(1);
    setImages(Array(5).fill(null));
    setImagePreviews(() => {
      const previews = Array(5).fill(null);
      if (Array.isArray(property.images)) {
        property.images.slice(0, 5).forEach((url: string, index: number) => {
          previews[index] = url;
        });
      }
      return previews;
    });
    setActiveImageSlot(0);
    setForm({
      type: property.type || '',
      offerType: property.offerType || 'rent',
      priceType: property.priceType || (property.offerType === 'sale' ? 'sale' : 'monthly'),
      title: property.title || '',
      description: property.description || '',
      countryId: '',
      cityId: '',
      districtId: '',
      address: property.address || '',
      surface: property.surface?.toString() || '',
      rooms: property.rooms?.toString() || '',
      bathrooms: property.bathrooms?.toString() || '',
      amenities: property.amenities || [],
      price: property.price?.toString() || '',
      visitFee: property.visitFee?.toString() || '',
    });

    // Pré-remplissage ville/quartier
    try {
      const cityRes = await fetchApi(`/api/cities?search=${encodeURIComponent(property.city || '')}&limit=1`);
      const city = cityRes?.data?.data?.[0];
      if (city) {
        setForm((prev) => ({ ...prev, countryId: city.countryId, cityId: city.id }));
        const districtsRes = await fetchApi(`/api/districts?cityId=${city.id}&limit=100`);
        const district = districtsRes?.data?.data?.find((d: any) => d.name === property.neighborhood);
        if (district) {
          setForm((prev) => ({ ...prev, districtId: district.id }));
        }
      }
    } catch {
      // ignore
    }
  };

  const toggleAvailability = async (property: any) => {
    try {
      const formData = new FormData();
      formData.append('isAvailable', (!property.isAvailable).toString());
      await fetchApi(`/api/biens/${property.id}`, { method: 'PATCH', body: formData });
      await Promise.all([fetchProperties(), fetchStats()]);
      toast.success('Statut mis à jour.');
    } catch (error: any) {
      toast.error(error?.message || "Erreur lors de la mise à jour.");
    }
  };

  useEffect(() => {
    fetchStats();
    fetchProperties();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchQuery(searchText.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timeout);
  }, [searchText]);

  useEffect(() => {
    fetchProperties();
  }, [page, limit, searchQuery, typeFilter, statusFilter]);

  
  return (
    <>
      <header className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{dictionary.dashboard?.title1 || "Mes biens immobiliers"}</h1>
            <p className="text-sm text-slate-500">
              {dictionary.dashboard?.subTitle1 || "Gérez vos annonces, suivez les performances et planifiez vos visites"}
            </p>
          </div>
          <div className='flex flex-col-1 space-x-8'>
            <LanguageDropdown
             currentLanguage={language}
             onLanguageChange={setLanguage}
          />
            <Button className="bg-slate-900 hover:bg-slate-800 gap-2" onClick={openCreateModal}>
              <Plus className="w-4 h-4" />
              {dictionary.dashboard?.buttonAdd || "Ajouter un bien"}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <Card key={stat.title} className="border-slate-200">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">{stat.title}</p>
                    <p className="text-lg font-semibold text-slate-900">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex flex-col lg:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder={dictionary.dashboard?.search || "Rechercher un bien..."}
                className="pl-9 bg-white border-slate-200"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <Select
                value={typeFilter}
                onValueChange={(value) => {
                  setTypeFilter(value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-44 bg-white border-slate-200">
                  <SelectValue placeholder={dictionary.dashboard?.type1 || "Tous les types"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{dictionary.dashboard?.type1 || "Tous les types"}</SelectItem>
                  <SelectItem value="apartment">{dictionary.dashboard?.type2 || "Appartement"}</SelectItem>
                  <SelectItem value="villa">{dictionary.dashboard?.type3 || "Villa"}</SelectItem>
                  <SelectItem value="studio">{dictionary.dashboard?.type4 || "Studio"}</SelectItem>
                  <SelectItem value="office">{dictionary.dashboard?.type5 || "Bureau"}</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-44 bg-white border-slate-200">
                  <SelectValue placeholder={dictionary.dashboard?.status1 || "Tous les statuts"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{dictionary.dashboard?.status1 || "Tous les statuts"}</SelectItem>
                  <SelectItem value="available">{dictionary.dashboard?.status2 || "Disponible"}</SelectItem>
                  <SelectItem value="unavailable">{dictionary.dashboard?.status3 || "Indisponible"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {loadingList && (
              <div className="col-span-full text-sm text-slate-500">Chargement des biens...</div>
            )}
            {!loadingList && properties.length === 0 && (
              <div className="col-span-full text-sm text-slate-500">Aucun bien trouvé.</div>
            )}
            {properties.map((property) => {
              const offer = offerLabels[property.offerType] ?? offerLabels.rent;
              return (
                <Card key={property.id} className="border-slate-200 overflow-hidden">
                  <div className="relative">
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="w-full h-44 object-cover"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <Badge className={`${offer.className} border-0`}>{offer.label}</Badge>
                      <Badge className="bg-slate-900 text-white border-0">
                        {typeLabels[property.type] ?? 'Bien'}
                      </Badge>
                    </div>
                    <div className="absolute top-3 right-3 flex items-center gap-2">
                      <Button size="icon" variant="secondary" className="h-8 w-8 bg-white/90 hover:bg-white" onClick={() => openEditModal(property)}>
                        <Edit className="w-4 h-4 text-slate-700" />
                      </Button>
                    </div>
                    <div className="absolute bottom-3 left-3 bg-white/90 text-slate-900 text-xs font-semibold px-2.5 py-1 rounded-lg">
                      {formatPrice(property.price, property.priceType)}
                    </div>
                  </div>
                  <CardContent className="p-5 space-y-4">
                    <div>
                      <h3 className="font-semibold text-slate-900 leading-snug">{property.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>
                          {property.neighborhood}, {property.city}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <div className="flex items-center gap-1">
                        <BedDouble className="w-4 h-4" />
                        <span>{property.bedrooms ?? 1}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Bath className="w-4 h-4" />
                        <span>{property.bathrooms ?? 1}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Ruler className="w-4 h-4" />
                        <span>{property.surface} m²</span>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          <span>{property.views}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{property.visitsCount}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">
                          {property.isAvailable ? 'Actif' : 'Inactif'}
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={property.isAvailable}
                            onChange={() => toggleAvailability(property)}
                            className="sr-only peer"
                          />
                          <div className="relative w-9 h-5 bg-slate-200 rounded-full peer peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:h-4 after:w-4 after:rounded-full after:transition-transform peer-checked:after:translate-x-4" />
                        </label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
          {total > 0 && (
            <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-sm text-slate-600">
              <div>
                Page {page} sur {Math.max(1, Math.ceil(total / limit))}
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
                  onClick={() => setPage((prev) => Math.min(Math.ceil(total / limit), prev + 1))}
                  disabled={page >= Math.ceil(total / limit)}
                >
                  Suivant
                </Button>
              </div>
            </div>
          )}
        </div>
        

      </div>

      <Modal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          resetForm();
        }}
        title=""
        size="2xl"
        showBlur
        showHeader={false}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-semibold text-slate-900">Ajouter un nouveau bien</h2>
            <p className="text-sm text-slate-500 mt-2">Étape {step} sur 4</p>
          </div>
          <button
            className="text-slate-500 hover:text-slate-900"
            onClick={() => {
              setIsCreateOpen(false);
              resetForm();
            }}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mt-6 flex items-center gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="flex-1 flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-semibold ${
                  step > n ? 'bg-emerald-500 text-white' : step === n ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {step > n ? <Check className="w-5 h-5" /> : n}
              </div>
              {n < 4 && (
                <div className={`h-1 flex-1 rounded-full ${step > n ? 'bg-slate-900' : 'bg-slate-200'}`} />
              )}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="mt-8 space-y-6">
            <div className="bg-slate-100 border-l-4 border-slate-900 rounded-xl p-4">
              <p className="font-semibold text-slate-900">Informations générales</p>
              <p className="text-sm text-slate-600">Définissez le type de bien et l'offre souhaitée</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-slate-700">Type de bien *</label>
                <Select value={form.type} onValueChange={(value) => setForm((prev) => ({ ...prev, type: value }))}>
                  <SelectTrigger className="mt-2 bg-white border-slate-200">
                    <SelectValue placeholder="Sélectionner un bien..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apartment">Appartement</SelectItem>
                    <SelectItem value="villa">Villa</SelectItem>
                    <SelectItem value="studio">Studio</SelectItem>
                    <SelectItem value="duplex">Duplex</SelectItem>
                    <SelectItem value="office">Bureau</SelectItem>
                    <SelectItem value="land">Terrain</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Type d'offre *</label>
                <div className="mt-2 grid grid-cols-3 gap-3">
                  {[
                    { value: 'rent', label: 'Location', icon: KeyRound },
                    { value: 'sale', label: 'Vente', icon: Tag },
                    { value: 'furnished', label: 'Meublé', icon: Sofa },
                  ].map((offer) => (
                    <button
                      key={offer.value}
                      className={`border rounded-xl p-4 text-center ${form.offerType === offer.value ? 'border-slate-900 bg-slate-100' : 'border-slate-200'}`}
                      onClick={() => setForm((prev) => ({ ...prev, offerType: offer.value }))}
                      type="button"
                    >
                      <offer.icon className="w-5 h-5 mx-auto text-slate-700" />
                      <p className="text-sm font-medium mt-2">{offer.label}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Titre du bien *</label>
              <Input
                className="mt-2"
                placeholder="Ex: Appartement moderne avec balcon"
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              />
              <p className="text-xs text-slate-400 mt-2">Ce titre apparaîtra dans les résultats de recherche</p>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Description détaillée *</label>
              <textarea
                className="mt-2 w-full min-h-[140px] rounded-md border border-slate-200 p-3 text-sm"
                placeholder="Décrivez votre bien, son état, ses atouts, le quartier"
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                maxLength={500}
              />
              <div className="text-xs text-slate-400 mt-2 text-right">{form.description.length}/500 caractères</div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="mt-8 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-slate-700">Pays *</label>
                <Select value={form.countryId} onValueChange={(value) => setForm((prev) => ({ ...prev, countryId: value }))}>
                  <SelectTrigger className="mt-2 bg-white border-slate-200">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.id} value={country.id}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Ville *</label>
                <Select value={form.cityId} onValueChange={(value) => setForm((prev) => ({ ...prev, cityId: value }))}>
                  <SelectTrigger className="mt-2 bg-white border-slate-200">
                    <SelectValue placeholder="Sélectionner" />
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
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Quartier *</label>
              <Select value={form.districtId} onValueChange={(value) => setForm((prev) => ({ ...prev, districtId: value }))}>
                <SelectTrigger className="mt-2 bg-white border-slate-200">
                  <SelectValue placeholder="D'abord sélectionner une ville" />
                </SelectTrigger>
                <SelectContent>
                  {districts.map((district) => (
                    <SelectItem key={district.id} value={district.id}>
                      {district.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-400 mt-2">Ce titre apparaîtra dans les résultats de recherche</p>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Adresse exacte *</label>
              <Input
                className="mt-2"
                placeholder="Rue, numéro, immeuble, étage..."
                value={form.address}
                onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="mt-8 space-y-6">
            <div className="bg-slate-100 border-l-4 border-slate-900 rounded-xl p-4">
              <p className="font-semibold text-slate-900">Caractéristiques</p>
              <p className="text-sm text-slate-600">Détaillez les spécificités techniques du bien</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <label className="text-sm font-medium text-slate-700">Surface (m²) *</label>
                <Input
                  className="mt-2"
                  placeholder="75"
                  value={form.surface}
                  onChange={(e) => setForm((prev) => ({ ...prev, surface: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Nombre de pièces *</label>
                <Select value={form.rooms} onValueChange={(value) => setForm((prev) => ({ ...prev, rooms: value }))}>
                  <SelectTrigger className="mt-2 bg-white border-slate-200">
                    <SelectValue placeholder="3 pièces" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <SelectItem key={n} value={`${n}`}>
                        {n} pièces
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Salle de bain *</label>
                <Input
                  className="mt-2"
                  placeholder="1"
                  value={form.bathrooms}
                  onChange={(e) => setForm((prev) => ({ ...prev, bathrooms: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Commodités disponibles</label>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {amenities.map((amenity) => {
                  const checked = form.amenities.includes(amenity.value);
                  return (
                    <label
                      key={amenity.value}
                      className={`flex items-center gap-3 border rounded-xl px-3 py-3 text-sm ${
                        checked ? 'border-slate-900 bg-slate-50' : 'border-slate-200'
                      }`}
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(value) => {
                          setForm((prev) => ({
                            ...prev,
                            amenities: value
                              ? [...prev.amenities, amenity.value]
                              : prev.amenities.filter((item) => item !== amenity.value),
                          }));
                        }}
                      />
                      {amenity.label}
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="mt-8 space-y-6">
            <div className="bg-slate-100 border-l-4 border-slate-900 rounded-xl p-4">
              <p className="font-semibold text-slate-900">Photos et tarification</p>
              <p className="text-sm text-slate-600">Ajoutez des photos attractives et définissez votre prix</p>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Photos du bien * (1 à 5 photos)</label>
              <input
                id="property-images"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleImagesChange(e.target.files)}
                ref={imageInputRef}
              />
              <div className="mt-3 grid grid-cols-2 md:grid-cols-5 gap-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      setActiveImageSlot(index);
                      imageInputRef.current?.click();
                    }}
                    className={`border border-dashed rounded-2xl h-24 flex items-center justify-center text-slate-400 cursor-pointer overflow-hidden ${
                      index === activeImageSlot ? 'border-slate-900' : 'border-slate-300'
                    }`}
                  >
                    {imagePreviews[index] ? (
                      <img src={imagePreviews[index]} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-8 h-8" />
                    )}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-2">La première photo sera l'image principale. Formats acceptés : JPG, PNG. Max 5 Mo par photo.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-slate-700">Prix *</label>
                <Input
                  className="mt-2"
                  placeholder="150000 FCFA"
                  value={form.price}
                  onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                />
                <p className="text-xs text-slate-400 mt-2">prix total pour la vente</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Frais de visite</label>
                <Input
                  className="mt-2"
                  placeholder="0 FCFA"
                  value={form.visitFee}
                  onChange={(e) => setForm((prev) => ({ ...prev, visitFee: e.target.value }))}
                />
                <p className="text-xs text-slate-400 mt-2">
                  Les frais de visite sont payés par le visiteur avant confirmation
                </p>
              </div>
            </div>

            {(form.offerType === 'rent' || form.offerType === 'furnished') && (
              <div>
                <label className="text-sm font-medium text-slate-700">Unité de prix *</label>
                <Select
                  value={form.priceType}
                  onValueChange={(value) => setForm((prev) => ({ ...prev, priceType: value }))}
                >
                  <SelectTrigger className="mt-2 bg-white border-slate-200 w-full max-w-xs">
                    <SelectValue placeholder="Par mois" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Par jour</SelectItem>
                    <SelectItem value="monthly">Par mois</SelectItem>
                    <SelectItem value="yearly">Par année</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}

        {step === 5 && (
          <div className="mt-8 text-center space-y-6">
            <div className="mx-auto w-24 h-24 rounded-full bg-emerald-500 flex items-center justify-center">
              <Check className="w-10 h-10 text-white" />
            </div>
            <p className="text-slate-600">Votre bien a été créé avec succès.</p>
            <div className="bg-slate-50 rounded-2xl p-6 text-left max-w-xl mx-auto">
              <p className="text-xl font-semibold text-slate-900 mb-4">Récapitulatif</p>
              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span className="text-slate-900 font-semibold">{form.type || 'Appartement'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Localisation:</span>
                  <span className="text-slate-900 font-semibold">
                    {form.cityId ? cities.find((c) => c.id === form.cityId)?.name : 'Douala'}, {form.districtId ? districts.find((d) => d.id === form.districtId)?.name : 'Akwa'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Surface:</span>
                  <span className="text-slate-900 font-semibold">{form.surface || '10'} m²</span>
                </div>
                <div className="flex justify-between">
                  <span>Prix:</span>
                  <span className="text-emerald-600 font-semibold">{form.price || '100000'} FCFA</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between">
          <Button variant="ghost" onClick={() => {
            setIsCreateOpen(false);
            resetForm();
          }}>
            Annuler
          </Button>
          {step < 5 && (
            <Button
              className="bg-slate-900 hover:bg-slate-800 gap-2"
              onClick={() => {
                if (step < 4) {
                  setStep(step + 1);
                } else if (step === 4) {
                  submitProperty();
                }
              }}
              disabled={!canNext || submitting}
            >
              {step === 4 ? (submitting ? 'Création...' : 'Suivant') : 'Suivant'}
              <span>→</span>
            </Button>
          )}
          {step === 5 && (
            <Button
              className="bg-slate-900 hover:bg-slate-800 gap-2"
              onClick={() => {
                setIsCreateOpen(false);
                resetForm();
              }}
            >
              Terminer →
            </Button>
          )}
        </div>
      </Modal>
    </>
  );
}