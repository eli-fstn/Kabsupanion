import { Icon } from "@iconify/react";
import Button from "../../components/ui/Button";
import { useState, useEffect } from "react";
import { getMe, getTasks } from "../../services/auth";

function TaskList({ studentName="Juan" }) {
  const [activeSubject, setActiveSubject] = useState("All");
  const [task, setTask] = useState([]);
  const [student, setStudent] = useState(null);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const data = await getTasks();
        setTask(data);
      } catch (error) {
        console.log(error);
      }
    }

    const fetchMe = async () => {
      try {
        const data = await getMe();
        setStudent(data);
      } catch (error) {
        console.log(error);
      } 
    }

    fetchTask();
    fetchMe();
  }, []);

  const subjects = ["All", "GNED 04", "MATH 1A", "COSC 55A", "COSC 60B", "DCIT 50A", "DCIT 24A", "INSY 50", "FITT 3"];

  const filteredTasks = activeSubject === "All" ? task : task.filter((t) => t.subject === activeSubject);

  return (
    <section className="min-h-screen p-10" id="task-list">
      <div>
        <h1 className="text-[2.8rem] font-bold font-[amaranth] text-[#003A02]">Hello there,<span className="font-[parisienne] font-bold pl-3 text-[3.3rem]">{student?.user?.name?.split(" ").slice(-1)[0]}!</span></h1>
        <div className="mt-3">
          <p className="font-bold text-[1.7rem] font-[montserrat]">Today's Tasks</p>
          <p className="text-[1rem]">You have <span className="text-[#003A02] font-bold text-[1.3rem]">{task.length}</span> tasks ongoing. {task.length === 0 ? (
            <span>Well done!</span>
          ) : (
            <span>Stay focused and complete them on time!</span>
          )}</p>
        </div>
      </div>

      {/* FILTER BUTTONS */}
      <div className="mt-5">
        {subjects.map((subject) => (
          <Button
            key={subject}
            text={subject}
            onClick={() => setActiveSubject(subject)}
            bgColor={activeSubject === subject ? "bg-[#1B651B]" : "bg-white"}
            typography={activeSubject === subject ? "text-sm font-bold text-white" : "text-sm font-bold text-gray-700"}
            dimensions="rounded-md"
            padding="px-5 py-1"
            shadow="shadow-md border border-gray-200"
            margin="mr-4"
            animation="active:scale-95 transition-transform duration-100"
          />
        ))}
      </div>

      {/* TASK TABLE */}
      <div className="bg-white w-full mt-5 border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="grid grid-cols-[3fr_1fr_1fr] gap-4 bg-[#F5F5F5] p-3 items-center text-[#888888] text-sm font-bold border-b border-gray-200">
              <th className="flex items-center"><Icon className="mr-2" icon="ix:tasks-all" width="25" height="25" />Task</th>
              <th className="flex items-center"><Icon className="mr-2" icon="material-symbols:book-outline" width="25" height="25" />Subject</th>
              <th className="flex items-center"><Icon className="mr-2" icon="mingcute:time-line" width="25" height="25" />Due Date</th>
            </tr>
          </thead>
        </table>
        <div className="h-125 overflow-y-auto">
          <table className="w-full h-full">
            <tbody>
              {filteredTasks.map((t, i) => (
                <tr key={i} className="grid grid-cols-[2fr_1fr_1fr] gap-5 border-b border-gray-100 p-3 items-center text-sm font-medium">
                  <td>{t.task}</td>
                  <td>{t.subject}</td>
                  <td>{t.dueDate}</td>
                </tr>
              ))}
              {activeSubject == "All" && filteredTasks.length === 0 ? (
                <tr className="flex justify-center items-center flex-1 h-full">
                  <td colSpan={3} className="text-center text-gray-400 p-5">No tasks for today. Great job!</td>
                </tr>
              ) : (
                <tr className="flex justify-center items-center flex-1 h-full">
                  <td colSpan={3} className="text-center text-gray-400 p-5">No tasks for this subject. Keep up the good work!</td>
                </tr>
              ) }
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default TaskList;