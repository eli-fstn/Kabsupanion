import Button from "../ui/Button";
import { Link } from "react-router-dom";
import logo from "../../assets/images/Kabsupanion-Logo.png";
import Modal from "../../components/ui/Modal";
import { useState } from "react";
import Card from "../ui/Card";
import FrontEndDev from "../../assets/images/Elijah.jpg"
import BackEndDev from "../../assets/images/Lorenz.png"
import { Icon } from "@iconify/react";
import { useInstallPrompt } from "../../hooks/useInstallPrompt";

function Footer() {
  const [modalOpen, setModalOpen] = useState(false);
  const [developerModalOpen, setDeveloperModalOpen] = useState(false);
  const { isInstallable, promptInstall } = useInstallPrompt();

  return (
    <footer className="w-full bg-[#1f761f] dark:bg-[#0f3d0f] mt-12 sm:mt-16 md:mt-20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">

        <div className="grid grid-cols-2 md:grid-cols-[3fr_1fr_1fr_1fr] items-start justify-items-start gap-8 md:gap-7 px-12 lg:px-20 py-8 md:py-10">
          <div className="flex flex-col items-start col-span-2 md:col-span-1">
            <div className="flex flex-row items-center min-w-0">
              <img className="w-8 sm:w-9 shrink-0 rounded-md" src={logo} alt="Kabsupanion Logo" />
              <p className="font-bold text-lg sm:text-xl md:text-[1.5rem] pl-2 text-white/70 font-['Roboto_Condensed'] truncate">
                Kabsupanion
              </p>
            </div>

            <p className="text-white/70 text-start text-sm w-full max-w-xs sm:max-w-sm my-5">A centralized, accessible platform built to support students' everyday academic needs.</p>

            <div>
              <a href="https://forms.gle/S7CdziBEMCq6DtEF6" target="_blank" rel="noreferrer">
                <Button
                  text="Report a Problem"
                  bgColor="bg-white/15"
                  typography="text-white/70 text-xs whitespace-nowrap cursor-pointer"
                  dimensions="rounded-2xl border border-white/30"
                  padding="px-4 py-1"
                  animation="active:scale-95 transition duration-200 hover:bg-white/20 hover:text-white"
                />
              </a>
            </div>
            {isInstallable &&
              <div className="mt-5">
                <Button
                  text="Install Kabsupanion"
                  bgColor="bg-white/15"
                  typography="text-white/70 text-xs whitespace-nowrap cursor-pointer"
                  dimensions="rounded-2xl border border-white/30"
                  padding="px-4 py-1"
                  animation="active:scale-95 transition duration-200 hover:bg-white/20 hover:text-white"
                  onClick={promptInstall}
                />
              </div>
            }
          </div>

          <div className="flex flex-col items-start gap-3 cursor-pointer">
            <p className="uppercase text-white/70 text-xs font-bold">Explore</p>
            <p onClick={() => document.getElementById("task-list")?.scrollIntoView()} className="text-sm text-white/70 hover:text-white transition hover:translate-x-1 duration-200 whitespace-nowrap font-medium mt-1 sm:mt-3">Task List</p>
            <p onClick={() => document.getElementById("class-sched")?.scrollIntoView()} className="text-sm text-white/70 hover:text-white transition hover:translate-x-1 duration-200 whitespace-nowrap font-medium">Class Schedule</p>
            <p onClick={() => document.getElementById("class-resources")?.scrollIntoView()} className="text-sm text-white/70 hover:text-white transition hover:translate-x-1 duration-200 whitespace-nowrap font-medium">Class Resources</p>
          </div>

          <div className="flex flex-col items-start gap-3 cursor-pointer">
            <p className="uppercase text-white/70 text-xs font-bold">Support</p>
            <p className="text-sm text-white/70 hover:text-white transition hover:translate-x-1 duration-200 whitespace-nowrap font-medium mt-1 sm:mt-3" onClick={() => setModalOpen(true)}>User Guide</p>
            <a href="https://forms.gle/s3dmcZLPDo34v2hWA" target="_blank" rel="noreferrer">
              <p className="text-sm text-white/70 hover:text-white transition hover:translate-x-1 duration-200 whitespace-nowrap font-medium">Feedback</p>
            </a>
          </div>

          <div className="flex flex-col items-start gap-3 cursor-pointer">
            <p className="uppercase text-white/70 text-xs font-bold">Developers</p>
            <p className="text-sm text-white/70 hover:text-white transition hover:translate-x-1 duration-200 whitespace-nowrap font-medium mt-1 sm:mt-3" onClick={() => setDeveloperModalOpen(true)}>Meet the team</p>
          </div>
        </div>

        <div className="flex flex-col justify-center px-4 py-2">
          <p className="text-sm sm:text-md font-[amaranth] text-white/70 dark:text-white/80 text-center wrap-break-word mb-3"><em>"Mula sa Kabsuhenyo, para sa Kabsuhenyo."</em></p>
          <p className="text-xs text-white/70 text-center wrap-break-word">
            &copy; {new Date().getFullYear()} Kabsupanion. Developed for academic purposes.
          </p>
        </div>
      </div>

      {/* USER GUIDE MODAL */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="flex justify-end">
          <Button
            onClick={() => setModalOpen(false)}
            bgColor="bg-transparent"
            typography="text-gray-400 hover:text-gray-600"
            padding="p-2 px-5"
            dimensions="rounded-md"
            animation="active:scale-95 transition-all duration-100"
            text={<Icon icon="mdi:close" className="text-2xl" />}
          />
        </div>
        <div className="w-full border-t border-t-gray-200 dark:border-t-[#2a2a2a]"></div>
        
        <div className="p-5 sm:p-8 w-80 sm:w-full max-w-lg sm:max-w-xl h-[60vh] sm:h-[85vh] md:h-150 overflow-y-auto space-y-5 bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100 rounded-xl">
          <p className="text-xl sm:text-[1.7rem] font-bold font-[montserrat] text-gray-900 dark:text-white">Getting Started</p>

          <section>
            <h2 className="text-lg sm:text-xl font-semibold sm:mt-7 font-[montserrat] text-gray-900 dark:text-gray-100">Install Kabsupanion</h2>

            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 mt-1">Installing Kabsupanion provides a faster, app-like experience and lets you access the platform directly from your device's home screen.
            </p>

            <div className="mt-3 sm:mt-5 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/40 p-4">
              <strong className="flex items-center text-xs mb-2 md:text-sm text-red-800 dark:text-red-300"><Icon icon="zondicons:exclamation-outline" className="mr-2" />Install Prompt Behavior</strong>

              <p className="text-xs md:text-sm text-red-800 dark:text-red-300"><strong>Note:</strong> The <strong>Install Kabsupanion</strong> button is only displayed when your browser determines that Kabsupanion is eligible for installation.
              </p>
            </div>

            <h4 className="font-medium mt-5 font-[montserrat] text-gray-900 dark:text-gray-100">Android &amp; Desktop</h4>
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 mt-1">On supported browsers, an Install button may appear in the footer, allowing you to install Kabsupanion. Browser support and availability may vary.
            </p>

            <h4 className="font-medium mt-5 font-[montserrat] text-gray-900 dark:text-gray-100">iPhone &amp; iPad (iOS/iPadOS)</h4>
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 mt-1">iOS does not support the Install button for PWAs. Instead, install Kabsupanion manually using Safari by following these steps:
            </p>

            <ol className="mt-2 text-xs md:text-sm list-decimal list-inside text-gray-600 dark:text-gray-300 space-y-1">
              <li>Open Kabsupanion using <strong>Safari</strong>.</li>
              <li>Tap the <strong>Share</strong> button.</li>
              <li>Scroll down and select <strong>Add to Home Screen</strong>.</li>
              <li>Review or edit the app name if desired.</li>
              <li>Tap <strong>Add</strong>.</li>
              <li>Launch Kabsupanion directly from your Home Screen.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-semibold mt-5 sm:mt-10 font-[montserrat] text-gray-900 dark:text-gray-100">Sign In</h2>
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 mt-1">Log in using your registered student account credentials. Once signed in, you will be redirected to your dashboard, where you can access the platform's available features.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-semibold mt-5 sm:mt-10 font-[montserrat] text-gray-900 dark:text-gray-100">Dashboard</h2>
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 mt-1">Your dashboard serves as the central hub for your academic activities. From here, you can access your tasks, class schedule, and shared learning resources.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl mt-5 sm:mt-10 font-semibold font-[montserrat] text-gray-900 dark:text-gray-100">Task List</h2>
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 mt-1">The <strong>Task List</strong> displays academic tasks and deadlines assigned by your section administrator. Use it to stay informed about upcoming requirements and keep track of your progress throughout the semester.
            </p>

            <h4 className="font-medium mt-3 sm:mt-5  font-[montserrat] text-gray-900 dark:text-gray-100">What You Can Do</h4>
            <ul className="mt-2 text-xs md:text-sm list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
              <li>View all assigned academic tasks and deadlines.</li>
              <li>Mark a task as completed by checking its checkbox.</li>
              <li>Use completed tasks as a personal reminder of your progress.</li>
            </ul>

            <div className="mt-3 sm:mt-5 rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/40 p-4">
              <p className="text-xs md:text-sm text-green-800 dark:text-green-300"><strong>Note:</strong> Tasks are created and managed by your section administrator. Students can only update the completion status of their own tasks.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-semibold mt-5 sm:mt-10 font-[montserrat] text-gray-900 dark:text-gray-100">Class Schedule</h2>

            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 mt-1">The <strong>Class Schedule</strong> provides a clear view of your weekly classes, making it easier to plan your day and stay on time.
            </p>

            <h4 className="font-medium mt-3 sm:mt-5 font-[montserrat] text-gray-900 dark:text-gray-100">Tips</h4>
            <ul className="mt-2 text-xs md:text-sm list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
              <li>Review your schedule before classes.</li>
              <li>Check for any schedule updates.</li>
              <li>Use it to prepare for upcoming subjects.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-semibold mt-5 sm:mt-10 font-[montserrat] text-gray-900 dark:text-gray-100">Class Resources</h2>

            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 mt-1">The <strong>Class Resources</strong> section allows students to share and access learning materials within their section, including lecture notes, reviewers, presentations, and other academic references.
            </p>

            <h4 className="font-medium mt-3 sm:mt-5 font-[montserrat] text-gray-900 dark:text-gray-100">What You Can Do</h4>
            <ul className="mt-2 text-xs md:text-sm list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
              <li>Browse shared learning materials.</li>
              <li>Preview supported files before downloading.</li>
              <li>Upload your own academic resources for your section.</li>
              <li>Download resources shared by other students.</li>
            </ul>

            <div className="mt-3 sm:mt-5 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-4">
              <p className="text-xs md:text-sm text-amber-800 dark:text-amber-300"><strong>Review Process:</strong> Resources uploaded by students are placed in a <strong>Pending</strong> state and reviewed by a section administrator before becoming available to everyone. This helps ensure that all shared materials are relevant, appropriate, and intended for academic use.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-semibold mt-5 sm:mt-10 font-[montserrat] text-gray-900 dark:text-gray-100">Best Practices</h2>

            <ul className="text-xs md:text-sm list-disc list-inside mt-2 text-gray-600 dark:text-gray-300 space-y-1">
              <li>Check Kabsupanion regularly for updates.</li>
              <li>Stay on top of your academic tasks and deadlines.</li>
              <li>Make use of shared learning resources.</li>
              <li>Use the platform responsibly and respectfully.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-semibold mt-5 sm:mt-10 font-[montserrat] text-gray-900 dark:text-gray-100">Need Help?</h2>

            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 mt-1">If you encounter technical issues, notice incorrect information, or have suggestions for improving Kabsupanion, use the <strong>Report a Problem</strong> button or Feedback located in the footer to let us know.
            </p>
          </section>

          <div className="border-t border-gray-200 dark:border-[#2a2a2a] pt-5">
            <p className="text-center text-gray-500 dark:text-gray-400 text-xs md:text-sm">Thank you for using <strong>Kabsupanion</strong>! We hope it helps make your academic journey more organized, productive, and connected.
              <br /> <br />
              <em className="text-xs">— The Kabsupanion Development Team</em>
            </p>
          </div>
        </div>
      </Modal>

      {/* DEVELOPERS MODAL */}
      <Modal isOpen={developerModalOpen} onClose={() => setDeveloperModalOpen(false)}>
        <div className="p-4 sm:p-5 w-full max-w-md sm:max-w-lg">
          <div className="mb-5 text-center">
            <p className="text-base sm:text-[1.3rem] text-gray-900 dark:text-white font-[montserrat]">
              The people behind{" "}
              <span className="font-bold text-lg sm:text-[1.5rem] text-[#1B651B] dark:text-[#56e556] font-['Roboto_Condensed']">
                Kabsupanion
              </span>
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Card>
              <div className="flex flex-col items-center h-full w-full max-w-50 mx-auto cursor-pointer">
                <img className="w-20 h-20 rounded-[50%] border-green-700 dark:border-[#56e556] border-2 p-0.5" src={FrontEndDev} alt="Elijah Festin" />
                <p className="mt-3 text-sm text-gray-700 dark:text-gray-200 font-[montserrat] font-semibold">Elijah Festin</p>
                <p className="text-xs text-[#1B651B] dark:text-[#56e556] font-medium m-1">Front-End Developer</p>
                <p className="text-xs mt-3 text-gray-500 dark:text-gray-300 text-center">Designed and developed the user interface and implemented the client-side functionality.</p>

                <div className="mt-auto w-full pt-3">
                  <div className="w-full border-t border-t-gray-200 dark:border-t-[#2a2a2a] mb-3"></div>
                  <div className="flex flex-row justify-center gap-2">
                    <a href="https://web.facebook.com/itz.thelijah/" target="_blank" rel="noreferrer"><Icon className="text-gray-500 dark:text-gray-300 transition duration-150 hover:text-blue-500" icon="ic:baseline-facebook" width="20" height="20" /></a>
                    <a href="https://github.com/eli-fstn" target="_blank" rel="noreferrer"><Icon className="text-gray-500 dark:text-gray-300 transition duration-150 hover:text-black hover:dark:text-white" icon="mdi:github" width="20" height="20" /></a>
                    <a href="mailto:festinelijah@gmail.com" target="_blank" rel="noreferrer"><Icon className="text-gray-500 dark:text-gray-300 transition duration-150 hover:text-amber-300" icon="ic:baseline-email" width="20" height="20" /></a>
                  </div>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex flex-col items-center h-full w-full max-w-50 mx-auto cursor-pointer">
                <img className="w-20 h-20 rounded-[50%] border-green-700 dark:border-[#56e556] border-2 p-0.5" src={BackEndDev} alt="Lorenz Tuboro" />
                <p className="mt-3 text-sm text-gray-700 dark:text-gray-200 font-[montserrat] font-semibold">Lorenz Tuboro</p>
                <p className="text-xs text-[#1B651B] dark:text-[#56e556] font-medium m-1">Back-End Developer</p>
                <p className="text-xs mt-3 text-gray-500 dark:text-gray-300 text-center">Developed the server-side functionality, API, authentication, and database integration.</p>

                <div className="mt-auto w-full pt-3">
                  <div className="w-full border-t border-t-gray-200 dark:border-t-[#2a2a2a] mb-3"></div>
                  <div className="flex flex-row justify-center gap-2">
                    <a href="https://web.facebook.com/herelieszee3/" target="_blank" rel="noreferrer"><Icon className="text-gray-500 dark:text-gray-300 transition duration-150 hover:text-blue-500" icon="ic:baseline-facebook" width="20" height="20" /></a>
                    <a href="https://github.com/acid-rock" target="_blank" rel="noreferrer"><Icon className="text-gray-500 dark:text-gray-300 transition duration-150 hover:text-black hover:dark:text-white" icon="mdi:github" width="20" height="20" /></a>
                    <a href="mailto:lorenztuboro00@gmail.com" target="_blank" rel="noreferrer"><Icon className="text-gray-500 dark:text-gray-300 transition duration-150 hover:text-amber-300" icon="ic:baseline-email" width="20" height="20" /></a>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Modal>
    </footer>
  );
}

export default Footer;