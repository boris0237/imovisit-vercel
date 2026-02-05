import { sign } from "crypto";
import { title } from "process";

// dictionaries/en.ts
export default {
  header: {
    connexion: "Login",
    inscrire: "Sign up",
    subtitle: "Making property visits will be more easy",
    myaccount: "Account",
    accueil: "Home",
    recherche: "Search",
    favoris: "Favorites"
  },
  footer: {
    title1: "Company",
    title2: "Support",
    title3: "Legal",
    rights: "Imovisit. All rights reserved.",
    bio: "Cameroon's leading platform for real estate tours. Find your dream property confidently.",
    text: "Follow us :",
    translateLabel11: "About",
    translateLabel12: "How it works",
    translateLabel13: "Careers",
    translateLabel14: "Blog",
    translateLabel21: "Help",
    translateLabel22: "Contact",
    translateLabel23: "FAQ",
    translateLabel24: "Report",
    translateLabel31: "Terms",
    translateLabel32: "Privacy",
    translateLabel33: "Cookies",
    translateLabel34: "Legal",
  },
  signup: {
    title: "Create an account",
    subtitle: "Join Imovisit community.",
    visteur: "Visitor",
    visiteurBio: "I'm looking for a property",
    proprietaireBio: "I publish my properties",
    proprietaire: "Owner",
    name: "Full Name",
    placeholderEmail: "Enter your email address",
    tel: "Phone Number",
    ville: "City",
    dropCity: "Select your city",
    password: "Password",
    confirmPassword: "Confirm Password",
    agree: "I agree to the ",
    terms: "terms",
    and: "and",
    conditions:"conditions",
    submit: "Create my account",
    haveAccount: "Already have an account? ",
    login: "Login",
    rights: "Imovisit. All rights reserved."
  },

} as const
