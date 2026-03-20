"use client";
import type { Property, User, Visit } from '@/types';

export const mockProperties: Property[] = [];

export const mockUsers: User[] = [
  {
    id: 'u1',
    name: 'Alice Kamga',
    email: 'alice@example.com',
    phone: '+237 6XX XXX XXX',
    role: 'visitor',
    verified: true,
    city: 'Yaoundé',
    country: 'Cameroun',
    createdAt: '2024-01-01',
  },
  {
    id: 'o1',
    name: 'Jean Dupont',
    email: 'jean@example.com',
    phone: '+237 6XX XXX XXX',
    role: 'owner',
    verified: true,
    city: 'Yaoundé',
    country: 'Cameroun',
    createdAt: '2023-12-15',
  },
];

export const mockVisits: Visit[] = [
  {
    id: 'v1',
    propertyId: '1',
    propertyTitle: 'Appartement moderne 3 pièces',
    visitorId: 'u1',
    visitorName: 'Alice Kamga',
    ownerId: 'o1',
    date: '2024-02-15',
    time: '14:00',
    type: 'in-person',
    status: 'confirmed',
  },
  {
    id: 'v2',
    propertyId: '2',
    propertyTitle: 'Villa luxueuse avec piscine',
    visitorId: 'u1',
    visitorName: 'Alice Kamga',
    ownerId: 'o2',
    date: '2024-02-18',
    time: '10:00',
    type: 'remote',
    status: 'pending',
  },
];

export const cities = ['Yaoundé', 'Douala', 'Bafoussam', 'Bamenda', 'Garoua'];

export const neighborhoods: Record<string, string[]> = {
  'Yaoundé': ['Bastos', 'Centre-ville', 'Mfandena', 'Nsimeyong', 'Odza', 'Ekounou', 'Biyem-Assi'],
  'Douala': ['Bonapriso', 'Akwa', 'Deido', 'Bonanjo', 'Makepe'],
  'Bafoussam': ['Centre-ville', 'Tamdja', 'Djeleng'],
  'Bamenda': ['Mile 2', 'Nkwen', 'City Chemist'],
  'Garoua': ['Centre-ville', 'Boulaï', 'Pitoare'],
};

export const propertyTypes = [
  { value: 'apartment', label: 'Appartement' },
  { value: 'house', label: 'Maison' },
  { value: 'studio', label: 'Studio' },
  { value: 'villa', label: 'Villa' },
  { value: 'duplex', label: 'Duplex' },
  { value: 'land', label: 'Terrain' },
  { value: 'office', label: 'Bureau' },
  { value: 'shop', label: 'Boutique' },
  { value: 'building', label: 'Immeuble' },
];

export const offerTypes = [
  { value: 'rent', label: 'Location' },
  { value: 'sale', label: 'Vente' },
  { value: 'furnished', label: 'Meublé' },
];

export const amenitiesList = [
  { id: 'wifi', name: 'WiFi', icon: 'Wifi' },
  { id: 'parking', name: 'Parking', icon: 'Car' },
  { id: 'pool', name: 'Piscine', icon: 'Waves' },
  { id: 'security', name: 'Sécurité', icon: 'Shield' },
  { id: 'water', name: 'Eau', icon: 'Droplets' },
  { id: 'electricity', name: 'Électricité', icon: 'Zap' },
  { id: 'garden', name: 'Jardin', icon: 'Flower2' },
  { id: 'ac', name: 'Climatisation', icon: 'Wind' },
  { id: 'furnished', name: 'Meublé', icon: 'Sofa' },
  { id: 'terrace', name: 'Terrasse', icon: 'Sun' },
  { id: 'cleaning', name: 'Ménage', icon: 'Sparkles' },
  { id: 'fenced', name: 'Clôturé', icon: 'Fence' },
  { id: 'concierge', name: 'Conciergerie', icon: 'Bell' },
  { id: 'generator', name: 'Groupe électrogène', icon: 'BatteryCharging' },
  { id: 'surveillance', name: 'Vidéo surveillance', icon: 'Cctv' },
];

export const events = [
  {
    id: 1,
    image: "/images/property1.jpg",
    title: "Open House - Residence Panorama",
    location: "Bastos, Yaoundé",
    startTime: "10h00",
    endTime: "15h00",
    views: 150,
    visitsCount: 20,
    ownerName: "Jean Dupont",
    ownerVerified: true
  },
  {
    id: 2,
    image: "/images/property2.jpg",
    title: "Open House - Residence Panorama",
    location: "Bastos, Yaoundé",
    startTime: "10h00",
    endTime: "15h00",
    views: 120,
    visitsCount: 45,
    ownerName: "Marie Dubois",
    ownerVerified: false
  },
  {
    id: 3,
    image: "/images/property3.jpg",
    title: "Open House - Residence Panorama",
    location: "Bastos, Yaoundé",
    startTime: "10h00",
    endTime: "15h00",
    views: 90,
    visitsCount: 30,
    ownerName: "Pierre Martin",
    ownerVerified: true
  }
]
