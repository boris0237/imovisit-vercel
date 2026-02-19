"use client"

import { useState } from 'react';
import Link from 'next/link'
import { Menu, Home, Search, Heart, User, LogIn, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { usePathname } from 'next/navigation';
import logo from '@/static/logo.png';
import Image from 'next/image';import { useLanguage } from '@/contexts/LanguageContext';
import LanguageDropdown from '@/components/LanguageDropdown';
import { useDictionary } from '@/hooks/useDictionary'

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const isLoggedIn = false; // TODO: Replace with auth context
  const { language, setLanguage } = useLanguage()
  const { dictionary } = useDictionary()

  const navItems = [
    { href: '/', label: 'Accueil', icon: Home, translateLabel: dictionary.header?.accueil },
    { href: '/search', label: 'Rechercher', icon: Search, translateLabel: dictionary.header?.recherche },
    { href: '/favorites', label: 'Favoris', icon: Heart, translateLabel: dictionary.header?.favoris },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className='flex '>
            <div className="w-10 h-10 bg-imo-primary rounded-lg flex items-center justify-center -mt-1">
              <Image 
                src={logo} 
                alt="Logo Imovisit" 
                width={800} 
                height={600}
                placeholder="blur"
                className="bg-white"
                />
            </div>
            <div className='flex-none'>
                <div className="flex-none space-x-0.5">
                  <span className="text-2xl font-bold text-imo-primary">Imovisit</span>
                  <span className='bg-primary text-white text-2xl'>.com</span>
                 </div>
                 <div className='-mt-3.5'>
                  <span className='text-[7px]'>{dictionary.header?.subtitle}</span>
                 </div>
            </div>
          </div>
        </Link>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <LanguageDropdown
              currentLanguage={language}
              onLanguageChange={setLanguage}
          />
          {isLoggedIn ? (
            <Link href="/dashboard">
              <Button variant="ghost" className="gap-2">
                <User className="w-4 h-4" />
                {dictionary.header?.myaccount || "Mon compte"}
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="gap-2">
                  <LogIn className="w-4 h-4" />
                  {dictionary.header?.connexion || 'Connexion'}
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-imo-primary hover:bg-imo-secondary gap-2">
                  <User className="w-4 h-4" />
                  {dictionary.header?.inscrire || 'S\'inscrire'}
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
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2">
                <div className='flex '>
                 <div className="w-10 h-10 bg-imo-primary rounded-lg flex items-center justify-center -mt-1">
                   <Image 
                     src={logo} 
                      alt="Logo Imovisit" 
                      width={800} 
                      height={600}
                      placeholder="blur"
                      className="bg-white"
                    />
                  </div>
                  <div className='flex-none'>
                      <div className="flex-none space-x-0.5">
                        <span className="text-2xl font-bold text-imo-primary">Imovisit</span>
                        <span className='bg-primary text-white text-2xl'>.com</span>
                      </div>
                      <div className='-mt-3.5'>
                        <span className='text-[7px]'>{dictionary.header?.subtitle || 'La visite des biens imobiliers devient plus facile'}</span>
                      </div>
                  </div>
                </div>
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
                    {item.translateLabel || item.label}
                  </Link>
                ))}
                <div>
                  <LanguageDropdown
                     currentLanguage={language}
                     onLanguageChange={setLanguage}
                  />
                </div>
              </nav>

              {/* Mobile Actions */}
              <div className="flex flex-col gap-2 pt-4 border-t">
                {isLoggedIn ? (
                  <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                    <Button className="w-full bg-imo-primary hover:bg-imo-secondary">
                      <User className="w-4 h-4 mr-2" />
                      {dictionary.header?.myaccount || "Mon compte"}
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full">
                        <LogIn className="w-4 h-4 mr-2" />
                        {dictionary.header?.connexion || "Connexion"}
                      </Button>
                    </Link>
                    <Link href="/register" onClick={() => setIsOpen(false)}>
                      <Button className="w-full bg-imo-primary hover:bg-imo-secondary">
                        <User className="w-4 h-4 mr-2" />
                        {dictionary.header?.inscrire || "S'inscrire"}
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
