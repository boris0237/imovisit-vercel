// Étapes du wizard d'ajout
export type AddPropertyStep = 1 | 2 | 3 | 4 | 5


// =============================
// Données globales du formulaire
// =============================
export interface AddPropertyFormData {
  // Étape 1 — Informations générales
  type: string
  category: "location" | "vente" | "meuble" | ""
  title: string
  description: string

  // Étape 2 — Localisation
  country: string
  city: string
  neighborhood: string
  address: string

  // Étape 3 — Caractéristiques
  surface: number | ""
  rooms: number | ""
  bathrooms: number | ""
  amenities: string[]

  // Étape 4 — Photos & tarification
  images: File[]
  price: number | ""
  visitFee: number | ""
}


// =============================
// Props communes aux étapes
// =============================
export interface StepProps {
  data: AddPropertyFormData
  updateField: (field: keyof AddPropertyFormData, value: any) => void
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
export interface SuccessStepProps {
  data: AddPropertyFormData
  onFinish: () => void
}


// =============================
// Valeur initiale du formulaire
// =============================
export const initialPropertyForm: AddPropertyFormData = {
  type: "",
  category: "",
  title: "",
  description: "",

  country: "Cameroun",
  city: "",
  neighborhood: "",
  address: "",

  surface: "",
  rooms: "",
  bathrooms: "",
  amenities: [],

  images: [],
  price: "",
  visitFee: ""
}