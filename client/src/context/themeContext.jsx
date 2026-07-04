import { createContext, useContext, useState, useEffect, useCallback } from "react";

const ThemeContext = createContext(null);

const STORAGE_KEY = "kabsupanion-theme";

function getInitialTheme() {
  if (typeof window === "undefined") return false;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored) return stored === "dark";
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
}

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(getInitialTheme);

  // Keep the <html> class and localStorage in sync with state.
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    window.localStorage.setItem(STORAGE_KEY, darkMode ? "dark" : "light");
  }, [darkMode]);

  /**
   * Toggles the theme with a circular "wipe" animation that expands
   * outward from the point the user clicked (e.g. the toggle button).
   * Falls back to an instant switch on browsers without View Transitions
   * support, or for users who've asked for reduced motion.
   */
  const toggleDarkMode = useCallback((event) => {
    const x = event?.clientX ?? window.innerWidth / 2;
    const y = event?.clientY ?? window.innerHeight / 2;

    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const prefersReducedMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (!document.startViewTransition || prefersReducedMotion) {
      setDarkMode((prev) => !prev);
      return;
    }

    const transition = document.startViewTransition(() => {
      setDarkMode((prev) => !prev);
    });

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 600,
          easing: "ease-in-out",
          pseudoElement: "::view-transition-new(root)",
        }
      );
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}