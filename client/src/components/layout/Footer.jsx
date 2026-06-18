function Footer() {
  return(
    <footer className="h-30 bg-[#1B651B] mt-30 z-100 px-5 pt-3">
      <div className="grid grid-cols-2 px-30">
        <div className="flex flex-row items-center">
          <img className="w-10" src="/assets/images/Kabsupanion-Logo.png" alt="Logo" />
          <p className="font-bold text-[1.5rem] pl-2 text-white/70 font-['Roboto_Condensed']">Kabsupanion</p>
        </div>
        <div className="flex flex-row items-center justify-end cursor-pointer">
          <p className="text-xs text-white/70 hover:text-white transform duration-100 px-2">Task List</p>
          <span className="text-white/70 text-xs">|</span>
          <p className="text-xs text-white/70 hover:text-white transform duration-100 px-2">Class Schedule</p>
          <span className="text-white/70 text-xs">|</span>
          <p className="text-xs text-white/70 hover:text-white transform duration-100 px-2">Class Resources</p>
        </div>
      </div>
      <div className="border-t border-white/20 mt-2">
        <div className="max-w-6xl mt-3 mx-auto px-6 text-center text-xs text-white/70"> © {new Date().getFullYear()} Kabsupanion. All rights reserved.
          <p className="mt-1">This is a personal initiative project and not an official university system.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;