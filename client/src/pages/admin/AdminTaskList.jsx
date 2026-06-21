import Sidebar from "../../components/layout/Sidebar";
import { getTasks, getSubjects } from "../../services/auth";
import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { uploadTask } from "../../services/auth";
import { handleApiError } from "../../services/errorHandler";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";

function AdminList() {
  const [tasks, setTasks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [task, setTask] = useState("");
  const [subjectID, setSubjectID] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const [error, setError] = useState({
    task: "",
    subject: "",
    dueDate: "",
    general: ""
  });

  const fetchTasks = async () => {
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const data = await getSubjects();
      setSubjects(data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let hasError = false;

    const newError = {
      task: "",
      subject: "",
      dueDate: "",
      general: ""
    };

    if (!task) {
      newError.task = "Task is required.";
      hasError = true;
    }

    if (!subjectID) {
      newError.subject = "Subject is required.";
      hasError = true;
    }

    if (!dueDate) {
      newError.dueDate = "Due date is required.";
      hasError = true;
    }

    if (hasError) {
      setError(newError);
      return;
    }

    try {
      await uploadTask(task, subjectID, dueDate);
      setModalOpen(false);
      setTask("");
      setSubjectID("");
      setDueDate("");
      fetchTasks();
    } catch (error) {
      handleApiError(error, (msg) => setError((prev) => ({ ...prev, general: msg })));
      console.log(error);
    }
  };

  const handleClose = () => {
    setModalOpen(false);
  };

  useEffect(() => {
    fetchTasks();
    fetchSubjects();
  }, []);

  return (
    <div className="bg-[#F4F4F4] min-h-screen flex">
      <Sidebar />

      <div className="flex-1 p-8">
        <div className="mb-6">
          <p className="font-bold text-[1.7rem] font-[montserrat]">Task List</p>
          <p className="text-gray-400 text-sm">
            Manage and monitor student tasks, assignments, and deadlines.
          </p>
        </div>

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

          <div className="h-125 overflow-y-auto flex flex-col">
            {tasks.length > 0 ? (
              <table className="w-full">
                <tbody>
                  {tasks.map((t, i) => (
                    <tr key={i} className="grid grid-cols-[2fr_1fr_1fr] gap-5 border-b border-gray-100 p-3 items-center text-sm font-medium">
                      <td>{t.title}</td>
                      <td>{t.subject?.code}</td>
                      <td>{t.dueDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex justify-center items-center flex-1">
                <p className="text-gray-400">No tasks added yet.</p>
              </div>
            )}
          </div>

          <div className="flex justify-center items-center mb-5 mt-4">
            <Button
              text="Add task"
              onClick={() => setModalOpen(true)}
              bgColor="bg-[#1B651B]"
              typography="text-white font-bold"
              padding="px-6 py-2"
              dimensions="w-fit rounded-md"
              animation="active:scale-95 transition-all duration-100 hover:bg-[#288a28]"
            />
          </div>
        </div>

        <Modal isOpen={modalOpen} onClose={handleClose}>
          <form onSubmit={handleSubmit} className="flex flex-col w-80 p-5">
            <p className="font-bold text-[1.3rem] text-[#1B651B] uppercase font-['Montserrat'] tracking-wide">Upload Task</p>
            <p className="text-gray-400 text-sm mb-5">Add a new task for your section.</p>

            {/* Task */}
            <label className="text-xs font-bold mb-1 mt-3">Task Title  <span className="text-red-400">*</span></label>
            <input type="text" value={task} placeholder="Enter task title" onChange={(e) => {setTask(e.target.value);setError((prev) => ({ ...prev, task: "" }));}} className={`border rounded-md mt-1 mb-1 p-2 w-full outline-none text-sm focus:border-green-700 ${error.task ? "border-red-500" : "border-gray-300"}`}/>
            {error.task && (
              <p className="text-red-500 text-xs">{error.task}</p>
            )}

            {/* Subject */}
            <label className="text-xs font-bold mb-1 mt-4">Subject <span className="text-red-400">*</span></label>
            <select value={subjectID} onChange={(e) => {setSubjectID(e.target.value); setError((prev) => ({ ...prev, subject: "" }));}} className={`border rounded-md mt-1 mb-1 p-2 w-full outline-none text-sm focus:border-green-700 bg-white ${error.subject ? "border-red-500" : "border-gray-300"}`}>
              <option value="">Select a subject</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.code}
                </option>
              ))}
            </select>
            {error.subject && (
              <p className="text-red-500 text-xs">{error.subject}</p>
            )}

            {/* Due Date */}
            <label className="text-xs font-bold mb-1 mt-4">Due Date <span className="text-red-400">*</span></label>
            <input type="date" value={dueDate} onChange={(e) => {setDueDate(e.target.value); setError((prev) => ({ ...prev, dueDate: "" }));}} className={`border rounded-md mt-1 mb-8 p-2 w-full outline-none text-sm focus:border-green-700 ${ error.dueDate ? "border-red-500" : "border-gray-300"}`}/>
            {error.dueDate && (
              <p className="text-red-500 text-xs">{error.dueDate}</p>
            )}

            {error.general && (
              <p className="text-red-500 text-[.8rem] leading-4 font-bold mb-3 text-center">
                {error.general}
              </p>
            )}

            <div className="flex justify-center items-center">
              <Button
                type="submit"
                text="Submit"
                bgColor="bg-[#1B651B]"
                typography="text-white font-bold"
                padding="px-10 py-2.5"
                dimensions="w-full rounded-md"
                animation="active:scale-95 transition-all duration-100 hover:bg-[#288a28]"
              />
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}

export default AdminList;