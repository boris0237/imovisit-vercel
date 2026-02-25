"use client";

import { useState } from "react";
import CustomModal from "@/components/modal/CustomModal";
import Step1GeneralInfo from "./steps/Step1GeneralInfo";
import Step2Location from "./steps/Step2Location";
import Step3Features from "./steps/Step3Features";
import Step4Media from "./steps/Step4Media";
import Step5Success from "./steps/Step5Success";
import { PropertyFormData } from "./type"; 

interface AddPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddPropertyModal({
  isOpen,
  onClose,
}: AddPropertyModalProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  const initialFormData: PropertyFormData = {
    type: "",
    offerType: "",           // change en offerType si tu as renommé dans Step1
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
  };

  const [formData, setFormData] = useState<PropertyFormData>(initialFormData);

  const updateData = (values: Partial<PropertyFormData>) => {
    setFormData((prev: any) => ({ ...prev, ...values }));
  };

  const next = () => setStep((s) => (s < 5 ? (s + 1) as 1|2|3|4|5 : s));
  const prev = () => setStep((s) => (s > 1 ? (s - 1) as 1|2|3|4|5 : s));

  const handleSubmit = async () => {
    if (!formData.type || !formData.category || !formData.title?.trim()) {
      alert("Veuillez compléter les informations essentielles (type, offre, titre).");
      setStep(1);
      return;
    }

    console.log("Soumission →", formData);
    // await api.createProperty(formData);
    setStep(5);
  };

  const handleClose = () => {
    setStep(1);
    setFormData(initialFormData); // reset propre
    onClose();
  };

  return (
    <CustomModal isOpen={isOpen} onClose={handleClose} title="Ajouter un bien">
      {step === 1 && <Step1GeneralInfo data={formData} updateData={updateData} next={next} />}
      {step === 2 && <Step2Location data={formData} updateData={updateData} next={next} prev={prev} />}
      {step === 3 && <Step3Features data={formData} updateData={updateData} next={next} prev={prev} />}
      {step === 4 && <Step4Media data={formData} updateData={updateData} submit={handleSubmit} prev={prev} />}
      {step === 5 && <Step5Success data={formData} onFinish={handleClose} />}
    </CustomModal>
  );
}