import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export function LanguageDropdown() {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState("Fr");
  const ref = useRef<HTMLDivElement>(null);

  // Fermer le menu au clic extérieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative inline-block text-sm">
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-2 py-1 text-gray-700 hover:text-black"
      >
        {lang}
        <ChevronDown className="w-4 h-4" />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-20 rounded-md border bg-white shadow-md z-50">
          {["Fr", "En"].map((item) => (
            <button
              key={item}
              onClick={() => {
                setLang(item);
                setOpen(false);
              }}
              className="w-full px-3 py-2 text-left hover:bg-gray-100"
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
