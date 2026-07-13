import { Icon } from "@iconify/react";
import logo from "../../assets/images/Kabsupanion-Logo.png";

function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col justify-center items-center ">
      <img className="rounded-md" src={logo} width="80" alt="Kabsupanion Logo"></img>
      <div className="flex flex-row items-center gap-2 mt-3">
        <Icon icon="svg-spinners:3-dots-rotate" width="30" className="text-[#1B651B]" />
        <p className="text-[#49494988] text-sm">Please wait for a moment.</p>
      </div>
    </div>
  );
}

export default LoadingScreen