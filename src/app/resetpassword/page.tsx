"use client"

import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import ResetPass from '@/forms/resetPasswordForm'

export default function ResetPasswordPage() {
  return (

        <div>
          <Header />
              <ResetPass />
          <Footer />
      </div>
  );
}