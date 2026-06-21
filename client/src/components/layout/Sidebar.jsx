import { Icon } from "@iconify/react";
import { useUser } from "../../context/userContext";
import Button from "../ui/Button";
import { useNavigate, Link } from "react-router-dom";

function Sidebar() {
  const { student } = useUser();
  const navigate = useNavigate();

  const userSignOut = () => {
    localStorage.clear("token");
    navigate("/", { replace: true });
  }

  return (
  <div className="w-64 sticky top-0 h-screen bg-white border border-gray-200 min-h-screen p-3 flex flex-col">

    {/* TOP SECTION */}
    <div>
      <div className="flex items-center justify-center">
        <img src="/assets/images/Kabsupanion-Logo.png" alt="Logo" className="w-10" />
        <h2 className="text-[1.4rem] font-bold ml-2 text-[#1B651B] font-['Roboto_Condensed']">
          Kabsupanion Admin
        </h2>
      </div>

      {/* User Card */}
      <div className="bg-[#1B651B] px-3 py-2 rounded-md flex flex-row items-center mt-5 hover:shadow-lg transition-all duration-200">
        <div className="bg-white/10 rounded-full p-1.5">
          <Icon className="text-white/70" icon="akar-icons:person" width="25" height="25" />
        </div>

        <div className="ml-2 flex flex-col">
          <p className="font-bold text-[1rem] text-white">
            {student?.user?.name.split(" ").at(0)}{" "}
            {student?.user?.name.split(" ").at(-1)}
          </p>

          <p className="uppercase text-[.7rem] font-medium text-white/70 flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full inline-block mr-2"></span>
            {student?.user?.role}
          </p>
        </div>
      </div>

      {/* NAV */}
      <ul className="mt-10 px-2">
        {[
          ["Dashboard", "material-symbols:dashboard-outline", "/admin/dashboard"],
          ["Task List", "ix:tasks-all", "/admin/tasklist"],
          ["Class Schedule", "akar-icons:schedule", "/admin/schedule"],
          ["Class Resources", "grommet-icons:resources", "/admin/resources"],
          ["Class Subjects", "material-symbols:book-outline", "/admin/subjects"],
          ["Masterlist", "solar:list-bold", "/admin/masterlist"],
        ].map(([label, icon, route]) => (
          <Link key={label} to={route}>
            <li key={label} className="mb-2 flex items-center p-2 rounded-md transition-all duration-200 active:scale-95 hover:border-l-4 hover:border-l-[#1B651B] hover:text-[#1B651B] hover:bg-[#f4f4f4] text-[#828282]">
              <Icon className="mr-2" icon={icon} width="22" height="22" />
              <p className="text-[.9rem] font-semibold">
                {label}
              </p>
            </li>
          </Link>
        ))}
      </ul>
    </div>

    {/* BOTTOM SECTION (SIGN OUT) */}
    <div className="mt-auto pt-4 border-t border-gray-200">
      <Button
        text={
          <>
            <Icon icon="gridicons:sign-out" width="22" height="22" />
            <span className="ml-2">Sign Out</span>
          </>
        }
        onClick={userSignOut}
        bgColor="hover:bg-[#f4f4f4]"
        typography="text-sm font-bold text-[#828282] flex items-center hover:text-[#1B651B] transition-colors duration-200"
        dimensions="w-full rounded-md"
        padding="p-2"
        animation="active:scale-95 transition-transform duration-100"
      />
    </div>
  </div>
);
}

export default Sidebar;