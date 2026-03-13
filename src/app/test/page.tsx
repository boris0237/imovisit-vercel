"use client";

import MyAvalability from '@/forms/availabilityForm'
import Modal from '@/components/ui/modal'
import UpdateRegister from '@/forms/updateRegister';

export default function test() {
  return (
    <Modal title=' ' isOpen={true} closeOnClickOutside={false} onClose={() => {}} rounded={false} locked={false} >
        <UpdateRegister />
    </Modal>
  );
}