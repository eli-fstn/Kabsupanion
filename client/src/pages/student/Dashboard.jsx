import Navbar from "../../components/Navbar";
import TaskList from "../sections/TaskList";
import ClassSched from "../sections/ClassSched";
import ClassResources from "../sections/ClassResources";

function Dashboard() {
  return (
    <div className="bg-[#F4F4F4] min-h-screen">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>
      <div className="pt-16">
        <TaskList />
        <ClassSched />
        <ClassResources />
      </div>
    </div>
  );
}

export default Dashboard