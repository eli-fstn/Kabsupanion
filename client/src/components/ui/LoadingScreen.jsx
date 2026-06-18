import { Icon } from "@iconify/react";

function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col justify-center items-center ">
      <img src="/assets/images/Kabsupanion-Logo.png" width="80" alt=""></img>
      <div className="flex flex-row items-center gap-2 mt-3">
        <Icon icon="gg:spinner" width="30" className="text-[#1B651B] animate-spin" />
        <p className="text-[#49494988] text-sm">Please wait for a moment.</p>
      </div>
    </div>
  );
}

export default LoadingScreen