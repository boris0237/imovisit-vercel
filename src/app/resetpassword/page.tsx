"use client"

import { Suspense } from "react"
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import ResetPass from '@/forms/resetPasswordForm'

export default function ResetPasswordPage() {
  return (
    <div>
      <Header />

      <Suspense fallback={<div>Chargement...</div>}>
        <ResetPass />
      </Suspense>

      <Footer />
    </div>
  )
}