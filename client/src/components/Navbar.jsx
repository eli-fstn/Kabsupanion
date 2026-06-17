import { Icon } from "@iconify/react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMe } from "../services/auth";

function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const [student, setStudent] = useState([]);

  const userSignOut = () => {
    setDropdownOpen(false);
    localStorage.removeItem("token");
    navigate("/");
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

    const fetchMe = async () => {
      try {
        const data = await getMe();
        setStudent(data);
      } catch (error) {
        console.log(error);
      } 
    }

    fetchMe();
  }, []);

  return (
    <div className="flex items-center justify-between bg-[#1B651B] p-3 px-7">

      {/* LOGO */}
      <div className="flex items-center">
        <img className="w-10" src="/assets/CvSU-logo.png" alt="Logo" />
        <p className="font-bold text-xl pl-3 text-white">MyKabsupanion</p>
      </div>

      {/* PROFILE */}
      <div className="relative" ref={dropdownRef}>
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setDropdownOpen((prev) => !prev)}>
          <div className="bg-gray-200 rounded-full p-1.5">
            <Icon className="text-gray-400" icon="akar-icons:person" width="25" height="25" />
          </div>
          <div className="flex flex-col text-[#E5E5E5] font-bold leading-4">
            {student.map((s, i) => (
              <div key={i}>
                <p className="uppercase">{s.studentName}</p>
                <p className="text-[.7rem]">{s.studentNumber}</p>
              </div>
            ))}
          </div>
        </div>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-fit bg-white text-gray-400 rounded-lg shadow-lg z-10">
            <button onClick={userSignOut} className="flex items-center w-full text-left px-4 py-2 text-sm font-bold hover:bg-gray-100 rounded-lg"><Icon className="mr-2" icon="gridicons:sign-out" width="25" height="25" />Sign Out</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Navbar;