import { Icon } from "@iconify/react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/userContext";
import Button from "../../components/ui/Button";
import UserIcon from "../common/UserIcon";

function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { student } = useUser();

  const userSignOut = () => {
    setDropdownOpen(false);
    localStorage.removeItem("token");
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
    <header className="w-full border-b border-gray-200 bg-white">
      <nav className="flex items-center justify-between gap-2 p-3 px-4 sm:px-5 md:px-7">

        {/* LOGO */}
        <div className="flex items-center min-w-0 shrink">
          <img
            className="w-8 sm:w-9 md:w-10 shrink-0"
            src="/assets/images/Kabsupanion-Logo.png"
            alt="Logo"
          />
          <p className="font-bold text-base sm:text-xl md:text-[1.5rem] pl-2 text-[#1B651B] font-['Roboto_Condensed'] truncate">
            Kabsupanion
          </p>
        </div>

        {/* PROFILE */}
        <div className="relative shrink-0" ref={dropdownRef}>
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setDropdownOpen((prev) => !prev)}
          >
            <div className="bg-gray-200 rounded-full p-1.5 shrink-0">
              <UserIcon typography="text-gray-400" dimensions="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="flex flex-col text-[#3a3a3a88] font-bold leading-4 min-w-0 max-w-[6rem] sm:max-w-[10rem] md:max-w-[14rem]">
              <p className="uppercase text-xs sm:text-sm truncate">{student?.user?.name}</p>
              <p className="text-[.65rem] sm:text-xs truncate">{student?.user?.studentNumber}</p>
            </div>
            <Icon
              icon="mdi:chevron-down"
              className={`hidden sm:block text-gray-400 shrink-0 transition-transform duration-150 ${dropdownOpen ? "rotate-180" : ""}`}
              width="18"
              height="18"
            />
          </div>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 sm:w-44 bg-white text-[#1B651B] rounded-lg shadow-lg z-20 text-center">
              <Button
                text={
                  <>
                    <Icon icon="gridicons:sign-out" width="22" height="22" className="shrink-0" />
                    <span className="ml-2 whitespace-nowrap">Sign Out</span>
                  </>
                }
                onClick={userSignOut}
                bgColor=""
                typography="text-sm font-bold text-[#1B651B] flex items-center justify-center"
                dimensions="w-full rounded-md"
                padding="px-5 py-2"
                animation="active:scale-95 transition-transform duration-100 hover:bg-gray-100"
              />
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;