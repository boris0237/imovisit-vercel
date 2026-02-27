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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { mockProperties } from '@/data/mock';
import UpdateProfileForm from '@/forms/updateRegister';
import { useEffect, useState } from "react";
import { useAuth } from '@/contexts/AuthContext';
import Modal from '@/components/ui/modal';
import Step1GeneralInfo from "@/components/modal/steps/Step1GeneralInfo";
import Step2Location from "@/components/modal/steps/Step2Location";
import Step3Features from "@/components/modal/steps/Step3Features";
import Step4Media from "@/components/modal/steps/Step4Media";
import Step5Success from '@/components/modal/steps/Step5Success';
import { useRouter } from 'next/navigation';
import { PropertyFormData } from '@/types/index';

const stats = [
  { title: 'Biens total', value: '4', icon: Building2, color: 'bg-slate-100 text-slate-600' },
  { title: 'Biens à louer', value: '02', icon: KeyRound, color: 'bg-emerald-100 text-emerald-600' },
  { title: 'Biens à vendre', value: '01', icon: Tag, color: 'bg-amber-100 text-amber-600' },
  { title: 'Biens meublés', value: '01', icon: Sofa, color: 'bg-indigo-100 text-indigo-600' },
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


export default function Dashboard() {
  const updateFormData = (values: Partial<PropertyFormData>) => {
    setFormData((prev: any) => ({ ...prev, ...values }));
  };
  
  const [formData, setFormData] = useState<PropertyFormData>({
  type: "",
  offerType: '',
  title: "",
  description: "",
});
  const router = useRouter();
  const [step, setStep] = useState(1);
  const nextStep = () => setStep((s) => Math.min(s + 1, 5));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showAddPropertyModal, setShowAddPropertyModal] = useState(false);
  const { user } = useAuth();
  
   const resetForm = () => {
  setFormData(initialFormData);
  setStep(1);
  };


  useEffect(() => {
    if (user) {
      const createdAt = new Date(user.createdAt).getTime();
      const updatedAt = new Date(user.updatedAt).getTime();
      console.log(user)

      
      if (user?.role === 'owner') {
        setShowUpdateModal(true);
        console.log('role', user.role)
      }
    }
  }, [user]);
  
function onFinish() {
  console.log("DATA FINAL", formData);
  setShowAddPropertyModal(false);
  setStep(1);
}
 
const initialFormData = {
  type: "",
  offerType: "",
  title: "",
  description: "",
  surface: undefined,
  rooms: undefined,
  bathrooms: undefined,
  amenities: [],
  price: undefined,
  visitFee: undefined,
  images: [],
};



  return (
    <>
      <header className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Mes biens immobiliers</h1>
            <p className="text-sm text-slate-500">
              Gérez vos annonces, suivez les performances et planifiez vos visites
            </p>
          </div>
      
            <Button 
                onClick={() => setShowAddPropertyModal(true)} 
                className="bg-slate-900 hover:bg-slate-800 gap-2">
                <Plus className="w-4 h-4" />
                Ajouter un bien
            </Button>
          
        </div>
      </header>

      <div className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <Card key={stat.title} className="border-slate-200">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">{stat.title}</p>
                    <p className="text-lg font-semibold text-slate-900">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-800 mb-3">Vue d'ensemble</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-slate-200">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <Eye className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Vues totales</p>
                    <p className="text-lg font-semibold text-slate-900">469</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-slate-200">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center">
                    <Heart className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Favoris reçus</p>
                    <p className="text-lg font-semibold text-slate-900">44</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Rechercher un bien..."
                className="pl-9 bg-white border-slate-200"
              />
            </div>
            <div className="flex gap-3">
              <Select>
                <SelectTrigger className="w-44 bg-white border-slate-200">
                  <SelectValue placeholder="Tous les types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="apartment">Appartement</SelectItem>
                  <SelectItem value="villa">Villa</SelectItem>
                  <SelectItem value="studio">Studio</SelectItem>
                  <SelectItem value="office">Bureau</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-44 bg-white border-slate-200">
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="available">Disponible</SelectItem>
                  <SelectItem value="unavailable">Indisponible</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {mockProperties.slice(0, 6).map((property) => {
              const offer = offerLabels[property.offerType] ?? offerLabels.rent;
              return (
                <Card key={property.id} className="border-slate-200 overflow-hidden">
                  <div className="relative">
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="w-full h-44 object-cover"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <Badge className={`${offer.className} border-0`}>{offer.label}</Badge>
                      <Badge className="bg-slate-900 text-white border-0">
                        {typeLabels[property.type] ?? 'Bien'}
                      </Badge>
                    </div>
                    <div className="absolute top-3 right-3 flex items-center gap-2">
                      <Button size="icon" variant="secondary" className="h-8 w-8 bg-white/90 hover:bg-white">
                        <Edit className="w-4 h-4 text-slate-700" />
                      </Button>
                      <Button size="icon" variant="secondary" className="h-8 w-8 bg-white/90 hover:bg-white">
                        <Trash className="w-4 h-4 text-slate-700" />
                      </Button>
                    </div>
                    <div className="absolute bottom-3 left-3 bg-white/90 text-slate-900 text-xs font-semibold px-2.5 py-1 rounded-lg">
                      {property.price.toLocaleString('fr-FR')} F/mois
                    </div>
                  </div>
                  <CardContent className="p-5 space-y-4">
                    <div>
                      <h3 className="font-semibold text-slate-900 leading-snug">{property.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>
                          {property.neighborhood}, {property.city}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <div className="flex items-center gap-1">
                        <BedDouble className="w-4 h-4" />
                        <span>{property.bedrooms ?? 1}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Bath className="w-4 h-4" />
                        <span>{property.bathrooms ?? 1}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Ruler className="w-4 h-4" />
                        <span>{property.surface} m²</span>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          <span>{property.views}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{property.visitsCount}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">
                          {property.isAvailable ? 'Actif' : 'Inactif'}
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <Input
                            type="checkbox"
                            defaultChecked={property.isAvailable}
                            className="sr-only peer"
                          />
                          <div className="relative w-9 h-5 bg-slate-200 rounded-full peer peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:h-4 after:w-4 after:rounded-full after:transition-transform peer-checked:after:translate-x-4" />
                        </label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
        
      <Modal 
        isOpen={showUpdateModal} 
        onClose={() => setShowUpdateModal(false)}
        title="Finalisez votre profil professionnel"
        size="full"  
        rounded={false}     
        locked={true}
        showBlur={true} 
        closeOnClickOutside={false} 
      >
        <UpdateProfileForm /> 
      </Modal>

      <Modal
  isOpen={showAddPropertyModal}
  onClose={() => setShowAddPropertyModal(false)}
  title="Ajouter un bien"
  size="lg"
  rounded={false}
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
  onFinish={() => {
    resetForm();
    setShowAddPropertyModal(false);
  }}/>
  )}

</Modal>
      </div>
    </>
  );
}