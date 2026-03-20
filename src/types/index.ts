export interface PropertyData {
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
  images: File[];
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
  country: any;
  district: any;
  address: any;
  price: any;
  data: string;
  updateData: string;
  next: boolean;
  prev: boolean;
  title: string;
  offerType: 'location' | 'meuble' | 'vente';
  description: string;
  type: string;
  priceType : "vente" | "location_mensuelle" | "locaation_journalière";
  city: string;
  neighborhood: string;
  bedrooms: number;
  visitType: "gratuit" | "payant";
  isAvailable: boolean;
  surface: number;
  rooms: number;
  bathrooms: number;
  amenities: string[];
  images: File[];
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
  search?: string;
  cityId?: string;
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

export interface StepProps {
  data: PropertyFormData
  updateField: (field: keyof PropertyFormData, value: any) => void
  next: () => void
  prev: () => void
}


// =============================
// Props spécifiques Step 4
// =============================
export interface StepPricingProps extends StepProps {
  onSubmit: () => void
}


// =============================
// Props écran de confirmation
// =============================
export interface Step5Succes {
  data: PropertyFormData
  onFinish: () => void
}
