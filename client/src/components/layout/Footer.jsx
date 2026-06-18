import Button from "../ui/Button";

function Footer() {
  return(
    <footer className="h-40 bg-[#1B651B] mt-20 z-100 p-5">

      {/* Upper Half */}
      <div className="grid grid-cols-2 px-30">
        <div className="flex flex-row items-center">
          <img className="w-10" src="/assets/images/Kabsupanion-Logo.png" alt="Logo" />
          <p className="font-bold text-[1.5rem] pl-2 text-white/70 font-['Roboto_Condensed']">Kabsupanion</p>
        </div>
        <div className="flex flex-row items-center justify-end cursor-pointer">
          <p onClick={() => document.getElementById("task-list")?.scrollIntoView()} className="text-xs text-white/70 hover:text-white transform duration-100 px-2">Task List</p>
          <span className="text-white/70 text-xs">|</span>
          <p onClick={() => document.getElementById("class-sched")?.scrollIntoView()}  className="text-xs text-white/70 hover:text-white transform duration-100 px-2">Class Schedule</p>
          <span className="text-white/70 text-xs">|</span>
          <p  onClick={() => document.getElementById("class-resources")?.scrollIntoView()} className="text-xs text-white/70 hover:text-white transform duration-100 px-2">Class Resources</p>
        </div>
      </div>

      <div className="border-t border-white/20 my-5"></div>

      {/* Lower Half */}
      <div className="grid grid-cols-3 px-30">
        <div className="flex items-center">
          <Button text="Send Feedback" BGColor="bg-white/15 hover:bg-white/20" typography="text-white/70 text-sm hover:text-white" dimensions="rounded-2xl border border-white/30" padding="px-4 py-1" animation="transtion-all duration-200"/>
        </div>
        <div className="flex flex-col items-center text-center"> 
          <p className="text-xs text-white/70">© {new Date().getFullYear()} Kabsupanion. All rights reserved.</p>
          <p className="mt-1 text-xs text-white/70">This is a personal initiative project and not an official university system.</p>
        </div>
        <div className="flex flex-col items-end justify-center cursor-pointer">
          <p className="text-xs text-white/50 hover:text-white transform duration-100 px-2">Developers:</p>
          <div className="flex flex-row">
            <p className="text-xs text-white/50 hover:text-white transform duration-100 px-2 ">Elijah Festin</p>
            <span className="text-white/50 text-xs">|</span>
            <p className="text-xs text-white/50 hover:text-white transform duration-100 px-2 ">Lorenz Tuboro</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;