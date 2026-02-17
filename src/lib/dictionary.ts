// lib/dictionary.ts
export type Locale = 'fr' | 'en'

const dictionaries = {
  fr: () => import('@/language/fr'),
  en: () => import('@/language/en'),
} as const

export const getDictionary = async (locale: Locale) => {
  const dictModule = await dictionaries[locale]()
  return dictModule.default
}
