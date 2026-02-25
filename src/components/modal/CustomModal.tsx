"use client"

import React, { useEffect, useRef, useCallback } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CustomModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode

  title?: string
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"
  showHeader?: boolean
  closeOnClickOutside?: boolean
  showBlur?: boolean
  rounded?: boolean
  contentClassName?: string;     
  dialogClassName?: string;      
}

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  "2xl": "max-w-6xl",
  full: "max-w-[95vw]"
}

export default function CustomModal({
  isOpen,
  onClose,
  children,
  title,
  size = "full",
  showHeader = true,
  closeOnClickOutside = true,
  showBlur = true,
  rounded = true
}: CustomModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    },
    [onClose]
  )

  useEffect(() => {
    if (!isOpen) return

    document.addEventListener("keydown", handleEscape)
    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "auto"
    }
  }, [isOpen, handleEscape])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">

      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-black/40 ${showBlur ? "backdrop-blur-sm" : ""}`}
        onClick={() => closeOnClickOutside && onClose()}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className={`
          relative w-full bg-white shadow-2xl
          ${sizeClasses[size]}
          ${rounded ? "rounded-2xl" : ""}
          max-h-[95vh]
          flex flex-col
          overflow-hidden
        `}
      >

        {/* Header optionnel */}
        {showHeader && (
          <div className="flex items-center justify-between px-6 py-5 border-b">
            <h2 className="text-xl font-semibold text-slate-900">
              {title}
            </h2>

            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        )}

        {/* Contenu */}
        <div className="w-full h-[90vh] overflow-auto">
          {children}
        </div>

      </div>
    </div>
  )
}