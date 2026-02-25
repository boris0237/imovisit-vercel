"use client";

import CustomModal from "@/components/modal/CustomModal";
import Step1GeneralInfo from "./steps/Step1GeneralInfo";
import Step2Location from "./steps/Step2Location";
import Step3Features from "./steps/Step3Features";
import Step4Media from "./steps/Step4Media";
import Step5Success from "./steps/Step5Success";
import { PropertyFormData } from "./type";
import { useState } from "react"

interface AddPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddPropertyModal({
  isOpen,
  onClose,
}: AddPropertyModalProps) {
  // ---------------------------------------------------------------------------
  // Reset complet du formulaire à chaque ouverture (comportement le plus sûr)
  // ---------------------------------------------------------------------------
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  const [formData, setFormData] = useState<PropertyFormData>({
    type: "",
    // category → on garde le nom que tu utilises vraiment dans Step1
    // Si tu as renommé en offerType dans Step1 → change ici AUSSI
    category: "",             // ou offerType: ""
    title: "",
    description: "",
    country: "Cameroun",
    city: "Yaoundé",
    quarter: "",
    address: "",
    // Valeurs numériques → undefined ou null plutôt que 0
    surface: undefined,
    rooms: undefined,
    bathrooms: undefined,
    amenities: [],
    price: undefined,
    visitFees: undefined,     // ou fraisVisite selon ton nom final
    photos: [],               // idéalement: File[] | { preview: string; file: File }[]
  });

  const updateData = (values: Partial<PropertyFormData>) => {
    setFormData((prev: any) => ({ ...prev, ...values }));
  };

  const next = () => setStep((s) => (s < 5 ? (s + 1) as any : s));
  const prev = () => setStep((s) => (s > 1 ? (s - 1) as any : s));

  const handleSubmit = async () => {
    // Optionnel : mini-validation finale ici si tu veux
    if (!formData.type || !formData.category || !formData.title.trim()) {
      alert("Veuillez compléter les informations essentielles.");
      setStep(1);
      return;
    }

    // -----------------------------------------------------------------------
    // VRAI submit (à remplacer par ton appel API)
    // -----------------------------------------------------------------------
    console.log("Soumission finale →", formData);
    // await api.properties.create(formData);
    // toast.success("Bien publié !");

    setStep(5);
  };

  const handleClose = () => {
    // Option A : reset quand on ferme (recommandé)
    setStep(1);
    setFormData({
      type: "",
      category: "",
      title: "",
      description: "",
      country: "Cameroun",
      city: "Yaoundé",
      quarter: "",
      address: "",
      surface: undefined,
      rooms: undefined,
      bathrooms: undefined,
      amenities: [],
      price: undefined,
      visitFees: undefined,
      photos: [],
    });

    onClose();
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={handleClose}           // ← on utilise la version contrôlée
      title="Ajouter un bien"
    >
      {step === 1 && (
        <Step1GeneralInfo
          data={formData}
          updateData={updateData}
          next={next}
        />
      )}

      {step === 2 && (
        <Step2Location
          data={formData}
          updateData={updateData}
          next={next}
          prev={prev}
        />
      )}

      {step === 3 && (
        <Step3Features
          data={formData}
          updateData={updateData}
          next={next}
          prev={prev}
        />
      )}

      {step === 4 && (
        <Step4Media
          data={formData}
          updateData={updateData}
          submit={handleSubmit}       // ← on passe la fonction contrôlée
          prev={prev}
        />
      )}

      {step === 5 && (
        <Step5Success data={formData} onFinish={handleClose} />
      )}
    </CustomModal>
  );
}