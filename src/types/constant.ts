// pour le nom des dossier cloud
export const UPLOAD_FOLDERS = {
  AVATAR: "avatars",
  DOCUMENT: "documents",
  IMAGE: "images",
} as const;

// Définir les champs autorisés par rôle pour les modification 
export const ROLE_ALLOWED_FIELDS = {
  visitor: [
    "name",
    "age",
    "phone",
    "city",
    "country",
    "profession",
    "avatar",
    "companyLogo",
    "country",
  ],

  owner: [
    "name",
    "age",
    "phone",
    "city",
    "avatar",
    "country",
    "profession",
    "services",
    "docCNI",
    "docDiplome",
    "docContribuable",
    "docRCCM",
    "docJust",
    "companyName",
    "role",
    "companyLogo",
    "country"
  ],

  property_manager: [
    "name",
    "age",
    "companyLogo",
    "phone",
    "avatar",
    "city",
    "country",
    "services",
    "docJust",
    "phone",
    "city",
    "avatar",
    "country",
    "services",
    "docCNI",
  ],

  prospector: [
    "name",
    "age",
    "phone",
    "avatar",
    "profession",
    "city",
    "country",
    "services",
    "docJust",
    "docCNI",
  ],

  agency: [
    "name",
    "phone",
    "city",
    "avatar",
    "country",
    "services",
    "docRCCM",
    "docContribuable",
    "companyName",
    "companyLogo"
  ],

  agent: [
    "name",
    "age",
    "phone",
    "avatar",
    "profession",
    "city",
    "country",
    "services",
    "docCNI",
  ],

  admin: [
    "name",
    "age",
    "phone",
    "avatar",
    "city",
    "country",
    "profession",
    "services",
    "docJust",
    "docCNI",
    "docDiplome",
    "docContribuable",
    "docRCCM",
    "companyName",
    "companyLogo",
    "typeCompte"
  ]
} as const;
