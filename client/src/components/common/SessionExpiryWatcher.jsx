import { useEffect, useRef } from "react";
import { jwtDecode } from "jwt-decode";
import { useToast } from "../../context/toastContext";

const WARNING_TIME = 5 * 60 * 1000;

export default function SessionExpiryWatcher() {
  const hasWarned = useRef(false);
  const { showToast } = useToast();

  useEffect(() => {
    const checkExpiry = () => {
      const token = localStorage.getItem("token");

      if (!token) return;

      try {
        const { exp } = jwtDecode(token);

        if (!exp) return;

        const expiresAt = exp * 1000;
        const msLeft = expiresAt - Date.now();

        if (msLeft <= 0) {
          hasWarned.current = false;
          return;
        }

        if (msLeft <= WARNING_TIME && !hasWarned.current) {
          hasWarned.current = true;

          showToast(
            "Your session will expire in less than 5 minutes.",
            "error"
          );
        }
      } catch {
      }
    };

    checkExpiry();

    const interval = setInterval(checkExpiry, 60 * 1000);

    return () => clearInterval(interval);
  }, [showToast]);

  return null;
}