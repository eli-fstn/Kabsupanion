import { useState } from "react";
import Button from "../../components/Button";
import Modal from "../../components/Modal";

function Testing() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Button onClick={() => setModalOpen(true)} text="Enter" typography="text-white font-bold" dimensions="px-6 py-2" BGColor="bg-red-400"/>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="text-center">
          <h1 className="text-2xl text-red-400">This is a modal</h1>
          <p>sample paragraph</p>
        </div>
      </Modal>
    </div>
  );
}

export default Testing;