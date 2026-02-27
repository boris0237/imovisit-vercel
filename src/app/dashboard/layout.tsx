"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Building2,
  Calendar,
  Users,
  MessageSquare,
  Settings,
  LogOut,
  Bell,
  LayoutGrid,
  ClipboardList,
  FileText,
  Receipt,
  Star,
  Crown,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {useAuth} from '@/contexts/AuthContext'
import { Header } from '@/components/Header'

const primaryNav = [
  { icon: LayoutGrid, label: "Vue d'ensemble", href: '/dashboard' },
  { icon: Building2, label: 'Mes biens', href: '/dashboard/user' },
  { icon: Calendar, label: 'Calendrier', href: '/dashboard/calendar', badge: 3 },
  { icon: ClipboardList, label: 'Visites', href: '/dashboard/visits' },
  { icon: MessageSquare, label: 'Messages', href: '/dashboard/messages' },
  { icon: Bell, label: 'Notifications', href: '/dashboard/notifications' },
]

const managementNav = [
  { icon: Users, label: 'Mes locataires', href: '/dashboard/tenants' },
  { icon: FileText, label: 'Mes dépenses', href: '/dashboard/expenses' },
  { icon: Receipt, label: 'Mes quittances', href: '/dashboard/receipts' },
  { icon: Star, label: 'Avis reçus', href: '/dashboard/reviews' },
]

const accountNav = [
  { icon: Crown, label: 'Mon abonnement', href: '/dashboard/subscription', badge: 'Premium' },
  { icon: Settings, label: 'Paramètres', href: '/dashboard/settings' },
  { icon: LogOut, label: 'Déconnexion', href: 'api/users/logout' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {

  const {user} = useAuth();
  const stringToColor = (string : string) => {
    let hash = 0;
    for (let i = 0; i < string.length; i++) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    // Génération d'une couleur HSL pour garder une bonne luminosité
    const h = Math.abs(hash) % 360;
    return `hsl(${h}, 70%, 45%)`; // 70% saturation, 45% luminosité
  };

  const bgColor = user?.name ? stringToColor(user?.name) : "#ccc";
  const initials = user?.name 
    ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "??";
  const name = user?.name || 'utilisateur'
  const role = user?.role || 'pas de role'

  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="bg-white border-r border-slate-200 w-72 flex-shrink-0">
        <div className="h-full flex flex-col">
          <div className="h-20 flex items-center justify-center border-b border-slate-200 px-6">
            <Link href="/" className="flex items-center gap-3">
              <img
                src="/logo2.png"
                alt="Logo Imovisit"
                className="w-65 h-15 rounded-lg p-1"
              />
            </Link>
          </div>

          <div className="px-6 py-6">
            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 border border-slate-200">
              <div className="relative">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={user?.avatar || ""} alt={user?.name.split("")[0].toUpperCase()} />
                  <AvatarFallback 
                    className="text-white" 
                    style={{ backgroundColor: bgColor }}
                  >
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-slate-900 truncate">{name}</p>
                <p className="text-xs text-slate-500 truncate">{role}</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-6 pb-6 space-y-6 overflow-auto">
            <div>
              <p className="text-[11px] uppercase tracking-widest text-slate-400 mb-3">Menu principal</p>
              <div className="space-y-1">
                {primaryNav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                      isActive(item.href)
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="flex-1 text-sm">{item.label}</span>
                    {item.badge && (
                      <Badge className="bg-imo-primary text-white text-xs">{item.badge}</Badge>
                    )}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-widest text-slate-400 mb-3">Gestion</p>
              <div className="space-y-1">
                {managementNav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100"
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="flex-1 text-sm">{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-widest text-slate-400 mb-3">Compte</p>
              <div className="space-y-1">
                {accountNav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100"
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="flex-1 text-sm">{item.label}</span>
                    {item.badge && (
                      <Badge className="bg-emerald-100 text-emerald-700 text-xs">{item.badge}</Badge>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </nav>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        {children}
      </main>
    </div>
  )
}
