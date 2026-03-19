// src/services/apiConfig.ts

/**
 * Classe d'erreur personnalisée pour gérer les erreurs de notre API
 * Cela permet de récupérer facilement le code d'erreur (ex: 401, 404) dans nos composants
 */
export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

/**
 * Fonction "Wrapper" autour de fetch.
 * Elle centralise la logique de nos appels API.
 */
export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  // 1. Détecter si on envoie des fichiers (FormData)
  const isFormData = options.body instanceof FormData;

  // 2. Préparer les en-têtes (Headers)
  const headers = new Headers(options.headers);

  // Si on n'envoie PAS de fichiers, on dit au backend qu'on lui parle en JSON
  // (Si c'est un FormData, le navigateur gérera le Content-Type tout seul)
  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  // Ajouter le token si disponible (fallback localStorage)
  if (!headers.has("Authorization") && typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  // 3. Exécuter la requête
  // Note : Les cookies HttpOnly (comme notre jwt) sont envoyés automatiquement 
  // par le navigateur car nous sommes sur le même domaine.
  const response = await fetch(endpoint, {
    ...options,
    headers,
    credentials: "include",
  });

  // 4. Parser la réponse en JSON
  let responseData;
  try {
    responseData = await response.json();
  } catch (err) {
    responseData = null; // Gère les cas où l'API ne renvoie rien (ex: code 204)
  }

  // 5. Gérer les erreurs proprement
  if (!response.ok) {
    // On extrait le message d'erreur de votre API (ex: "Mot de passe incorrect")
    const errorMessage = responseData?.message || "Une erreur inattendue est survenue.";
    throw new ApiError(errorMessage, response.status, responseData);
  }

  // 6. Si tout va bien, on retourne les données
  return responseData;
}
