import { Icon } from "@iconify/react";
import { useUser } from "../../context/userContext";
import Button from "../ui/Button";
import { useNavigate, Link, useLocation } from "react-router-dom";
import UserIcon from "../common/UserIcon";
import LoadingScreen from "../ui/LoadingScreen";
import { useState } from "react";
import logo from "../../assets/images/Kabsupanion-Logo.png";
import { clearApiCache } from "../../utils/clearApiCache.js";
import posthog from "posthog-js";

const isPostHogConfigured = Boolean(
  import.meta.env.VITE_POSTHOG_KEY && import.meta.env.VITE_POSTHOG_HOST
);

function Sidebar() {
  const { student } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  const userSignOut = async () => {
    setLoading(true);
    localStorage.removeItem("token");
    if (isPostHogConfigured) posthog.reset();
    await clearApiCache();
    navigate("/", { replace: true });
  };

  const navItems = [
    ["Dashboard", "material-symbols:dashboard-outline", "/admin/dashboard"],
    ["Task List", "ix:tasks-all", "/admin/tasklist"],
    ["Class Schedule", "akar-icons:schedule", "/admin/schedule"],
    ["Class Resources", "grommet-icons:resources", "/admin/resources"],
    ["Class Subjects", "material-symbols:book-outline", "/admin/subjects"],
    ["Masterlist", "solar:list-bold", "/admin/masterlist"],
  ];

  if (loading) return <LoadingScreen />

  return (
    <div className="w-50 sticky top-0 h-screen bg-white border border-gray-200 p-2 flex flex-col">

      {/* TOP */}
      <div>
        <div className="flex items-center justify-center">
          <img src={logo} alt="Logo" className="w-7 rounded-md" />
          <p className="text-[1rem] font-bold ml-1 text-[#1B651B] font-['Roboto_Condensed']">Kabsupanion Admin</p>
        </div>

        <div className="border-t border-gray-300 mt-2"></div>

        {/* USER */}
        <div className="bg-[#1B651B] px-3 py-2 rounded-md flex items-center mt-5">
          <div className="bg-white/10 rounded-full p-1.5">
            <UserIcon typography="text-white/70" dimensions="w-5 h-5" />
          </div>

          <div className="ml-2 flex flex-col">
            <p className="font-bold text-[.9rem] text-white">
              {student?.user?.name?.split(" ").at(0)}{" "}
              {student?.user?.name?.split(" ").at(-1)}
            </p>
            <p className="uppercase text-[.6rem] font-medium text-white/70 flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full inline-block mr-2"></span>
              {student?.user?.role}
            </p>
          </div>
        </div>

        {/* NAV */}
        <ul className="mt-10 px-1">
          {navItems.map(([label, icon, route]) => {
            const isActive = location.pathname === route;

            return (
              <Link key={label} to={route}>
                <li
                  className={`mb-1 flex items-center p-2 rounded-md transition-all duration-200 active:scale-95
                  ${
                    isActive
                      ? "bg-[#1B651B] text-white"
                      : "text-[#828282] hover:border-l-4 hover:border-l-[#1B651B] hover:text-[#1B651B] hover:bg-[#f4f4f4]"
                  }`}
                >
                  <Icon className="mr-1" icon={icon} width="17" height="17" />
                  <p className="text-[.7rem] font-semibold">{label}</p>
                </li>
              </Link>
            );
          })}
        </ul>
      </div>

      {/* SIGN OUT */}
      <div className="mt-auto pt-2 border-t border-gray-300">
        <Button
          text={
            <>
              <Icon icon="gg:website" width="17" height="17" />
              <span className="ml-1">View as Student</span>
            </>
          }
          onClick={() => navigate("/student/dashboard")}
          bgColor="hover:bg-[#f4f4f4]"
          typography="text-[.7rem] font-bold text-[#828282] flex items-center hover:text-[#1B651B]"
          dimensions="w-full rounded-md"
          padding="p-2"
        />

        <Button
          text={
            <>
              <Icon icon="gridicons:sign-out" width="17" height="17" />
              <span className="ml-1">Sign Out</span>
            </>
          }
          onClick={userSignOut}
          bgColor="hover:bg-[#f4f4f4]"
          typography="text-[.7rem] font-bold text-[#828282] flex items-center hover:text-[#1B651B]"
          dimensions="w-full rounded-md"
          padding="p-2"
        />
      </div>
    </div>
  );
}

export default Sidebar;