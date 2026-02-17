"use client"

import { createContext, useContext, useState } from "react"
import { fr } from "@/dictionaries/fr"
import { en } from "@/dictionaries/en"

type Language = "fr" | "en"

type LanguageContextType = {
  language: Language
  dictionary: typeof fr
  changeLanguage: (lang: Language) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("fr")

  const dictionary = language === "fr" ? fr : en

  function changeLanguage(lang: Language) {
    setLanguage(lang)
  }

  return (
    <LanguageContext.Provider value={{ language, dictionary, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) throw Error("useLanguage must be used within a LanguageProvider")
  return context
}
