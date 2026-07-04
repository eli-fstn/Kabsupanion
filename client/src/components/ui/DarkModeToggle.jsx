import { Icon } from "@iconify/react";
import { useTheme } from "../../context/themeContext";

function DarkModeToggle() {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <button
      type="button"
      onClick={(e) => toggleDarkMode(e)}
      aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={darkMode}
      className="relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 shrink-0 rounded-full bg-gray-100 dark:bg-[#444444] text-gray-600 dark:text-yellow-300 hover:bg-gray-200 dark:hover:bg-[#555555] transition-colors duration-200 active:scale-90"
    >
      <Icon icon={darkMode ? "ph:sun-bold" : "ph:moon-bold"} width="16" height="16" />
    </button>
  );
}

export default DarkModeToggle;