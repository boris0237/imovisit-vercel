"use client"

import { useState } from 'react';
import Link from 'next/link'
import { Building2, Calendar, Users, DollarSign, Eye, Plus, Home, MessageSquare, Settings, LogOut, ChevronRight, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { mockProperties, mockVisits } from '@/data/mock';

const sidebarItems = [
  { icon: Home, label: 'Tableau de bord', href: '/dashboard', active: true },
  { icon: Building2, label: 'Mes biens', href: '/dashboard/properties', active: false },
  { icon: Calendar, label: 'Calendrier', href: '/dashboard/calendar', active: false },
  { icon: Users, label: 'Locataires', href: '/dashboard/tenants', active: false },
  { icon: DollarSign, label: 'Paiements', href: '/dashboard/payments', active: false },
  { icon: MessageSquare, label: 'Messages', href: '/dashboard/messages', active: false, badge: 3 },
  { icon: Settings, label: 'Paramètres', href: '/dashboard/settings', active: false },
];

const stats = [
  { title: 'Biens publiés', value: '8', icon: Building2, change: '+2 ce mois', color: 'bg-blue-500' },
  { title: 'Visites ce mois', value: '24', icon: Calendar, change: '+12%', color: 'bg-green-500' },
  { title: 'Vues totales', value: '1,234', icon: Eye, change: '+28%', color: 'bg-purple-500' },
  { title: 'Revenus', value: '2.8M FCFA', icon: DollarSign, change: '+15%', color: 'bg-orange-500' },
];

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`bg-white border-r border-gray-200 flex-shrink-0 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-16 flex items-center justify-center border-b border-gray-200">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-imo-primary rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              {sidebarOpen && <span className="text-xl font-bold text-imo-primary">Imovisit</span>}
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-4 px-3 space-y-1">
            {sidebarItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  item.active
                    ? 'bg-imo-primary text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && (
                  <>
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <Badge className="bg-red-500 text-white text-xs">{item.badge}</Badge>
                    )}
                  </>
                )}
              </Link>
            ))}
          </nav>

          {/* User */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-imo-primary text-white">JD</AvatarFallback>
              </Avatar>
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">Jean Dupont</p>
                  <p className="text-xs text-gray-500 truncate">Propriétaire</p>
                </div>
              )}
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-500">
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <ChevronRight className={`w-5 h-5 transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} />
            </Button>
            <h1 className="text-xl font-semibold text-imo-primary">Tableau de bord</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </Button>
            <Link href="/dashboard/properties/new">
              <Button className="bg-imo-primary hover:bg-imo-secondary gap-2">
                <Plus className="w-4 h-4" />
                Ajouter un bien
              </Button>
            </Link>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
                      <p className="text-2xl font-bold text-imo-primary">{stat.value}</p>
                      <p className="text-xs text-green-500 mt-1">{stat.change}</p>
                    </div>
                    <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Properties */}
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Mes biens récents</CardTitle>
                <Link href="/dashboard/properties">
                  <Button variant="ghost" size="sm" className="gap-1">
                    Voir tout
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockProperties.slice(0, 3).map((property) => (
                    <div
                      key={property.id}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-imo-primary truncate">{property.title}</h4>
                        <p className="text-sm text-gray-500">{property.city}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <span>{property.price.toLocaleString()} F/mois</span>
                          <span className="text-gray-300">|</span>
                          <span>{property.views} vues</span>
                          <span className="text-gray-300">|</span>
                          <span>{property.visitsCount} visites</span>
                        </div>
                      </div>
                      <Badge className={property.isAvailable ? 'bg-green-500' : 'bg-gray-400'}>
                        {property.isAvailable ? 'Disponible' : 'Indisponible'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Visits */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Visites à venir</CardTitle>
                <Link href="/dashboard/calendar">
                  <Button variant="ghost" size="sm" className="gap-1">
                    Voir tout
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockVisits.map((visit) => (
                    <div key={visit.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-imo-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-5 h-5 text-imo-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{visit.propertyTitle}</p>
                        <p className="text-xs text-gray-500">{visit.visitorName}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
                          <span>{visit.date}</span>
                          <span>à</span>
                          <span>{visit.time}</span>
                        </div>
                      </div>
                      <Badge
                        className={
                          visit.status === 'confirmed'
                            ? 'bg-green-500'
                            : visit.status === 'pending'
                            ? 'bg-yellow-500'
                            : 'bg-gray-400'
                        }
                      >
                        {visit.status === 'confirmed'
                          ? 'Confirmé'
                          : visit.status === 'pending'
                          ? 'En attente'
                          : visit.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-imo-primary mb-4">Actions rapides</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/dashboard/properties/new">
                <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                  <Plus className="w-6 h-6" />
                  <span>Nouveau bien</span>
                </Button>
              </Link>
              <Link href="/dashboard/calendar">
                <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                  <Calendar className="w-6 h-6" />
                  <span>Gérer le calendrier</span>
                </Button>
              </Link>
              <Link href="/dashboard/tenants">
                <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                  <Users className="w-6 h-6" />
                  <span>Ajouter un locataire</span>
                </Button>
              </Link>
              <Link href="/dashboard/payments">
                <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                  <DollarSign className="w-6 h-6" />
                  <span>Voir les paiements</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
