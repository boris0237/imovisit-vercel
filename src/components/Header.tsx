"use client"

import { useState } from 'react';
import Link from 'next/link'
import { Menu, Home, Search, Heart, User, LogIn, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { usePathname } from 'next/navigation';

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const isLoggedIn = false; // TODO: Replace with auth context

  const navItems = [
    { href: '/', label: 'Accueil', icon: Home },
    { href: '/search', label: 'Rechercher', icon: Search },
    { href: '/favorites', label: 'Favoris', icon: Heart },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-imo-primary rounded-lg flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-imo-primary">Imovisit</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? 'text-imo-primary'
                  : 'text-gray-600 hover:text-imo-primary'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          {isLoggedIn ? (
            <Link href="/dashboard">
              <Button variant="ghost" className="gap-2">
                <User className="w-4 h-4" />
                Mon compte
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="gap-2">
                  <LogIn className="w-4 h-4" />
                  Connexion
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-imo-primary hover:bg-imo-secondary gap-2">
                  <User className="w-4 h-4" />
                  S'inscrire
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px]">
            <div className="flex flex-col gap-6 mt-8">
              {/* Mobile Logo */}
              <Link href="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
                <div className="w-10 h-10 bg-imo-primary rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-imo-primary">Imovisit</span>
              </Link>

              {/* Mobile Nav */}
              <nav className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive(item.href)
                        ? 'bg-imo-primary/10 text-imo-primary'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                ))}
              </nav>

              {/* Mobile Actions */}
              <div className="flex flex-col gap-2 pt-4 border-t">
                {isLoggedIn ? (
                  <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                    <Button className="w-full bg-imo-primary hover:bg-imo-secondary">
                      <User className="w-4 h-4 mr-2" />
                      Mon compte
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full">
                        <LogIn className="w-4 h-4 mr-2" />
                        Connexion
                      </Button>
                    </Link>
                    <Link href="/register" onClick={() => setIsOpen(false)}>
                      <Button className="w-full bg-imo-primary hover:bg-imo-secondary">
                        <User className="w-4 h-4 mr-2" />
                        S'inscrire
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
