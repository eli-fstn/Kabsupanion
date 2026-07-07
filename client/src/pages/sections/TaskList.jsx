import { Icon } from "@iconify/react";
import Button from "../../components/ui/Button.jsx";
import { useState, useEffect, useRef } from "react";
import { useUser } from "../../context/userContext.jsx";
import { getTasks, finishedTask, unfinishTask } from "../../services/taskList.ts";
import { getSubjects } from "../../services/subjects.ts";
import { formatDate } from "../../../utils/FormattedDate.ts";
import LoadingIcon from "../../components/ui/LoadingIcon.jsx";

function TaskList({ studentName = "Juan" }) {
  const [activeSubject, setActiveSubject] = useState("ALL");
  const [subject, setSubject] = useState([]);
  const [task, setTask] = useState([]);
  const { student } = useUser();
  const [loading, setLoading] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    const elements =
      sectionRef.current.querySelectorAll(".animate-on-scroll");

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [task]);

  const fetchTask = async () => {
    setLoading(true);
    try {
      const data = await getTasks();
      setTask(data);
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

  const filteredTasks = activeSubject === "ALL"
  ? [...task].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
  : task.filter((t) => t.subject.code === activeSubject).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  const getDueDateColor = (daysRemaining) =>
    daysRemaining === 3
      ? "text-amber-500 dark:text-amber-400"
      : daysRemaining === 2
      ? "text-orange-500 dark:text-orange-400 font-medium"
      : daysRemaining === 1
      ? "text-red-500 dark:text-red-400 font-bold"
      : daysRemaining === 0
      ? "text-red-700 dark:text-red-500 font-bold"
      : daysRemaining < 0
      ? "text-purple-900 dark:text-purple-400 font-bold"
      : "";

  return (
    <section ref={sectionRef} className="min-h-screen p-4 sm:p-5 lg:px-20" id="task-list">
      <header className="animate-on-scroll">
        <h1 className="text-3xl md:text-4xl lg:text-[2.8rem] font-bold font-[amaranth] text-[#003A02] dark:text-[#56e556] flex flex-wrap items-baseline gap-x-2">
          Hello there,
          <span className="font-[parisienne] font-bold text-4xl md:text-5xl lg:text-[3.3rem]">
            {student?.user?.name?.split(" ").slice(-1)[0]}!
          </span>
        </h1>
        <div className="mt-3">
          <p className="font-bold text-[1.5rem] md:text-[1.7rem] font-[montserrat] text-gray-900 dark:text-gray-100">Today's Tasks</p>
          <p className="text-sm sm:text-base text-gray-700 dark:text-[#E0E0E0]">
            You have <span className="text-[#003A02] dark:text-[#56e556] font-bold text-base sm:text-[1.3rem]">{task.length}</span> tasks ongoing.{" "}
            {task.length === 0 ? <span>Well done!</span> : <span>Stay focused and complete them on time!</span>}
          </p>
        </div>
      </header>

      {/* LEGENDS */}
      <div className="animate-on-scroll mt-3">
        <p className="text-sm font-medium text-gray-700 dark:text-[#E0E0E0]">Remaining days before the deadline:</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:gap-x-6 mt-2">
          <p className="text-xs font-medium text-gray-500 dark:text-[#E0E0E0] flex items-center whitespace-nowrap">
            <span className="w-3 h-3 bg-amber-500 dark:bg-amber-400 rounded-full inline-block mr-1"></span> - 3 days
          </p>
          <p className="text-xs font-medium text-gray-500 dark:text-[#E0E0E0] flex items-center whitespace-nowrap">
            <span className="w-3 h-3 bg-orange-500 dark:bg-orange-400 rounded-full inline-block mr-1"></span> - 2 days
          </p>
          <p className="text-xs font-medium text-gray-500 dark:text-[#E0E0E0] flex items-center whitespace-nowrap">
            <span className="w-3 h-3 bg-red-500 dark:bg-red-400 rounded-full inline-block mr-1"></span> - Due tomorrow
          </p>
          <p className="text-xs font-medium text-gray-500 dark:text-[#E0E0E0] flex items-center whitespace-nowrap">
            <span className="w-3 h-3 bg-red-700 dark:bg-red-500 rounded-full inline-block mr-1"></span> - Due today
          </p>
          <p className="text-xs font-medium text-gray-500 dark:text-[#E0E0E0] flex items-center whitespace-nowrap">
            <span className="w-3 h-3 bg-purple-900 dark:bg-purple-400 rounded-full inline-block mr-1"></span> - Overdue
          </p>
        </div>
      </div>

      {/* FILTER BUTTONS */}
      <div className="animate-on-scroll mt-5 flex flex-wrap gap-3 overflow-x-auto pb-1 -mx-1 px-1 sm:mx-0 sm:px-0">
        <Button
          text="ALL"
          onClick={() => setActiveSubject("ALL")}
          bgColor={activeSubject === "ALL" ? "bg-[#1B651B] duration-300 transition" : "bg-white dark:bg-[#121212] duration-300 transition"}
          typography={activeSubject === "ALL" ? "text-sm font-bold text-white whitespace-nowrap duration-300 transition" : "text-sm font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap duration-300 transition"}
          dimensions="rounded-2xl"
          padding="px-5 py-1"
          shadow={activeSubject === "ALL" ? "border border-[#1B651B] dark:border-[#1B651B]" : "border border-gray-300 dark:border-[#5a5a5a]"}
          animation={activeSubject === "ALL" ? "" : "transition duration-200 hover:border-gray-500 dark:hover:border-[#8a8a8a]"}
        />
        {subject.map((subject) => (
          <Button
            key={subject.id}
            text={subject.code}
            onClick={() => setActiveSubject(subject.code)}
            bgColor={activeSubject === subject.code ? "bg-[#1B651B] duration-300 transition" : "bg-white dark:bg-[#121212] duration-300 transition"}
            typography={activeSubject === subject.code ? "text-sm font-bold text-white whitespace-nowrap duration-300 transition" : "text-sm font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap duration-300 transition"}
            dimensions="rounded-2xl"
            padding="px-5 py-1"
            shadow={activeSubject === subject.code ? "border border-[#1B651B] dark:border-[#1B651B]" : "border border-gray-300 dark:border-[#5a5a5a]"}
            animation={activeSubject === subject.code ? "" : "transition duration-200 hover:border-gray-500 dark:hover:border-[#8a8a8a]"}
          />
        ))}
      </div>

      {/* TASK LIST / TABLE — scrolls horizontally below md instead of restacking */}
      <div className="animate-on-scroll bg-white dark:bg-[#1a1a1a] w-full mt-5 border border-gray-200 dark:border-[#1a1a1a] rounded-xl overflow-hidden transition-colors duration-300">
        <div className="overflow-x-auto">
          <div className="min-w-200" role="table">

            {/* Table header */}
            <div
              className="grid grid-cols-[.1fr_3fr_1fr_1fr] bg-[#F5F5F5] dark:bg-[#1f1f1f] p-3 items-center text-[#888888] dark:text-[#6a6a6a] text-sm font-bold border-b border-gray-200 dark:border-[#1a1a1a]"
              role="row"
            >
              <span role="columnheader"></span>
              <span role="columnheader" className="flex items-center text-sm sm:text-[1rem]">
                <Icon className="mr-2 shrink-0 w-5 h-5" icon="ix:tasks-all"/>
                Task
              </span>
              <span role="columnheader" className="flex items-center text-sm sm:text-[1rem]">
                <Icon className="mr-2 shrink-0 w-5 h-5" icon="material-symbols:book-outline"/>
                Subject
              </span>
              <span role="columnheader" className="flex items-center text-sm sm:text-[1rem]">
                <Icon className="mr-2 shrink-0 w-5 h-5" icon="mingcute:time-line"/>
                Due Date
              </span>
            </div>

            {/* Table body */}
            <div className="h-96 overflow-y-auto" role="rowgroup">
              {loading ? (
                <div className="flex justify-center items-center h-96">
                  <LoadingIcon dimensions="w-10 h-10" />
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="flex justify-center items-center my-5 h-96 flex-1 text-gray-400 dark:text-gray-500 text-center px-4 text-sm">
                  {activeSubject === "ALL"
                    ? "No tasks for today. Great job!"
                    : "No tasks for this subject. Keep up the good work!"}
                </div>
              ) : (
                filteredTasks.map((t) => {
                  const oneDay = 24 * 60 * 60 * 1000;
                  const currentDate = new Date().getTime();
                  const dueDate = new Date(t.dueDate);
                  const daysRemaining = Math.ceil((dueDate - currentDate) / oneDay);
                  const dueDateColor = getDueDateColor(daysRemaining);

                  return (
                    <div
                      key={t.id}
                      role="row"
                      className={`grid grid-cols-[.1fr_3fr_1fr_1fr] border-b border-gray-100 dark:border-[#2a2a2a] p-3 items-center text-sm font-medium text-gray-800 dark:text-gray-200 transition-all duration-300 ${
                        t.completed ? "opacity-40 line-through" : "opacity-100"
                      }`}
                    >
                      <span className="flex items-center">
                        <input
                          type="checkbox"
                          checked={t.completed}
                          onChange={() => handleFinish(t)}
                          className="accent-[#1B651B] cursor-pointer mr-2"
                        />
                      </span>
                      <span className="pr-2 text-sm lg:text-[1rem]">{t.title}</span>
                      <span className="pr-2 text-sm lg:text-[1rem]">{t.subject?.code}</span>
                      <span className={`flex items-center gap-2 text-sm lg:text-[1rem] ${dueDateColor}`}>
                        {formatDate(t.dueDate)}
                        {daysRemaining === 1 && (
                          <Icon icon="mdi:alert-circle" className="text-red-500 dark:text-red-400 shrink-0 w-4 h-4" />
                        )}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
      <p className="mt-2 text-xs text-gray-400 dark:text-[#E0E0E0] sm:hidden">
        Swipe sideways to see the full task.
      </p>
    </section>
  );
}

export default TaskList;