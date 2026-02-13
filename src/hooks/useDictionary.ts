// hooks/useDictionary.ts
import { useLanguage } from '@/contexts/LanguageContext'
import { getDictionary } from '@/lib/dictionary'
import { useEffect, useState } from 'react'

export function useDictionary() {
  const { language } = useLanguage()
  const [dictionary, setDictionary] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    
    const loadDictionary = async () => {
      try {
        const dict = await getDictionary(language)
        if (isMounted) {
          setDictionary(dict)
          setLoading(false)
        }
      } catch (error) {
        console.error('Error loading dictionary:', error)
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadDictionary()

    return () => {
      isMounted = false
    }
  }, [language])

  return { dictionary, loading, locale: language }
}
