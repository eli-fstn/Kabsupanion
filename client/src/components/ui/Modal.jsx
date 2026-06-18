import { useEffect, useRef } from "react";

function Modal({ isOpen, onClose, children }) {

  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.pointerEvents = "none"; 
    } else {
      document.body.style.overflow = "";
      document.body.style.pointerEvents = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.pointerEvents = "";
    };
  }, [isOpen]);

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
  <div className="fixed inset-0 z-1000 bg-black/40 flex justify-center items-center" style={{ pointerEvents: "all" }} >
    <div ref={modalRef} className="bg-white rounded-xl p-3" style={{ pointerEvents: "all" }}>
      {children}
    </div>
  </div>
);
}

export default Modal;