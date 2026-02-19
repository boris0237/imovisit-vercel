import { offerTypes } from "@/data/mock";
import { Title } from "@radix-ui/react-dialog";

// dictionaries/fr.ts
export default {
  navigation: {
    about: "À propos",
    contact: "Contact",
    services: "Services"
  },
  header: {
    Connexion: "Connexion",
    welcome: "Bienvenue",
    logout: "Se déconnecter",
    login: "Se connecter"
  },
  footer: {
    rights: "Tous droits réservés"
  },
  hero:{
    Platform: "Plateforme #1 des visites immobilières",
    find: "Trouver le",
    property: "bien",
    you: "que",
    want: "vous souhaitez visiter",
    visit: "Visitez de milliers de biens immobiliers en location",
    sales: "Vente ou location meublés à distance ou en présentiel",
    search: "Rechercher",
    popular: "Populaires :",
    offerTypes: "Types d'offres: ",
    propertyTypes: "Types de biens: ",
    city: "Ville",
    tag1: "Appartement Yaoundé",
    tag2: "Villa Douala",
    tag3: "Studio meublé",
    tag4: "Terrain",
    lab1: "Biens disponibles",
    lab2: "Utilisateurs actifs",
    lab3: "Visites réalisées",
    lab4: "Satisfaction client"
  },
  howitworks: {
    title: "Comment ça marche ?",
    descrip: "Trouvez votre bien idéal en 4 étapes simples. Notre plateforme vous accompagne tout au long de votre recherche.",
    step1: {
      title1: "Recherchez",
      description1: "Parcourez notre catalogue de biens immobiliers vérifiés. Filtrez par ville, type, prix et plus encore."
    },
    step2: {
      title2: "Réservez une visite",
      description2: "Choisissez un créneau horaire qui vous convient. Visite en présentiel ou à distance par vidéo."
    },
    step3: {
      title3: "Visitez",
      description3: "Rencontrez le propriétaire et visitez le bien. Posez toutes vos questions en direct."
    },
    step4: {
      title4: "Sécurisez",
      description4: "Tous nos bailleurs sont vérifiés. Signalez tout problème pour une communauté de confiance."
    }
  },
  ownercta:{
    subtitle: "Espace Bailleur",
    title1: "Que vous soyez un proporiétaire, un agent, une agence immobilière, un gestionnaire de bien",
    para1: "La solution imovisit vous accompagne au quotidien en augmentant vos revenu et en professionnalisant vos activités immobilières.",
    para2: "Ajoutez vos biens gratuitement et gérer vos visites en toute simplicité.",
    para3: "Rejoignez des milliers de bailleurs qui nous font confiance.",
    para4: "Inscrivez vous gratuitement en cliquant ici:",
    buttonText: "Je suis un bailleur",
    lab1: "bailleurs actifs",
    lab2: "biens publiés",
    lab3: "visites réalisées",
    lab4: "locataires"
  },
  featuredpropertties: {
    property1: "Bien en Location",
    description1: "Parcourez la liste des biens immobiliers disponibles pour une",
    description2: "location longue durée",
    property2: "Bien en Vente",
    description3: "Parcourez la liste des biens immobiliers disponibles pour une",
    description4: "vente",
    property3: "Bien meublé",
    description5: "Parcourez la liste des biens immobiliers disponibles pour une",
    description6: "location courte durée",
    property4: "Événement",
    description7: "Assister à nos évènements afin d'intégrer notre communauté ",
    description8: "et de recevoir un accompagnement",
    cta: "Vous ne trouvez pas ce que vous cherchez ?",
    cta2: "Contactez-nous pour une assistance personnalisée",
    exploreAll: "Explorer tous les biens",
    seeAll: "Voir tous"
  },
  searchPage: {
    title1: "Rechercher un bien",
    paragraph1: " biens trouvés",
    filterButton: "Filtres",
    title2: "Aucun bien trouvé",
    paragraph2: "Essayez de modifier vos critères de recherche",
    loading: "Chargement..."
  },
  searchFilter:{
    city: "Ville",
    type: "Type de bien",
    offerType: "Type d'offre",
    minPrice: "Prix minimum",
    maxPrice: "Prix maximum",
    rooms: "Nombre de pièces",
    allCities: "Toutes les villes",
    allNeighborhoods: "Tous les quartiers",
    allPropertyTypes: "Tous les types",
    allOfferTypes: "Toutes les offres",
    reset: "Réinitialiser",
    apply: "Appliquer",
    room: "pièce",
    
  }
} as const
