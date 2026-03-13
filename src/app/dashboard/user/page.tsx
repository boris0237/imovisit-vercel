"use client"

import {
  Building2,
  Calendar,
  Plus,
  MapPin,
  BedDouble,
  Bath,
  Ruler,
  Search,
  KeyRound,
  Tag,
  Sofa,
  Eye,
  Heart,
  Edit,
  Trash,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockProperties } from '@/data/mock';
import { useEffect, useState } from "react";
import { useAuth } from '@/contexts/AuthContext';
import Modal from '@/components/ui/modal';
import LanguageDropdown from '@/components/LanguageDropdown';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDictionary } from '@/hooks/useDictionary';
import Step1GeneralInfo from '@/components/modal/steps/Step1GeneralInfo';
import Step2Location from '@/components/modal/steps/Step2Location';
import Step3Features from '@/components/modal/steps/Step3Features';
import Step4Media from '@/components/modal/steps/Step4Media';
import Step5Success from '@/components/modal/steps/Step5Success';
import type { PropertyData, PropertyFormData } from '@/types/index';

export default function Dashboard() {

  const { language, setLanguage } = useLanguage()
  const { dictionary } = useDictionary()

  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showAddPropertyModal, setShowAddPropertyModal] = useState(false);
  const [step, setStep] = useState(1);

  const { user } = useAuth();

  const [loading, setLoading] = useState(false) // FIX loading

  const nextStep = () => setStep(prev => prev + 1)
  const prevStep = () => setStep(prev => prev - 1)

  const stats = [
    { title: dictionary.dashboard?.stats1 || "Total Properties", value: '4', icon: Building2, color: 'bg-slate-100 text-slate-600' },
    { title: dictionary.dashboard?.stats2 || "Properties for Rent", value: '02', icon: KeyRound, color: 'bg-emerald-100 text-emerald-600' },
    { title: dictionary.dashboard?.stats3 || "Properties for Sale", value: '01', icon: Tag, color: 'bg-amber-100 text-amber-600' },
    { title: dictionary.dashboard?.stats4 || "Furnished Properties", value: '01', icon: Sofa, color: 'bg-indigo-100 text-indigo-600' },
  ];

  const typeLabels: Record<string, string> = {
    apartment: 'Appartement',
    villa: 'Villa',
    studio: 'Studio',
    duplex: 'Duplex',
    office: 'Bureau',
    land: 'Terrain',
    house: 'Maison',
    shop: 'Boutique',
  };

  const offerLabels: Record<string, { label: string; className: string }> = {
    rent: { label: 'Location', className: 'bg-blue-100 text-blue-700' },
    sale: { label: 'A vendre', className: 'bg-amber-100 text-amber-700' },
    furnished: { label: 'Meublé', className: 'bg-emerald-100 text-emerald-700' },
  };

  useEffect(() => {

    if (user?.role === "owner") {
      setShowUpdateModal(true)
    }

  }, [user])

  const initialFormData: PropertyFormData = {
    type: "",
    title: "",
    description: "",
    priceType: "vente",
    amenities: [],
    price: undefined,
    images: [],
    city: "",
    neighborhood: "",
    data: '',
    updateData: '',
    next: false,
    prev: false,
    offerType: 'vente',
    bedrooms: 0,
    visitType: 'gratuit',
    isAvailable: false,
    surface: 0,
    rooms: 0,
    bathrooms: 0,
    country: undefined,
    district: undefined,
    address: undefined
  }

  const [formData, setFormData] = useState<PropertyFormData>(initialFormData)

  const updateFormData = (values: Partial<PropertyFormData>) => {
    setFormData(prev => ({ ...prev, ...values }))
  }

  const resetForm = () => {
    setFormData(initialFormData)
    setStep(1)
  }

  async function createProperty() {

  try {

    if (loading) return 

    if (!formData.title || !formData.price || !formData.city) {
      alert("Veuillez remplir les champs obligatoires")
      return
    }

    setLoading(true)

    // récupération du token
    const token = localStorage.getItem("token")

    if (!token) {
      alert("Utilisateur non authentifié")
      return
    }

    const form = new FormData()

    Object.entries(formData).forEach(([key, value]) => {

      // gestion images
      if (key === "images") {

        (value as File[]).forEach((file) => {
          form.append("images", file)
        })

      }

      // gestion tableaux
      else if (Array.isArray(value)) {

        value.forEach(v => form.append(key, String(v)))

      }

      else if (value !== undefined && value !== null) {

        form.append(key, String(value))

      }

    })

    const response = await fetch("/api/biens", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: form
    })

    if (!response.ok) {
  const errorData = await response.json()
  throw new Error(errorData.message || "Erreur serveur")
}

    const data = await response.json()

    console.log("PROPERTY CREATED", data)

    resetForm()
    setShowAddPropertyModal(false)

  } catch (error) {

    console.error("Erreur création bien", error)
    alert("Erreur lors de la création du bien")

  } finally {

    setLoading(false)

  }

}

  return (
    <>

      {/* HEADER */}

      <header className="bg-slate-50 border-b border-slate-200">

        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">

          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              {dictionary.dashboard?.title1 || "Mes biens immobiliers"}
            </h1>

            <p className="text-sm text-slate-500">
              {dictionary.dashboard?.subTitle1 || "Gérez vos annonces"}
            </p>
          </div>

          <div className='flex flex-row items-center space-x-8'>

            <Button
                onClick={() => {
                resetForm();
                setShowAddPropertyModal(true);
              }}
            >

              <Plus className="w-4 h-4" />
              Ajouter un bien

            </Button>

            <LanguageDropdown
              currentLanguage={language}
              onLanguageChange={setLanguage}
            />

          </div>

        </div>

      </header>

      {/* LISTE DES PROPRIETES */}

      <div className="flex-1 overflow-auto">

        <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

            {mockProperties.slice(0, 6).map((property) => {

              const offer = offerLabels[property.offerType] ?? offerLabels.rent

              return (

                <Card key={property.id} className="border-slate-200 overflow-hidden">

                  <div className="relative">

                    <img
                      src={typeof property.images[0] === 'string'
                        ? property.images[0]
                        : URL.createObjectURL(property.images[0])}
                      alt={property.title}
                      className="w-full h-44 object-cover"
                    />

                    <div className="absolute top-3 left-3 flex gap-2">

                      <Badge className={`${offer.className} border-0`}>
                        {offer.label}
                      </Badge>

                      <Badge className="bg-slate-900 text-white border-0">
                        {typeLabels[property.type] ?? 'Bien'}
                      </Badge>

                    </div>

                    <div className="absolute bottom-3 left-3 bg-white text-xs font-semibold px-2 py-1 rounded">

                      {property.price.toLocaleString('fr-FR')} F/mois

                    </div>

                  </div>

                </Card>

              )

            })}

          </div>

        </div>

      </div>

      {/* MODAL AJOUT BIEN */}

      <Modal
        isOpen={showAddPropertyModal}
        onClose={() => setShowAddPropertyModal(false)}
        title="Ajouter un bien"
        size="lg"
      >

        {step === 1 && (
          <Step1GeneralInfo
            data={formData}
            updateData={updateFormData}
            next={nextStep}
            prev={prevStep}
          />
        )}

        {step === 2 && (
          <Step2Location
            data={formData}
            updateData={updateFormData}
            next={nextStep}
            prev={prevStep}
          />
        )}

        {step === 3 && (
          <Step3Features
            data={formData}
            updateData={updateFormData}
            next={nextStep}
            prev={prevStep}
          />
        )}

        {step === 4 && (
          <Step4Media
            data={formData}
            updateData={updateFormData}
            next={nextStep}
            prev={prevStep}
          />
        )}

        {step === 5 && (

          <Step5Success
            data={formData}
            onFinish={createProperty} 
          />

        )}

      </Modal>

    </>
  )
}