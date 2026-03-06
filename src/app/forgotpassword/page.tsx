"use client"

import Modal from '@/components/ui/modal';
import ForgotPass from '@/forms/forgotPasswordForm'

export default function UpdateRegister() {
  return (
    <div className='bg-imo-primary flex justify-center items-center min-h-screen '>
      <Modal isOpen={true} showBlur={true} locked={false} closeOnClickOutside={false} title=' ' size='sm' onClose={() => ("")}>
        <ForgotPass />
      </Modal>
    </div>
  );
}