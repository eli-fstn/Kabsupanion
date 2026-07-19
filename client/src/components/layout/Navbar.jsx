import { Icon } from "@iconify/react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/userContext";
import Button from "../../components/ui/Button";
import UserIcon from "../common/UserIcon";
import DarkModeToggle from "../../components/ui/DarkModeToggle";
import logo from "../../assets/images/Kabsupanion-Logo.png";
import { clearApiCache } from "../../utils/clearApiCache.js";

function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { student } = useUser();

  const userSignOut = async () => {
    setDropdownOpen(false);
    localStorage.removeItem("token");
    await clearApiCache();
    navigate("/", { replace: true });
  }

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };

  }, []);


  return (
    <header className="w-full border-b border-gray-200 dark:border-[#444444] bg-white dark:bg-[#1a1a1a] transition-colors duration-300">
      <nav className="flex items-center justify-between gap-2 p-3 px-4 sm:px-5 md:px-7">

        {/* LEFT SIDE: Logo + Name */}
        <div className="flex items-center min-w-0 shrink">
          <img
            className="w-7 sm:w-8 md:w-9 shrink-0 rounded-md"
            src={logo}
            alt="Kabsupanion Logo"
          />
          <p className="font-bold text-xl md:text-[1.5rem] pl-2 text-[#1B651B] dark:text-[#56e556] font-['Roboto_Condensed'] truncate">
            Kabsupanion
          </p>
        </div>

        {/* RIGHT SIDE: dark mode toggle + profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <DarkModeToggle />

          <div className="relative shrink-0" ref={dropdownRef}>
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setDropdownOpen((prev) => !prev)}
            >
              <div className="bg-gray-100 dark:bg-[#444444] rounded-full p-1.5 shrink-0">
                <UserIcon typography="text-gray-600 dark:text-gray-300" dimensions="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="flex flex-col text-[#3a3a3a88] dark:text-gray-300 font-bold leading-4 min-w-0 max-w-24 sm:max-w-40 md:max-w-56">
                <p className="uppercase text-xs sm:text-sm truncate">{student?.user?.name}</p>
                <p className="text-[.65rem] sm:text-xs truncate">{student?.user?.studentNumber}</p>
              </div>
              <Icon
                icon="mdi:chevron-down"
                className={`hidden sm:block text-gray-400 dark:text-gray-500 shrink-0 transition-transform duration-150 ${dropdownOpen ? "rotate-180" : ""}`}
                width="18"
                height="18"
              />
            </div>

            <div
              className={`absolute right-0 mt-2 bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-[#1a1a1a] rounded-lg shadow-lg z-20 transition-all duration-200 ease-out origin-top-right
                ${dropdownOpen
                  ? "opacity-100 scale-100 pointer-events-auto"
                  : "opacity-0 scale-0 pointer-events-none"
                }`}
            >
              {student.user.role === "admin" && 
                <Button
                  text={
                    <>
                      <Icon icon="gg:website" className="shrink-0 w-5 h-5 text-[#1B651B] dark:text-[#56e556] mr-2" />
                      View as Admin
                    </>
                  }
                  onClick={() => navigate(-1)}
                  bgColor=""
                  typography="text-sm font-bold text-[#1B651B] dark:text-[#56e556] flex items-center justify-center whitespace-nowrap"
                  dimensions="w-full rounded-md"
                  padding="px-5 py-2"
                  animation="transition duration-100 hover:bg-gray-100 dark:hover:bg-[#555555]"
                />
              }
              <Button
                text={
                  <>
                    <Icon icon="gridicons:sign-out" className="shrink-0 w-5 h-5 text-[#1B651B] dark:text-[#56e556] mr-2" />
                    Sign Out
                  </>
                }
                onClick={userSignOut}
                bgColor=""
                typography="text-sm font-bold text-[#1B651B] dark:text-[#56e556] flex items-center justify-center whitespace-nowrap"
                dimensions="w-full rounded-md"
                padding="px-5 py-2"
                animation="transition duration-100 hover:bg-gray-100 dark:hover:bg-[#555555]"
              />
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;