import { Icon } from "@iconify/react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMe } from "../../services/auth";
import Button from "../../components/ui/Button";

function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);

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

  useEffect(() => {
  const fetchMe = async () => {
    try {
      const data = await getMe();
      setStudent(data);
    } catch (error) {
      console.log(error);
      localStorage.removeItem("token");
      navigate("/", { replace: true });
    }
  };

  fetchMe();
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
          <div className="bg-gray-200 hover:bg-[#5adb00] rounded-full p-1.5 transition-colors duration-200">
            <Icon className="text-gray-400 hover:text-[#1B651B] transition-colors duration-200" icon="akar-icons:person" width="25" height="25" />
          </div>
          <div className="flex flex-col text-[#3a3a3a88] font-bold leading-4">
            <div>
              <p className="uppercase">{student?.user.name}</p>
              <p className="text-[.7rem]">{student?.user.studentNumber}</p>
            </div>
          </div>
        </div>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-35 bg-white text-[#1B651B] rounded-lg shadow-lg z-10 text-center">
            <Button onClick={userSignOut}>
              <span className="active:scale-95 transition-transform duration-100 hover:bg-gray-100 text-sm font-bold text-[#1B651B] flex items-center px-5 py-2 w-full rounded-md">
                <Icon icon="gridicons:sign-out" width="25" height="25" />
                <span className="ml-2">Sign Out</span>
              </span>
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;