import Button from "../ui/Button";

function Footer() {
  return(
    <footer className="bg-[#1B651B] mt-20 p-2">

      {/* Upper Half */}
      <div className="flex items-center justify-between px-30 py-4">
        <div className="flex flex-row items-center">
          <img className="w-10" src="/assets/images/Kabsupanion-Logo.png" alt="Logo" />
          <p className="font-bold text-[1.5rem] pl-2 text-white/70 font-['Roboto_Condensed']">Kabsupanion</p>
        </div>
        <div className="flex flex-row items-center cursor-pointer">
          <p onClick={() => document.getElementById("task-list")?.scrollIntoView()} className="text-xs text-white/70 hover:text-white transition-colors duration-100 px-2">Task List</p>
          <span className="text-white/70 text-xs">|</span>
          <p onClick={() => document.getElementById("class-sched")?.scrollIntoView()} className="text-xs text-white/70 hover:text-white transition-colors duration-100 px-2">Class Schedule</p>
          <span className="text-white/70 text-xs">|</span>
          <p onClick={() => document.getElementById("class-resources")?.scrollIntoView()} className="text-xs text-white/70 hover:text-white transition-colors duration-100 px-2">Class Resources</p>
        </div>
      </div>

      <div className="border-t border-white/20 mx-30"></div>

      {/* Middle Half */}
      <div className="flex items-center justify-between px-30 py-4">
        <div>
          <Button
            text="Send Feedback"
            bgColor="bg-white/15"
            typography="text-white/70 text-sm"
            dimensions="rounded-2xl border border-white/30"
            padding="px-4 py-1"
            animation="active:scale-95 transition-transform duration-200 hover:bg-white/20 hover:text-white"
          />
        </div>
        <div className="flex flex-col items-end cursor-pointer">
          <p className="text-xs text-white/50">Developers:</p>
          <div className="flex flex-row items-center mt-1">
            <p className="text-xs text-white/50 hover:text-white transition-colors duration-100 px-2">Elijah Festin</p>
            <span className="text-white/50 text-xs">|</span>
            <p className="text-xs text-white/50 hover:text-white transition-colors duration-100 pl-2">Lorenz Tuboro</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <p className="text-xs text-white/70">© {new Date().getFullYear()} Kabsupanion. All rights reserved.</p>
      </div>

    </footer>
  );
}

export default Footer;