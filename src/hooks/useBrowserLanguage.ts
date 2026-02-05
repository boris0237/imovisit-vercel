// hooks/useBrowserLanguage.ts
"use client"

import { useEffect, useState } from 'react'

export function useBrowserLanguage(supportedLanguages = ['fr', 'en']) {
  const [browserLang, setBrowserLang] = useState('fr')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Méthode 1 : navigator.language
      const navLang = navigator.language.substring(0, 2) // 'fr' from 'fr-Fr'
      
      // Méthode 2 : navigator.languages (plusieurs langues préférées)
      const navLanguages = navigator.languages?.map(lang => lang.substring(0, 2)) || []
      
      // Trouver la première langue supportée
      const preferredLang = [...navLanguages, navLang].find(lang => 
        supportedLanguages.includes(lang)
      ) || 'fr' // fallback
      
      setBrowserLang(preferredLang)
    }
  }, [supportedLanguages])

  return browserLang
}
