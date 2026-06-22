import { useEffect, useRef } from "react";

function getScrollbarWidth() {
  return window.innerWidth - document.documentElement.clientWidth;
}

function Modal({ isOpen, onClose, children }) {

  const modalRef = useRef(null);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const originalPointerEvents = document.body.style.pointerEvents;

    if (isOpen) {
      const scrollbarWidth = getScrollbarWidth();
      document.body.style.overflow = "hidden";
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
      document.body.style.pointerEvents = "none";
    } else {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
      document.body.style.pointerEvents = originalPointerEvents;
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
      document.body.style.pointerEvents = originalPointerEvents;
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
  <div className="fixed inset-0 z-1000 bg-black/70 flex justify-center items-center" style={{ pointerEvents: "all" }} >
    <div ref={modalRef} className="bg-white rounded-xl p-3" style={{ pointerEvents: "all" }}>
      {children}
    </div>
  </div>
);
}

export default Modal;