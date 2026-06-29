import { Icon } from "@iconify/react";
import Button from "../../components/ui/Button";
import { useState, useEffect } from "react";
import { useUser } from "../../context/userContext";
import { getTasks, finishedTask, unfinishTask } from "../../services/taskList.ts";
import { getSubjects } from "../../services/subjects.ts";
import { formatDate } from "../../../utils/FormattedDate";
import LoadingIcon from "../../components/ui/LoadingIcon.jsx";

function TaskList({ studentName="Juan" }) {
  const [activeSubject, setActiveSubject] = useState("ALL");
  const [subject, setSubject] = useState([]);
  const [task, setTask] = useState([]);
  const { student } = useUser();
  const [loading, setLoading]= useState(false);

  const fetchTask = async () => {
    setLoading(true);
    try {
      const data = await getTasks();
      setTask(Array.isArray(data) ? [...data].reverse() : []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const data = await getSubjects();
      setSubject(data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleFinish = async (task) => {
    try {
      if (task.completed) {
        await unfinishTask(task.id);
      } else {
        await finishedTask(task.id);
      }

      // Refresh tasks so the completed state updates
      fetchTask();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchTask();
    fetchSubjects();
  }, []);

  const oneDay = 24 * 60 * 60 * 1000;
  const currentDate = new Date().getTime();

  const filteredTasks = activeSubject === "ALL" ? task : task.filter((t) => t.subject.code === activeSubject);

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

      {/*  LEGENDS  */}
      <div className="mt-2">
        <p className="text-md font-medium">Remaining days before the deadline.</p>
        <div className="flex items-center gap-10 mt-2">
          <p className="text-xs font-medium text-gray-500 flex items-center"><span className="w-3 h-3 bg-amber-500 rounded-full inline-block mr-1"></span> - 3 days</p>
          <p className="text-xs font-medium text-gray-500 flex items-center"><span className="w-3 h-3 bg-orange-500 rounded-full inline-block mr-1"></span> - 2 days</p>
          <p className="text-xs font-medium text-gray-500 flex items-center"><span className="w-3 h-3 bg-red-500 rounded-full inline-block mr-1"></span> - 1 day</p>
        </div>
      </div>

      {/* FILTER BUTTONS */}
      <div className="mt-5">
        <Button
            text="ALL"
            onClick={() => setActiveSubject("ALL")}
            bgColor={activeSubject === "ALL" ? "bg-[#1B651B]" : "bg-white"}
            typography={activeSubject === "ALL" ? "text-sm font-bold text-white" : "text-sm font-bold text-gray-700"}
            dimensions="rounded-md"
            padding="px-5 py-1"
            shadow="shadow-md border border-gray-200"
            margin="mr-4"
            animation="active:scale-95 transition-all duration-100 hover:bg-[#288a28] hover:text-white"
          />
        {subject.map((subject) => (
          <Button
            key={subject.id}
            text={subject.code}
            onClick={() => setActiveSubject(subject.code)}
            bgColor={activeSubject === subject.code ? "bg-[#1B651B]" : "bg-white"}
            typography={activeSubject === subject.code ? "text-sm font-bold text-white" : "text-sm font-bold text-gray-700"}
            dimensions="rounded-md"
            padding="px-5 py-1"
            shadow="shadow-md border border-gray-200"
            margin="mr-4"
            animation="active:scale-95 transition-all duration-100 hover:bg-[#288a28] hover:text-white"
          />
        ))}
      </div>

      {/* TASK TABLE */}
      <div className="bg-white w-full mt-5 border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="grid grid-cols-[.1fr_3fr_1fr_1fr] bg-[#F5F5F5] p-3 items-center text-[#888888] text-sm font-bold border-b border-gray-200">
              <th></th>
              <th className="flex items-center"><Icon className="mr-2" icon="ix:tasks-all" width="25" height="25" />Task</th>
              <th className="flex items-center"><Icon className="mr-2" icon="material-symbols:book-outline" width="25" height="25" />Subject</th>
              <th className="flex items-center"><Icon className="mr-2" icon="mingcute:time-line" width="25" height="25" />Due Date</th>
            </tr>
          </thead>
        </table>
        <div className="h-125 overflow-y-auto">
          <table className="w-full h-full">
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4}>
                    <div className="flex justify-center items-center h-40">
                      <LoadingIcon dimensions="w-10 h-10" />
                    </div>
                  </td>
                </tr>
              ) : filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <div className="flex justify-center items-center h-40 text-gray-400">
                      {activeSubject === "ALL"
                        ? "No tasks for today. Great job!"
                        : "No tasks for this subject. Keep up the good work!"}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTasks.map((t) => {
                  const dueDate = new Date(t.dueDate);
                  const daysRemaining = Math.ceil(
                    (dueDate - currentDate) / oneDay
                  );
                  
                  return (
                    <tr
                      key={t.id}
                      className={`grid grid-cols-[.1fr_3fr_1fr_1fr] border-b border-gray-100 p-3 items-center text-sm font-medium transition-all duration-300 ${
                        t.completed ? "opacity-40 line-through" : "opacity-100"
                      }`}
                    >
                      <td>
                        <input
                          type="checkbox"
                          checked={t.completed}
                          onChange={() => handleFinish(t)}
                          className="accent-[#1B651B] cursor-pointer"
                        />
                      </td>
                      <td>{t.title}</td>
                      <td>{t.subject?.code}</td>
                      <td className={
                        daysRemaining === 3
                          ? "text-amber-500"
                          : daysRemaining === 2
                          ? "text-orange-500 font-medium"
                          : daysRemaining === 1
                          ? "text-red-500 font-bold"
                          : ""
                      }>
                        {formatDate(t.dueDate)}
                        </td> 
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default TaskList;