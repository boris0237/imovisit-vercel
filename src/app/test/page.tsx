'use client';

import React, { forwardRef } from 'react';
import PhoneInput from 'react-phone-number-input'; // ← Import sans E164Number
import 'react-phone-number-input/style.css';
import { cn } from "@/lib/utils";

interface InternationalPhoneInputProps {
  value?: string;
  onChange?: (value: string) => void;
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
  ({ value, onChange, error, className }, ref) => {
    // Fonction wrapper pour gérer la conversion de types
    const handleChange = (newValue: string | undefined) => {
      onChange?.(newValue || '');
    };

    return (
      <div className={cn("relative", className)}>
        <PhoneInput
          international
          countryCallingCodeEditable={false}
          defaultCountry="CM"
          value={value} // ← Pas besoin de conversion
          onChange={handleChange} // ← Utilisation du wrapper avec string
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
