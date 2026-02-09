"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PropertyCard } from "@/components/PropertyCard";
import { mockProperties } from "@/data/mock";

export function FeaturedProperties() {
  const featuredProperties = mockProperties.slice(0, 6);

  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <br />
            <br />
            <h2 className="text-3xl md:text-4xl font-bold text-imo-primary mb-3">
              Bien en Location
            </h2>
            <p className="text-gray-600 max-w-xl">
              Parcourez la liste des biens immobiliers disponibles pour une{" "}
              <br /> location longue durée
            </p>
          </div>
          <Link href="/search">
            <Button
              variant="outline"
              className="gap-2 border-imo-primary text-imo-primary hover:bg-imo-primary hover:text-white"
              style={{ marginLeft: 30 }}
            >
              Voir tous
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
        <br />
        {/* Navigation Buttons */}
        <div className="flex justify-end mb-6 gap-2">
          <Button className="prev-btn-location bg-imo-primary w-12 h-12 rounded-full text-white">
            <ArrowLeft className="w-4 h-4" />
          </Button>

          <Button className="next-btn-location bg-imo-primary w-12 h-12 rounded-full text-white">
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>


        {/* Properties Grid */}
        <Swiper
          modules={[Navigation]}
          spaceBetween={24}
          slidesPerView={1}
          navigation={{
            prevEl: ".prev-btn-location",
            nextEl: ".next-btn-location",
          }}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
        >
          {featuredProperties.map((property) => (
            <SwiperSlide key={property.id}>
              <PropertyCard property={property} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <br />
            <br />
            <h2 className="text-3xl md:text-4xl font-bold text-imo-primary mb-3">
              Bien en vente
            </h2>
            <p className="text-gray-600 max-w-xl">
              Parcourez la liste des biens immobiliers disponibles à la <br />{" "}
              vente
            </p>
          </div>
          <Link href="/search">
            <Button
              variant="outline"
              className="gap-2 border-imo-primary text-imo-primary hover:bg-imo-primary hover:text-white"
              style={{ marginLeft: 30 }}
            >
              Voir tous
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
        <br />
        {/* Navigation Buttons */}
        <div className="flex justify-end mb-6 gap-2">
          <Button className="prev-btn-vente bg-imo-primary w-12 h-12 rounded-full text-white">
            <ArrowLeft className="w-4 h-4" />
          </Button>

          <Button className="next-btn-vente bg-imo-primary w-12 h-12 rounded-full text-white">
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>


        {/* Properties Grid */}
        <Swiper
          modules={[Navigation]}
          spaceBetween={24}
          slidesPerView={1}
          navigation={{
            prevEl: ".prev-btn-vente",
            nextEl: ".next-btn-vente",
          }}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
        >
          {featuredProperties.map((property) => (
            <SwiperSlide key={property.id}>
              <PropertyCard property={property} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <br />
            <br />
            <h2 className="text-3xl md:text-4xl font-bold text-imo-primary mb-3">
              Bien meublés
            </h2>
            <p className="text-gray-600 max-w-xl">
              Parcourez la liste des biens immobiliers disponibles pour une{" "}
              <br /> location courte durée
            </p>
          </div>
          <Link href="/search">
            <Button
              variant="outline"
              className="gap-2 border-imo-primary text-imo-primary hover:bg-imo-primary hover:text-white"
              style={{ marginLeft: 30 }}
            >
              Voir tous
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
        <br />
        {/* Navigation Buttons */}
        <div className="flex justify-end mb-6 gap-2">
          <Button className="prev-btn-meub bg-imo-primary w-12 h-12 rounded-full text-white">
            <ArrowLeft className="w-4 h-4" />
          </Button>

          <Button className="next-btn-meub bg-imo-primary w-12 h-12 rounded-full text-white">
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>


        {/* Properties Grid */}
        <Swiper
          modules={[Navigation]}
          spaceBetween={24}
          slidesPerView={1}
          navigation={{
            prevEl: ".prev-btn-meub",
            nextEl: ".next-btn-meub",
          }}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
        >
          {featuredProperties.map((property) => (
            <SwiperSlide key={property.id}>
              <PropertyCard property={property} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <br />
            <br />
            <h2 className="text-3xl md:text-4xl font-bold text-imo-primary mb-3">
              Evènements
            </h2>
            <p className="text-gray-600 max-w-xl">
              Assister à nos évènements afin d'intégrer notre communauté <br />{" "}
              et de recevoir un accompagnement
            </p>
          </div>
          <Link href="/search">
            <Button
              variant="outline"
              className="gap-2 border-imo-primary text-imo-primary hover:bg-imo-primary hover:text-white"
              style={{ marginLeft: 30 }}
            >
              Voir tous
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
        <br />
        {/* Navigation Buttons */}
        <div className="flex justify-end mb-6 gap-2">
          <Button className="prev-btn-events bg-imo-primary w-12 h-12 rounded-full text-white">
            <ArrowLeft className="w-4 h-4" />
           </Button>

           <Button className="next-btn-events bg-imo-primary w-12 h-12 rounded-full text-white">
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>


        {/* Properties Grid */}
        <Swiper
          modules={[Navigation]}
          spaceBetween={24}
          slidesPerView={1}
          navigation={{
            prevEl: ".prev-btn-events",
            nextEl: ".next-btn-events",
          }}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
        >
          {featuredProperties.map((property) => (
            <SwiperSlide key={property.id}>
              <PropertyCard property={property} />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Vous ne trouvez pas ce que vous cherchez ?
          </p>
          <Link href="/search">
            <Button className="bg-imo-primary hover:bg-imo-secondary gap-2">
              Explorer tous les biens
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
