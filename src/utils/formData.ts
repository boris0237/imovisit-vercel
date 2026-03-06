// src/utils/formData.ts

/**
 * Convertit un objet JavaScript classique en FormData robuste.
 * Gère intelligemment les fichiers, les dates, les tableaux et les booléens.
 */
export const createFormData = (data: Record<string, any>): FormData => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    // 1. Ignorer les valeurs nulles, indéfinies ou les chaînes vides
    if (value === null || value === undefined || value === "") return;

    // 2. Gestion des tableaux (ex: array de fichiers justificatifs)
    if (Array.isArray(value)) {
      value.forEach((item) => {
        // Si l'item est un objet standard (non-fichier), on le stringify
        if (typeof item === 'object' && !(item instanceof File) && !(item instanceof Blob)) {
          formData.append(key, JSON.stringify(item));
        } else {
          formData.append(key, item);
        }
      });
    }
    // 3. Gestion des Dates (conversion au format ISO pour le backend)
    else if (value instanceof Date) {
      formData.append(key, value.toISOString());
    }
    // 4. Gestion des Fichiers purs (File ou Blob)
    else if (value instanceof File || value instanceof Blob) {
      formData.append(key, value);
    }
    // 5. Gestion des booléens et nombres (conversion stricte en texte)
    else if (typeof value === 'boolean' || typeof value === 'number') {
      formData.append(key, String(value));
    }
    // 6. Gestion des objets imbriqués (ex: { rue: "123", ville: "Paris" })
    else if (typeof value === 'object') {
      formData.append(key, JSON.stringify(value));
    }
    // 7. Chaînes de caractères classiques
    else {
      formData.append(key, value);
    }
  });

  return formData;
};