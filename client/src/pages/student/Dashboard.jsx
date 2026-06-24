import Navbar from "../../components/layout/Navbar";
import TaskList from "../sections/TaskList";
import ClassSched from "../sections/ClassSched";
import ClassResources from "../sections/ClassResources";
import ActivityTracker from "../sections/ActivityTracker";
import ClassList from "../sections/ClassList";
import Footer from "../../components/layout/Footer";

function Dashboard() {
  return (
    <div className="bg-[#fafafa] min-h-screen">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>
      <div className="pt-16 px-30">
        <TaskList />
        <ClassSched />
        <ClassResources />
      </div>
      <Footer />
    </div>
  );
}

export default Dashboard