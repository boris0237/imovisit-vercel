'use client';

import React, { forwardRef } from 'react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { cn } from "@/lib/utils";

interface InternationalPhoneInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onCountryChange?: (countryCode: string) => void; // ← Simplifié : seulement le code pays
  error?: string;
  className?: string;
}

// Style personnalisé pour matcher votre Input
const customInputStyle = `
  flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm 
  ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium 
  placeholder:text-muted-foreground focus-visible:outline-none 
  focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 
  disabled:cursor-not-allowed disabled:opacity-50
`;


const InternationalPhoneInput = forwardRef<HTMLDivElement, InternationalPhoneInputProps>(
  ({ value, onChange, onCountryChange, error, className }, ref) => {
    const handleChange = (newValue: string | undefined) => {
      const phoneNumber = newValue || '';
      onChange?.(phoneNumber);

      // Extraire automatiquement le code pays du numéro
      if (onCountryChange && phoneNumber) {
        // Utiliser libphonenumber-js pour une extraction précise
        try {
          console.log(phoneNumber)
          const { parsePhoneNumber } = require('libphonenumber-js');
          const parsed = parsePhoneNumber(phoneNumber);
          if (parsed && parsed.country) {
            onCountryChange(parsed.country);
          }
        } catch (error) {
          // Fallback : extraction manuelle basique
          const countryMap: Record<string, string> = {
            '+237': 'CM', // Cameroun
            '+33': 'FR',  // France
            '+1': 'US',   // USA/Canada
            '+44': 'GB',  // Royaume-Uni
            '+49': 'DE',  // Allemagne
            '+39': 'IT',  // Italie
            '+34': 'ES',  // Espagne
            '+234': 'NG', // Nigeria
            '+254': 'KE', // Kenya
            '+27': 'ZA',  // Afrique du Sud
            '+221': 'SN', // Sénégal
            '+225': 'CI', // Côte d'Ivoire
            '+233': 'GH', // Ghana
            '+229': 'BJ', // Bénin
            '+228': 'TG', // Togo
            '+223': 'ML', // Mali
            '+226': 'BF', // Burkina Faso
            '+227': 'NE', // Niger
            '+235': 'TD', // Tchad
          };

          for (const [prefix, code] of Object.entries(countryMap)) {
            if (phoneNumber.startsWith(prefix)) {
              onCountryChange(code);
              break;
            }
          }
        }
      }
    };

    return (
      <div className={cn("relative", className)}>
        <PhoneInput
          international
          countryCallingCodeEditable={false}
          defaultCountry="FR"
          value={value}
          onChange={handleChange}
          placeholder="Entrez votre numéro"
          className={error ? 'ring-2 ring-red-500 rounded-md' : ''}
          numberInputProps={{
            className: customInputStyle,
          }}
        />
        {error && (
          <p className="text-red-500 text-sm mt-1">{error}</p>
        )}
      </div>
    );
  }
);

InternationalPhoneInput.displayName = "InternationalPhoneInput";

export default InternationalPhoneInput;
