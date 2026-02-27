export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  priceType: 'monthly' | 'daily' | 'sale';
  type: 'apartment' | 'house' | 'studio' | 'villa' | 'duplex' | 'land' | 'office' | 'shop' | 'building';
  offerType: 'rent' | 'sale' | 'furnished';
  city: string;
  docTitreFoncier?: String,
  neighborhood: string;
  address: string;
  surface: number;
  rooms: number;
  bedrooms?: number;
  bathrooms?: number;
  images: string[];
  amenities: string[];
  visitType: 'in-person' | 'remote' | 'both';
  visitFee: number;
  isAvailable: boolean;
  ownerId: string;
  ownerName: string;
  ownerVerified: boolean;
  ownerAvatar?: string;
  createdAt: string;
  views: number;
  visitsCount: number;
}

export interface PropertyFormData{
  data: string;
  updateData: string;
  next: boolean;
  prev: boolean;
  title: string;
  category: 'location ' | 'meuble' | 'vente';
  description: string;
  type: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: 'visitor' | 'owner' | 'agency' | 'agent' | 'admin';
  verified: boolean;
  city: string;
  country: string;
  createdAt: string;
}

export interface Visit {
  id: string;
  propertyId: string;
  propertyTitle: string;
  visitorId: string;
  visitorName: string;
  ownerId: string;
  date: string;
  time: string;
  type: 'in-person' | 'remote';
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';
  notes?: string;
}

export interface FilterOptions {
  city?: string;
  neighborhood?: string;
  minPrice?: number;
  maxPrice?: number;
  type?: string;
  offerType?: string;
  rooms?: number;
}

export interface Amenity {
  id: string;
  name: string;
  icon: string;
}
