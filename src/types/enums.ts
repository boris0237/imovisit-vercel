// utilitaire pour créer un enum typé
function createEnum<const T extends string[]>(values: T) {
  return {
    values,
    type: null as unknown as T[number],
  };
}


// USER
export const UserRole = createEnum([ // type de utilisateur
  "visitor",
  "owner",
  "property_manager",
  "prospector",
  "provider",
  "free_agent",
  "agency",
  "agent",
  "admin",
]);
export type UserRole = typeof UserRole.type;
export const USER_ROLES = UserRole.values;
export const USER_ROLE_ENUM = {
  visitor: "visitor",
  owner: "owner",
  property_manager: "property_manager",
  prospector: "prospector", 
  provider: "provider",
  free_agent: "free_agent",
  agency: "agency",
  agent: "agent",
  admin: "admin",
} as const;


export const AuthProvider = createEnum([  // type de login
  "local",
  "google",
]);
export type AuthProvider = typeof AuthProvider.type;
export const AUTH_PROVIDERS = AuthProvider.values;
export const AUTH_PROVIDER_ENUM = {
  local: "local",
  google: "google",
} as const;


export const TypeCompte = createEnum([  // type abonnement
  "classique",
  "premium",
]);
export type TypeCompte = typeof TypeCompte.type;
export const TYPE_COMPTES = TypeCompte.values;


export const AccountStatus = createEnum([  // verification de compte
  "unverified",
  "pending",
  "verified",
  "suspended",
  "verifiedPremium",
]);
export type AccountStatus = typeof AccountStatus.type;
export const ACCOUNT_STATUSES = AccountStatus.values;


// PROPERTY
export const PriceType = createEnum([  // type de payement de periode
  "monthly",
  "daily",
  "sale",
]);
export type PriceType = typeof PriceType.type;
export const PRICE_TYPES = PriceType.values;


export const PropertyType = createEnum([  // type de bien a louer
  "apartment",
  "house",
  "studio",
  "villa",
  "duplex",
  "land",
  "office",
  "shop",
  "building",
  "cleaning",
]);
export type PropertyType = typeof PropertyType.type;
export const PROPERTY_TYPES = PropertyType.values;


export const OfferType = createEnum([  // type offre louer, vente ..
  "rent",
  "sale",
  "furnished",
]);
export type OfferType = typeof OfferType.type;
export const OFFER_TYPES = OfferType.values;


export const PropertyVisitType = createEnum([  // presentation du bien a distance ou en personne
  "in_person",
  "remote",
  "both",
]);
export type PropertyVisitType = typeof PropertyVisitType.type;
export const PROPERTY_VISIT_TYPES = PropertyVisitType.values;


export const Amenity = createEnum([  // Une propriété peut avoir plusieurs équipements
  "pool",
  "elevator",
  "parking",
  "gym",
  "garden",
  "security",
  "water",
  "borehole",
]);
export type Amenity = typeof Amenity.type;
export const AMENITIES = Amenity.values;


// RESERVATION
export const ReservationStatus = createEnum([  // etat de la reservation
  "pending",
  "confirmed",
  "cancelled",
]);
export type ReservationStatus = typeof ReservationStatus.type;
export const RESERVATION_STATUSES = ReservationStatus.values;


export const ReservationVisitType = createEnum([ 
  "in_person",
  "remote",
]);
export type ReservationVisitType = typeof ReservationVisitType.type;
export const RESERVATION_VISIT_TYPES = ReservationVisitType.values;


export const RecurrenceType = createEnum([  // type de recurrence semaine ou mois
  "weekly",
  "monthly",
]);
export type RecurrenceType = typeof RecurrenceType.type;
export const RECURRENCE_TYPES = RecurrenceType.values;


export const WeekDay = createEnum([  // semaine
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
]);
export type WeekDay = typeof WeekDay.type;
export const WEEK_DAYS = WeekDay.values;



// DEPENSES
export const ExpenseType = createEnum([  // forme de depenses
  "maintenance",
  "repair",
  "insurance",
  "transport",
  "other",
]);
export type ExpenseType = typeof ExpenseType.type;
export const EXPENSE_TYPES = ExpenseType.values;