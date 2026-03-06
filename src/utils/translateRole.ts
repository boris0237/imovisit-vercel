export const translateRole = (
  role: string,
  dictionary: any
) => {
  switch (role) {
    case "visitor":
      return dictionary?.profil?.visitor || "Visiteur";

    case "owner":
      return dictionary?.profil?.owner || "Propriétaire";

    case "prospector":
      return dictionary?.profil?.prospector || "Prestataire";

    case "agency":
      return dictionary?.profil?.agency || "Agence";

    case "agent":
      return dictionary?.profil?.agent || "Agent";

    case "property_manager":
      return dictionary?.profil?.property_manager || "Gestionnaire de biens";

    case "admin":
      return dictionary?.profil?.admin || "Administrateur";

    default:
      return dictionary?.defaultRole || "Pas de rôle";
  }
};