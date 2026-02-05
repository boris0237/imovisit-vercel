// components/LanguageDropdown.tsx
"use client"

import { useState, useEffect } from 'react'
import { useBrowserLanguage } from '@/hooks/useBrowserLanguage'

interface LanguageDropdownProps {
  currentLanguage: string
  onLanguageChange: (lang: 'fr' | 'en') => void
}

export default function LanguageDropdown({ 
  currentLanguage, 
  onLanguageChange 
}: LanguageDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const detectedLang = useBrowserLanguage(['fr', 'en'])

  // Synchroniser avec la langue détectée au démarrage
  useEffect(() => {
    if (!currentLanguage && detectedLang) {
      onLanguageChange(detectedLang as 'fr' | 'en')
    }
  }, [detectedLang, currentLanguage, onLanguageChange])

  const languages = [
    { code: 'fr', name: 'Français' },
    { code: 'en', name: 'English' }
  ]

  const handleLanguageSelect = (langCode: 'fr' | 'en') => {
    onLanguageChange(langCode)
    setIsOpen(false)
    
    // Optionnel : sauvegarder dans localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferred-language', langCode)
    }
  }

  const getCurrentLanguageCode = () => {
    const current = languages.find(lang => lang.code === currentLanguage)
    if (current?.code === 'fr') return 'Fr'
    if (current?.code === 'en') return 'En'
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700  rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span>{getCurrentLanguageCode()}</span>
        <svg 
          className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right bg-white border border-gray-200 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {languages.map((language) => (
              <button
                key={language.name}
                onClick={() => handleLanguageSelect(language.code as 'fr' | 'en')}
                className={`block w-full text-left px-4 py-2 text-sm ${
                  currentLanguage === language.code
                    ? 'bg-indigo-100 text-indigo-900'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {language.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
