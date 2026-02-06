"use client"

import Link from 'next/link'
import { Building2, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import Image from "next/image";
import logoFooter from "@/images/logoFooter.png";


export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { label: 'À propos', href: '/about' },
      { label: 'Comment ça marche', href: '/how-it-works' },
      { label: 'Carrières', href: '/careers' },
      { label: 'Blog', href: '/blog' },
    ],
    support: [
      { label: 'Centre d\'aide', href: '/help' },
      { label: 'Contact', href: '/contact' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Signaler un problème', href: '/report' },
    ],
    legal: [
      { label: 'Conditions d\'utilisation', href: '/terms' },
      { label: 'Politique de confidentialité', href: '/privacy' },
      { label: 'Politique des cookies', href: '/cookies' },
      { label: 'Mentions légales', href: '/legal' },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
  ];

  return (
    <footer className="bg-imo-primary text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/">
          <Image
            src={logoFooter}
              alt="Imovisit.com"
              height={70}
              priority
          />
        </Link>
        <br />
            <p className="text-gray-300 mb-6 max-w-sm">
              La plateforme de référence pour les visites immobilières au Cameroun. 
              Trouvez votre bien idéal en toute confiance.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-300">
                <Mail className="w-5 h-5" /> 
                <span>contact@imovisit.cm</span> 
              </div>
              <br/>
              <span>Suivez-nous sur: </span>  
            <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                aria-label={social.label}
              >
                <social.icon className="w-5 h-5" />
              </a>
            ))}
          </div>


            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Entreprise</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Légal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-sm text-center md:text-left mx-auto">
            © {currentYear} Imovisit. Tous droits réservés.
          </p>
          
        </div>
      </div>
    </footer>
  );
}
