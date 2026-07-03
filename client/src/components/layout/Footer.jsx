import Button from "../ui/Button";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="w-full bg-[#1B651B] mt-12 sm:mt-16 md:mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-2">

        {/* Upper Half */}
        <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-3 sm:gap-2 py-4 text-center sm:text-left">
          <div className="flex flex-row items-center min-w-0">
            <img className="w-9 sm:w-10 shrink-0" src="/assets/images/Kabsupanion-Logo.png" alt="Logo" />
            <p className="font-bold text-lg sm:text-xl md:text-[1.5rem] pl-2 text-white/70 font-['Roboto_Condensed'] truncate">
              Kabsupanion
            </p>
          </div>
          <nav className="flex flex-row flex-wrap items-center justify-center gap-y-1 cursor-pointer">
            <p
              onClick={() => document.getElementById("task-list")?.scrollIntoView()}
              className="text-xs text-white/70 hover:text-white transition-colors duration-100 px-2 whitespace-nowrap"
            >
              Task List
            </p>
            <span className="text-white/70 text-xs">|</span>
            <p
              onClick={() => document.getElementById("class-sched")?.scrollIntoView()}
              className="text-xs text-white/70 hover:text-white transition-colors duration-100 px-2 whitespace-nowrap"
            >
              Class Schedule
            </p>
            <span className="text-white/70 text-xs">|</span>
            <p
              onClick={() => document.getElementById("class-resources")?.scrollIntoView()}
              className="text-xs text-white/70 hover:text-white transition-colors duration-100 px-2 whitespace-nowrap"
            >
              Class Resources
            </p>
          </nav>
        </div>

        <div className="border-t border-white/20"></div>

        {/* Middle Half */}
        <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-4 sm:gap-2 py-4">
          <div>
            <a href="https://forms.gle/S7CdziBEMCq6DtEF6" target="_blank" rel="noreferrer">
              <Button
                text="Report a Problem"
                bgColor="bg-white/15"
                typography="text-white/70 text-xs whitespace-nowrap"
                dimensions="rounded-2xl border border-white/30"
                padding="px-4 py-1"
                animation="active:scale-95 transition-transform duration-200 hover:bg-white/20 hover:text-white"
              />
            </a>
          </div>
          <div className="flex flex-col items-center sm:items-end cursor-pointer">
            <p className="text-xs text-white/50 leading-3">Developers:</p>
            <div className="flex flex-row flex-wrap items-center justify-center sm:justify-end mt-1">
              <p className="text-xs text-white/50 hover:text-white transition-colors duration-100 px-2 whitespace-nowrap">
                Elijah Festin
              </p>
              <span className="text-white/50 text-xs">|</span>
              <p className="text-xs text-white/50 hover:text-white transition-colors duration-100 pl-2 whitespace-nowrap">
                Lorenz Tuboro
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-center py-2">
          <p className="text-xs text-white/70 text-center break-words">
            © {new Date().getFullYear()} Kabsupanion. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}

export default Footer;