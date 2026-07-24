import { createContext, useContext, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@iconify/react";

const ToastContext = createContext(null);

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  const showToast = useCallback((message, type = "error") => {
    const id = ++idCounter;
    setToasts((prev) => [...prev, { id, message, type }]);
    timers.current[id] = setTimeout(() => dismiss(id), 10000);
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {createPortal(
        <div className="fixed bottom-4 right-4 z-100 flex flex-col gap-2 items-end">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-md shadow-lg text-xs font-semibold text-white max-w-xs
                ${t.type === "error" ? "bg-[#A32D2D]" : "bg-[#1B651B]"}`}
            >
              <Icon icon={t.type === "error" ? "mdi:alert-circle-outline" : "mdi:check-circle-outline"} width="18" height="18" className="shrink-0" />
              <span className="flex-1">{t.message}</span>
              <button onClick={() => dismiss(t.id)} className="shrink-0 opacity-80 hover:opacity-100">
                <Icon icon="mdi:close" width="16" height="16" />
              </button>
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}