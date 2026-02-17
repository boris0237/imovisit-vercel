//i18n.js

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  resources: {
    en: {
        translation: {
            nav: { connexion: 'Login', inscription: 'Sign Up' },
            home: { welcome: 'Welcome to our website!' },
            about: { title: 'About Us', content: 'We are a company that values...' },
            hero: { title: 'Discover Our Services', description: 'We offer a wide range of services to meet your needs.' },
            contact: { title: 'Contact Us', description: 'Feel free to reach out to us for any inquiries.' },
            footer: { rights: 'All rights reserved.' }
        }
    },
    fr: {
        translation: {
            nav: { connexion: 'Connexion', inscription: 'Inscription' },
            home: { welcome: 'Bienvenue sur notre site!' },
            about: { title: 'À propos de nous', content: 'Nous sommes une entreprise qui valorise...' },
            hero: { title: 'Découvrez nos services', description: 'Nous offrons une large gamme de services pour répondre à vos besoins.' },
            contact: { title: 'Contactez-nous', description: 'N\'hésitez pas à nous contacter pour toute question.' },
            footer: { rights: 'Tous droits réservés.' }
        }
    }
    },
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
        escapeValue: false
    }
});