import Link from 'next/link'
import { Building2, TrendingUp, Users, Shield, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const benefits = [
  'Publication gratuite de vos biens',
  'Gestion simplifiée des visites',
  'Calendrier de disponibilité intégré',
  'Paiements sécurisés',
  'Suivi des loyers et reçus',
  'Support client dédié',
];

export function OwnerCTA() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-imo-primary to-imo-secondary">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-white">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Building2 className="w-4 h-4" />
              <span className="text-sm">Espace propriétaire</span>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Vous êtes propriétaire ?
            </h2>

            <p className="text-white/80 text-lg mb-8">
              Publiez vos biens gratuitement et gérez vos visites en toute simplicité. 
              Rejoignez des milliers de propriétaires qui nous font confiance.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-imo-highlight rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-imo-primary" />
                  </div>
                  <span className="text-white/90 text-sm">{benefit}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/register?type=owner">
                <Button className="bg-imo-highlight hover:bg-yellow-400 text-imo-primary font-semibold gap-2">
                  Devenir propriétaire
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/owner-info">
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 gap-2">
                  En savoir plus
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-white">
              <TrendingUp className="w-10 h-10 mb-4 text-imo-highlight" />
              <div className="text-3xl font-bold mb-1">+45%</div>
              <div className="text-white/70 text-sm">Taux de conversion moyen</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-white">
              <Users className="w-10 h-10 mb-4 text-imo-highlight" />
              <div className="text-3xl font-bold mb-1">5,000+</div>
              <div className="text-white/70 text-sm">Propriétaires actifs</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-white">
              <Shield className="w-10 h-10 mb-4 text-imo-highlight" />
              <div className="text-3xl font-bold mb-1">100%</div>
              <div className="text-white/70 text-sm">Bailleurs vérifiés</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-white">
              <Building2 className="w-10 h-10 mb-4 text-imo-highlight" />
              <div className="text-3xl font-bold mb-1">10,000+</div>
              <div className="text-white/70 text-sm">Biens publiés</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
