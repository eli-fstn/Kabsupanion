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
    <nav className="flex items-center border border-gray-200 justify-between bg-white p-3 px-7">

      {/* LOGO */}
      <div className="flex items-center">
        <img className="w-10" src="/assets/images/Kabsupanion-Logo.png" alt="Logo" />
        <p className="font-bold text-[1.5rem] pl-2 text-[#1B651B] font-['Roboto_Condensed']">Kabsupanion</p>
      </div>

      {/* PROFILE */}
      <div className="relative" ref={dropdownRef}>
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setDropdownOpen((prev) => !prev)}>
          <div className="bg-gray-200 rounded-full p-1.5">
            <UserIcon typography="text-gray-400" dimensions="w-6 h-6" />
          </div>
          <div className="flex flex-col text-[#3a3a3a88] font-bold leading-4">
            <div>
              <p className="uppercase text-sm">{student?.user?.name}</p>
              <p className="text-xs">{student?.user?.studentNumber}</p>
            </div>
          </div>
        </div>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-35 bg-white text-[#1B651B] rounded-lg shadow-lg z-10 text-center">
            <Button
              text={
                <>
                  <Icon icon="gridicons:sign-out" width="25" height="25" />
                  <span className="ml-2">Sign Out</span>
                </>
              }
              onClick={userSignOut}
              bgColor=""
              typography="text-sm font-bold text-[#1B651B] flex items-center"
              dimensions="w-full rounded-md"
              padding="px-5 py-2"
              animation="active:scale-95 transition-transform duration-100 hover:bg-gray-100"
            />
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;