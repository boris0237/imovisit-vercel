"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Heart,
  User,
  Wrench,
  Flag,
  Map,
  MapPin,
  Building2,
  Calendar,
  MessageSquare,
  Settings,
  LogOut,
  Bell,
  LayoutGrid,
  ClipboardList,
  Crown,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import ProfileDropdown from '@/components/ProfileDropdown'
import { useState } from 'react'
import Modal from '@/components/ui/modal'
import UpdateProfileForm from '@/forms/UpdateProfile'
import { translateRole } from '@/utils/translateRole'
import { useDictionary } from '@/hooks/useDictionary'

type NavItem = {
  icon: React.ComponentType<{ className?: string }>
  label: string
  labelKey?: string
  href: string
  badge?: number | string
  action?: 'logout'
}

type NavSection = {
  title: string
  titleKey?: string
  items: NavItem[]
}

const ownerLikeSections: NavSection[] = [
  {
    title: 'Menu principal',
    titleKey: 'menuPrincipal',
    items: [
      { icon: LayoutGrid, label: "Vue d'ensemble", labelKey: 'overview', href: '/dashboard' },
      { icon: Building2, label: 'Mes biens', labelKey: 'properties', href: '/dashboard/user' },
      { icon: Calendar, label: 'Calendrier', labelKey: 'calendar', href: '/dashboard/calendar', badge: 3 },
      { icon: ClipboardList, label: 'Rendez-vous', labelKey: 'appointments', href: '/dashboard/visits' },
      { icon: MessageSquare, label: 'Messages', labelKey: 'messages', href: '/dashboard/messages' },
      { icon: Heart, label: 'Favoris', labelKey: 'favorites', href: '/dashboard/favorites' },
      { icon: Bell, label: 'Notification', labelKey: 'notifications', href: '/dashboard/notifications' },
      { icon: Wrench, label: 'Prestataires', labelKey: 'providers', href: '/dashboard/providers' },
    ],
  },
  {
    title: 'Compte',
    titleKey: 'account',
    items: [
      { icon: Crown, label: 'Abonnement', labelKey: 'subscription', href: '/dashboard/subscription', badge: 'Premium' },
      { icon: Settings, label: 'Compte', labelKey: 'accountSettings', href: '/dashboard/settings' },
      { icon: LogOut, label: 'Déconnexion', labelKey: 'logout', href: '#', action: 'logout' },
    ],
  },
]

const visitorSections: NavSection[] = [
  {
    title: 'Menu principal',
    titleKey: 'menuPrincipal',
    items: [
      { icon: Home, label: 'Accueil', labelKey: 'home', href: '/dashboard' },
      { icon: ClipboardList, label: 'Rendez-vous', labelKey: 'appointments', href: '/dashboard/visits' },
      { icon: Heart, label: 'Favoris', labelKey: 'favorites', href: '/dashboard/favorites' },
      { icon: MessageSquare, label: 'Messages', labelKey: 'messages', href: '/dashboard/messages' },
      { icon: Bell, label: 'Notification', labelKey: 'notifications', href: '/dashboard/notifications' },
      { icon: Wrench, label: 'Prestataires', labelKey: 'providers', href: '/dashboard/providers' },
    ],
  },
  {
    title: 'Compte',
    titleKey: 'account',
    items: [
      { icon: Settings, label: 'Compte', labelKey: 'accountSettings', href: '/dashboard/settings' },
      { icon: LogOut, label: 'Déconnexion', labelKey: 'logout', href: '#', action: 'logout' },
    ],
  },
]

const providerSections: NavSection[] = [
  {
    title: 'Menu principal',
    titleKey: 'menuPrincipal',
    items: [
      { icon: Calendar, label: 'Calendrier', labelKey: 'calendar', href: '/dashboard/calendar' },
      { icon: LayoutGrid, label: "Vue d'ensemble", labelKey: 'overview', href: '/dashboard' },
      { icon: ClipboardList, label: 'Rendez-vous', labelKey: 'appointments', href: '/dashboard/visits' },
      { icon: MessageSquare, label: 'Messages', labelKey: 'messages', href: '/dashboard/messages' },
      { icon: Heart, label: 'Favoris', labelKey: 'favorites', href: '/dashboard/favorites' },
      { icon: Bell, label: 'Notification', labelKey: 'notifications', href: '/dashboard/notifications' },
      { icon: Building2, label: 'Biens', labelKey: 'properties', href: '/dashboard/user' },
    ],
  },
  {
    title: 'Compte',
    titleKey: 'account',
    items: [
      { icon: User, label: 'Mon Profil', labelKey: 'profile', href: '/dashboard/profile' },
      { icon: Settings, label: 'Compte', labelKey: 'accountSettings', href: '/dashboard/settings' },
      { icon: Crown, label: 'Abonnement', labelKey: 'subscription', href: '/dashboard/subscription', badge: 'Premium' },
      { icon: LogOut, label: 'Déconnexion', labelKey: 'logout', href: '#', action: 'logout' },
    ],
  },
]

const adminSections: NavSection[] = [
  {
    title: 'Menu principal',
    titleKey: 'menuPrincipal',
    items: [
      { icon: LayoutGrid, label: "Vue d'ensemble", labelKey: 'overview', href: '/dashboard' },
    ],
  },
  {
    title: 'Gestion',
    titleKey: 'management',
    items: [
      { icon: Flag, label: 'Gestion des pays', labelKey: 'countries', href: '/dashboard/admin/countries' },
      { icon: Map, label: 'Gestion des villes', labelKey: 'cities', href: '/dashboard/admin/cities' },
      { icon: MapPin, label: 'Gestion des quartiers', labelKey: 'neighborhoods', href: '/dashboard/admin/neighborhoods' },
    ],
  },
  {
    title: 'Compte',
    titleKey: 'account',
    items: [
      { icon: Settings, label: 'Compte', labelKey: 'accountSettings', href: '/dashboard/settings' },
      { icon: LogOut, label: 'Déconnexion', labelKey: 'logout', href: '#', action: 'logout' },
    ],
  },
]

const navByRole: Record<string, NavSection[]> = {
  visitor: visitorSections,
  owner: ownerLikeSections,
  agent: ownerLikeSections,
  agency: ownerLikeSections,
  free_agent: ownerLikeSections,
  prospector: ownerLikeSections,
  property_manager: ownerLikeSections,
  provider: providerSections,
  admin: adminSections,
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {

  const { user, logout } = useAuth();
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [showProfil, setShowProfil] = useState(false);
  const { dictionary } = useDictionary();

  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  const roleKey = user?.role || 'visitor'
  const sections = navByRole[roleKey] || visitorSections
  const t = dictionary?.sidebar

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

          <div className="px-6 py-6 cursor-pointer" onClick={() => setShowProfil(true)}>
            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 border border-slate-200">
              <div className="relative">
                <ProfileDropdown
                  onOpenUpdateProfile={() => setIsUpdateModalOpen(true)}
                  isOpen={showProfil}
                  setIsOpen={setShowProfil}
                />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-slate-900 truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 truncate">{translateRole(user?.role || " ", dictionary)}</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-6 pb-6 space-y-6 overflow-auto">
            {sections.map((section) => (
              <div key={section.title}>
                <p className="text-[11px] uppercase tracking-widest text-slate-400 mb-3">
                  {section.titleKey ? (t?.[section.titleKey] || section.title) : section.title}
                </p>
                <div className="space-y-1">
                  {section.items.map((item) => (
                    item.action === 'logout' ? (
                      <button
                        key={`action-${item.label}`}
                        onClick={() => logout()}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100"
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="flex-1 text-sm">
                          {item.labelKey ? (t?.[item.labelKey] || item.label) : item.label}
                        </span>
                      </button>
                    ) : (
                      <Link
                        key={item.href + item.label}
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                          isActive(item.href)
                            ? 'bg-slate-900 text-white'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="flex-1 text-sm">
                          {item.labelKey ? (t?.[item.labelKey] || item.label) : item.label}
                        </span>
                        {item.badge && (
                          <Badge className="bg-imo-primary text-white text-xs">{item.badge}</Badge>
                        )}
                      </Link>
                    )
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <Modal isOpen={isUpdateModalOpen} onClose={() => setIsUpdateModalOpen(false)} size='lg' showBlur={true}>
          <UpdateProfileForm />
        </Modal>
        {children}
      </main>
    </div>
  )
}
