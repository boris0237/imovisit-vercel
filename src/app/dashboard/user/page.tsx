"use client"

import Link from 'next/link'
import {
  Building2,
  Calendar,
  Users,
  Plus,
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
  MapPin,
  BedDouble,
  Bath,
  Ruler,
  Search,
  KeyRound,
  Tag,
  Sofa,
  Eye,
  Heart,
  Edit,
  Trash,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { mockProperties } from '@/data/mock';
import UpdateProfileForm from '@/forms/updateRegister';
import { useEffect, useState } from "react";
import { useAuth } from '@/contexts/AuthContext';
import Modal from '@/components/ui/modal';

const primaryNav = [
  { icon: LayoutGrid, label: "Vue d'ensemble", href: '/dashboard' },
  { icon: Building2, label: 'Mes biens', href: '/dashboard/properties', active: true },
  { icon: Calendar, label: 'Calendrier', href: '/dashboard/calendar', badge: 3 },
  { icon: ClipboardList, label: 'Visites', href: '/dashboard/visits' },
  { icon: MessageSquare, label: 'Messages', href: '/dashboard/messages' },
  { icon: Bell, label: 'Notifications', href: '/dashboard/notifications' },
];

const managementNav = [
  { icon: Users, label: 'Mes locataires', href: '/dashboard/tenants' },
  { icon: FileText, label: 'Mes dépenses', href: '/dashboard/expenses' },
  { icon: Receipt, label: 'Mes quittances', href: '/dashboard/receipts' },
  { icon: Star, label: 'Avis reçus', href: '/dashboard/reviews' },
];

const accountNav = [
  { icon: Crown, label: 'Mon abonnement', href: '/dashboard/subscription', badge: 'Premium' },
  { icon: Settings, label: 'Paramètres', href: '/dashboard/settings' },
  { icon: LogOut, label: 'Déconnexion', href: 'api/users/logout' },
];

const stats = [
  { title: 'Biens total', value: '4', icon: Building2, color: 'bg-slate-100 text-slate-600' },
  { title: 'Biens à louer', value: '02', icon: KeyRound, color: 'bg-emerald-100 text-emerald-600' },
  { title: 'Biens à vendre', value: '01', icon: Tag, color: 'bg-amber-100 text-amber-600' },
  { title: 'Biens meublés', value: '01', icon: Sofa, color: 'bg-indigo-100 text-indigo-600' },
];

const typeLabels: Record<string, string> = {
  apartment: 'Appartement',
  villa: 'Villa',
  studio: 'Studio',
  duplex: 'Duplex',
  office: 'Bureau',
  land: 'Terrain',
  house: 'Maison',
  shop: 'Boutique',
};

const offerLabels: Record<string, { label: string; className: string }> = {
  rent: { label: 'Location', className: 'bg-blue-100 text-blue-700' },
  sale: { label: 'A vendre', className: 'bg-amber-100 text-amber-700' },
  furnished: { label: 'Meublé', className: 'bg-emerald-100 text-emerald-700' },
};

export default function Dashboard() {

  const [showUpdateModal, setShowUpdateModal] = useState(false);
  // Supposons que 'user' vient de votre contexte d'authentification ou d'un fetch
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const createdAt = new Date(user.createdAt).getTime();
      const updatedAt = new Date(user.updatedAt).getTime();
      console.log(user)

      // Si updatedAt est égal à createdAt, le profil n'a jamais été mis à jour
      // On ajoute une marge de 1000ms car parfois la DB enregistre avec un micro-décalage
      if (Math.abs(updatedAt - createdAt) < 1000) {
        setShowUpdateModal(true);
      }
    }
  }, [user]);
  
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="bg-white border-r border-slate-200 w-72 flex-shrink-0">
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-20 flex items-center justify-center border-b border-slate-200 px-6">
            <Link href="/" className="flex items-center gap-3">
             <img
                src="/logo2.png"
                alt="Logo Imovisit"
                className="w-65 h-15 rounded-lg p-1"
              />
            </Link>
          </div>

          {/* User */}
          <div className="px-6 py-6">
            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 border border-slate-200">
              <div className="relative">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-imo-primary text-white">JP</AvatarFallback>
                </Avatar>
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-slate-900 truncate">Jean-Pierre E.</p>
                <p className="text-xs text-slate-500 truncate">Propriétaire</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-6 pb-6 space-y-6 overflow-auto">
            <div>
              <p className="text-[11px] uppercase tracking-widest text-slate-400 mb-3">Menu principal</p>
              <div className="space-y-1">
                {primaryNav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                      item.active
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

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-slate-50 border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Mes biens immobiliers</h1>
              <p className="text-sm text-slate-500">
                Gérez vos annonces, suivez les performances et planifiez vos visites
              </p>
            </div>
            <Link href="/dashboard/properties/new">
              <Button className="bg-slate-900 hover:bg-slate-800 gap-2">
                <Plus className="w-4 h-4" />
                Ajouter un bien
              </Button>
            </Link>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat) => (
                <Card key={stat.title} className="border-slate-200">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">{stat.title}</p>
                      <p className="text-lg font-semibold text-slate-900">{stat.value}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Overview */}
            <div>
              <h2 className="text-sm font-semibold text-slate-800 mb-3">Vue d'ensemble</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-slate-200">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <Eye className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Vues totales</p>
                      <p className="text-lg font-semibold text-slate-900">469</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-slate-200">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center">
                      <Heart className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Favoris reçus</p>
                      <p className="text-lg font-semibold text-slate-900">44</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Rechercher un bien..."
                  className="pl-9 bg-white border-slate-200"
                />
              </div>
              <div className="flex gap-3">
                <Select>
                  <SelectTrigger className="w-44 bg-white border-slate-200">
                    <SelectValue placeholder="Tous les types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="apartment">Appartement</SelectItem>
                    <SelectItem value="villa">Villa</SelectItem>
                    <SelectItem value="studio">Studio</SelectItem>
                    <SelectItem value="office">Bureau</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="w-44 bg-white border-slate-200">
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="available">Disponible</SelectItem>
                    <SelectItem value="unavailable">Indisponible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {mockProperties.slice(0, 6).map((property) => {
                const offer = offerLabels[property.offerType] ?? offerLabels.rent;
                return (
                  <Card key={property.id} className="border-slate-200 overflow-hidden">
                    <div className="relative">
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="w-full h-44 object-cover"
                      />
                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <Badge className={`${offer.className} border-0`}>{offer.label}</Badge>
                        <Badge className="bg-slate-900 text-white border-0">
                          {typeLabels[property.type] ?? 'Bien'}
                        </Badge>
                      </div>
                      <div className="absolute top-3 right-3 flex items-center gap-2">
                        <Button size="icon" variant="secondary" className="h-8 w-8 bg-white/90 hover:bg-white">
                          <Edit className="w-4 h-4 text-slate-700" />
                        </Button>
                        <Button size="icon" variant="secondary" className="h-8 w-8 bg-white/90 hover:bg-white">
                          <Trash className="w-4 h-4 text-slate-700" />
                        </Button>
                      </div>
                      <div className="absolute bottom-3 left-3 bg-white/90 text-slate-900 text-xs font-semibold px-2.5 py-1 rounded-lg">
                        {property.price.toLocaleString('fr-FR')} F/mois
                      </div>
                    </div>
                    <CardContent className="p-5 space-y-4">
                      <div>
                        <h3 className="font-semibold text-slate-900 leading-snug">{property.title}</h3>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>
                            {property.neighborhood}, {property.city}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-600">
                        <div className="flex items-center gap-1">
                          <BedDouble className="w-4 h-4" />
                          <span>{property.bedrooms ?? 1}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Bath className="w-4 h-4" />
                          <span>{property.bathrooms ?? 1}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Ruler className="w-4 h-4" />
                          <span>{property.surface} m²</span>
                        </div>
                      </div>
                      <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            <span>{property.views}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{property.visitsCount}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500">
                            {property.isAvailable ? 'Actif' : 'Inactif'}
                          </span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              defaultChecked={property.isAvailable}
                              className="sr-only peer"
                            />
                            <div className="relative w-9 h-5 bg-slate-200 rounded-full peer peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:h-4 after:w-4 after:rounded-full after:transition-transform peer-checked:after:translate-x-4" />
                          </label>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>
      </main>
      <Modal 
        isOpen={showUpdateModal} 
        onClose={() => setShowUpdateModal(false)}
        title="Finalisez votre profil professionnel"
        size="xl"       // On choisit une taille large pour le formulaire
        showBlur={true} // Activation du flou
        closeOnClickOutside={false} // On force l'utilisateur à cliquer sur le bouton ou la croix
      >
        {/* On passe votre composant existant à l'intérieur */}
        <UpdateProfileForm /> 
      </Modal>
    </div>
  );
}
