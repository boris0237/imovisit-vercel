// Étapes du wizard d'ajout
export type PropertyStep = 1 | 2 | 3 | 4 | 5


// =============================
// Données globales du formulaire
// =============================
export interface PropertyFormData {
  type?: string;
  offerType?: string;
  title: string;
  description?: string;

  country?: string;
  city?: string;
  district?: string;
  address?: string;

  surface?: number;
  rooms?: number;
  bathrooms?: number;
  amenities?: string[];
  
    // Étape 4 — Photos & tarification
    images: File[]
    price: number | ""
    visitFee: number | ""
}



// =============================
// Props communes aux étapes
// =============================
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


// =============================
// Valeur initiale du formulaire
// =============================
