"use client";

import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AgendaProvider } from "@/contexts/AgendaContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Toaster } from "@/components/ui/sonner";

function AgendaWrapper({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  return (
    <AgendaProvider ownerId={user?.id}>
      {children}
    </AgendaProvider>
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <LanguageProvider>
        <AgendaWrapper>
          {children}
          <Toaster />
        </AgendaWrapper>
      </LanguageProvider>
    </AuthProvider>
  );
}