import { Search, Calendar, Home, Shield } from 'lucide-react';

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

export function HowItWorks() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-imo-primary mb-4">
            Comment ça marche ?
          </h2>
          <p className="text-gray-600">
            Trouvez votre bien idéal en 4 étapes simples. Notre plateforme 
            vous accompagne tout au long de votre recherche.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[60%] w-full h-0.5 bg-gray-200" />
              )}

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
