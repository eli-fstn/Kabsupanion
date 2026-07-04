import Navbar from "../../components/layout/Navbar";
import TaskList from "../sections/TaskList";
import ClassSched from "../sections/ClassSched";
import ClassResources from "../sections/ClassResources";
import ActivityTracker from "../sections/ActivityTracker";
import ClassList from "../sections/ClassList";
import Footer from "../../components/layout/Footer";

function Dashboard() {
  return (
    <div className="bg-[#fafafa] dark:bg-[#121212] min-h-screen transition-colors duration-300">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>

      <main className="pt-16 md:pt-20 px-4 sm:px-6 md:px-10 lg:px-16 xl:px-24 max-w-[1600px] mx-auto flex flex-col gap-8 sm:gap-10 md:gap-14">
        <TaskList />
        <ClassSched />
        <ClassResources />
      </main>

      <Footer />
    </div>
  );
}

export default Dashboard;