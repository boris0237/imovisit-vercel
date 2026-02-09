import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Hero } from '@/lib/Hero';
import { FeaturedProperties } from '@/sections/FeaturedProperties';
import { HowItWorks } from '@/sections/HowItWorks';
import { OwnerCTA } from '@/sections/OwnerCTA';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <FeaturedProperties />
        <OwnerCTA />
      </main>
      <Footer />
    </div>
  );
}
