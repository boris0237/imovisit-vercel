"use client"

import { useRouter, usePathname } from "next/navigation"

export function LanguageSwitcher() {
  const router = useRouter()
  const pathname = usePathname()

  const currentLocale = pathname.split("/")[1] || "fr"

const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const locale = e.target.value

    // Remplace uniquement la langue dans l'URL
    const newPath = pathname.replace(/^\/(fr|en)/, `/${locale}`)

    router.push(newPath)
}

  return (
    <select
      value={currentLocale}
      onChange={handleChange}
      aria-label="Language switcher"
      className="bg-transparent border border-white/30 text-white text-sm px-3 py-1 rounded-md focus:outline-none"
    >
      <option value="fr" className="text-black">FR</option>
      <option value="en" className="text-black">EN</option>
    </select>
  )
}
