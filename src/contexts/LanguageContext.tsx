// contexts/LanguageContext.tsx
"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useBrowserLanguage } from '@/hooks/useBrowserLanguage'

type Language = 'fr' | 'en'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  toggleLanguage: () => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

interface LanguageProviderProps {
  children: ReactNode
  defaultLanguage?: Language
}

export function LanguageProvider({ 
  children, 
  defaultLanguage = 'fr' 
}: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(defaultLanguage)
  const detectedLang = useBrowserLanguage(['fr', 'en'])

  useEffect(() => {
    // Priorité : 1. localStorage, 2. détection navigateur, 3. default
    const getInitialLanguage = (): Language => {
      if (typeof window !== 'undefined') {
        // Vérifier localStorage
        const savedLang = localStorage.getItem('preferred-language')
        if (savedLang === 'fr' || savedLang === 'en') {
          return savedLang
        }
      }
      
      // Utiliser la détection du navigateur si disponible
      if (detectedLang === 'fr' || detectedLang === 'en') {
        return detectedLang
      }
      
      // Fallback sur la langue par défaut
      return defaultLanguage
    }

    setLanguageState(getInitialLanguage())
  }, [detectedLang, defaultLanguage])

  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang)
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferred-language', newLang)
      // Optionnel : mettre à jour l'attribut lang du html
      document.documentElement.lang = newLang
    }
  }

  const toggleLanguage = () => {
    const newLang: Language = language === 'fr' ? 'en' : 'fr'
    setLanguage(newLang)
  }

  const value = {
    language,
    setLanguage,
    toggleLanguage
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
