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
              <span className="text-sm">Espace Bailleur</span>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Que vous soyez un proporiétaire, un agent, une agence immobilière, un gestionnaire de bien
            </h2>

            <p className="text-white/80 text-lg mb-8">
              La solution imovisit vous accompagne au quotidien en augmentant vos revenu et en professionnalisant vos activités immobilières.
              <br />
              Ajoutez vos biens gratuitement et gérer vos visites en toute simplicité. <br /> Rejoignez des milliers de bailleurs qui nous font confiance. 
              <br /><br />
              Inscrivez vous gratuitement en cliquant ici:
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/register?type=owner">
                <Button className="bg-imo-highlight hover:bg-yellow-400 text-imo-primary font-semibold gap-2">
                  Je suis un bailleur
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
          
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-white">
              <Users className="w-10 h-10 mb-4 text-imo-highlight" />
              <div className="text-3xl font-bold mb-1">100+</div>
              <div className="text-white/70 text-sm">bailleurs actifs </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-white">
              <Building2 className="w-10 h-10 mb-4 text-imo-highlight" />
              <div className="text-3xl font-bold mb-1">200+</div>
              <div className="text-white/70 text-sm">biens publiés</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-white">
              <TrendingUp className="w-10 h-10 mb-4 text-imo-highlight" />
              <div className="text-3xl font-bold mb-1">500+</div>
              <div className="text-white/70 text-sm">visites réalisées</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-white">
              <Users className="w-10 h-10 mb-4 text-imo-highlight" />
              <div className="text-3xl font-bold mb-1">150+</div>
              <div className="text-white/70 text-sm">locataires</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
