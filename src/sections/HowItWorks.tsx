"use client"

import { Search, Calendar, Home, Shield } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDictionary } from '@/hooks/useDictionary'

const steps = [
  {
    icon: Search,
    title: 'Recherchez',
    description: 'Parcourez notre catalogue de biens immobiliers vérifiés. Filtrez par ville, type, prix et plus encore.',
    color: 'bg-blue-500',
  },
  {
    icon: Calendar,
    title: 'Réservez une visite',
    description: 'Choisissez un créneau horaire qui vous convient. Visite en présentiel ou à distance par vidéo.',
    color: 'bg-green-500',
  },
  {
    icon: Home,
    title: 'Visitez',
    description: 'Rencontrez le propriétaire et visitez le bien. Posez toutes vos questions en direct.',
    color: 'bg-orange-500',
  },
  {
    icon: Shield,
    title: 'Sécurisez',
    description: 'Tous nos bailleurs sont vérifiés. Signalez tout problème pour une communauté de confiance.',
    color: 'bg-purple-500',
  },
];

const languages = [
    { code: 'fr', name: 'Français', flag: "FR" },
    { code: 'en', name: 'English', flag: "EN" },
  ];

export function HowItWorks() {
  const { dictionary } = useDictionary()

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-imo-primary mb-4">
            {dictionary.howitworks?.title || "Comment ça marche ?"}
          </h2>
          <p className="text-gray-600"> 
            {dictionary.howitworks?.description || "Trouvez votre bien idéal en 4 étapes simples. Notre plateforme vous accompagne tout au long de votre recherche."}
          </p>
        </div>

        {/* Steps */}
        {dictionary.howitworks?.step1 && (
          steps[0].title = dictionary.howitworks.step1.title1,
          steps[0].description = dictionary.howitworks.step1.description1)}

        {dictionary.howitworks?.step2 && (
          steps[1].title = dictionary.howitworks.step2.title2,
          steps[1].description = dictionary.howitworks.step2.description2)}

        {dictionary.howitworks?.step3 && (
          steps[2].title = dictionary.howitworks.step3.title3,
          steps[2].description = dictionary.howitworks.step3.description3)}
          
        {dictionary.howitworks?.step4 && (
          steps[3].title = dictionary.howitworks.step4.title4,
          steps[3].description = dictionary.howitworks.step4.description4)}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="text-center">
                {/* Icon */}
                <div className={`w-24 h-24 ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg transform hover:scale-105 transition-transform`}>
                  <step.icon className="w-12 h-12 text-white" />
                </div>

                {/* Step Number */}
                <div className="inline-flex items-center justify-center w-8 h-8 bg-imo-primary text-white rounded-full text-sm font-bold mb-4">
                  {index + 1}
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-imo-primary mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
