"use client"

import Modal from '@/components/ui/modal';
import ResetPass from '@/forms/resetPasswordForm'

export default function ResetPasswordPage() {
  return (
    <div className='bg-imo-primary flex justify-center items-center min-h-screen '>
      <Modal isOpen={true} showBlur={true} locked={false} closeOnClickOutside={false} size='sm' title='Changer de mot de passe' onClose={() => ("")}>
        <ResetPass />
      </Modal>
    </div>
  );
}