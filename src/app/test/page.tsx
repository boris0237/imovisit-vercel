"use client";

import MyAvalability from '@/forms/availabilityForm'
import Modal from '@/components/ui/modal'

export default function test() {
  return (
    <Modal title='Definissez vos créneaux horaires réguliers' isOpen={true} closeOnClickOutside={false} onClose={() => {}} rounded={false} locked={false} >
        <MyAvalability />
    </Modal>
  );
}