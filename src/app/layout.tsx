import type { Metadata } from "next";
import { LanguageProvider } from '@/contexts/LanguageContext'
import "./globals.css";
import "./App.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { CalendarProvider } from "@/contexts/CalendarContext";
import { Toaster } from "@/components/ui/sonner";


export const metadata: Metadata = {
  title: "Imovisit - Visites Immobilières",
  description: "La plateforme de référence pour les visites immobilières au Cameroun. Trouvez votre bien idéal en toute confiance.",
  keywords: ["immobilier", "location", "vente", "appartement", "maison", "villa", "Cameroun", "Yaoundé", "Douala"],
  authors: [{ name: "Imovisit" }],
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M50 15 L85 40 L85 85 L60 85 L60 60 L40 60 L40 85 L15 85 L15 40 Z' fill='%231a2b4a'/%3E%3Ccircle cx='50' cy='10' r='8' fill='%234a90a4'/%3E%3C/svg%3E",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <CalendarProvider>
        <AuthProvider>
          <LanguageProvider>
            <body className="antialiased">
              {children}
              <Toaster />
            </body>
          </LanguageProvider>
        </AuthProvider>
      </CalendarProvider>
    </html>
  )
}
