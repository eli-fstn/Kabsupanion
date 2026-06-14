import { useEffect, useRef } from "react";

function Modal({ dimensions, margins, title, text, isOpen, onClose }) {

  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-10 bg-black/40 flex justify-center items-center">
      <div ref={modalRef} className={`bg-white rounded-xl p-6 ${margins} ${dimensions}`}>
        <p className="font-bold text-lg">{title}</p>
        <p className="text-gray-600">{text}</p>
      </div>

    </div>
  );
}

export default Modal;