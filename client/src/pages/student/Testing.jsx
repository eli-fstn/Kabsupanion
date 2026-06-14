import { useState } from "react";
import Button from "../../components/Button";
import Modal from "../../components/Modal";

function Testing() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Button onClick={() => setModalOpen(true)} text="Enter" typography="text-white font-bold" dimensions="px-6 py-2" BGColor="bg-red-400"/>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Hello!" text="This is a modal."/>
    </div>
  );
}

export default Testing;