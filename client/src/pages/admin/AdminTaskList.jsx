import Sidebar from "../../components/layout/Sidebar";
import { getTasks, getSubjects, uploadTask, editTask, deleteTask } from "../../services/auth";
import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { handleApiError } from "../../services/errorHandler";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";

function AdminList() {
  const [tasks, setTasks] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // Add form
  const [title, setTitle] = useState("");
  const [subjectID, setSubjectID] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const [error, setError] = useState({ title: "", subject: "", dueDate: "", general: "" });

  // Edit
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSubjectID, setEditSubjectID] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [editError, setEditError] = useState({ title: "", subject: "", dueDate: "", general: "" });

  // Delete
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const fetchTasks = async () => {
    try {
      const data = await getTasks();
      setTasks(Array.isArray(data) ? [...data].reverse() : []);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchSubjects = async () => {
    try {
      const data = await getSubjects();
      setSubjects(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchSubjects();
  }, []);

  const resetForm = () => {
    setTitle("");
    setSubjectID("");
    setDueDate("");
    setError({ title: "", subject: "", dueDate: "", general: "" });
  };

  const handleClose = () => {
    resetForm();
    setModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let hasError = false;
    const newError = { title: "", subject: "", dueDate: "", general: "" };
    if (!title) { newError.title = "Task title is required."; hasError = true; }
    if (!subjectID) { newError.subject = "Subject is required."; hasError = true; }
    if (!dueDate) { newError.dueDate = "Due date is required."; hasError = true; }
    if (hasError) { setError(newError); return; }
    try {
      await uploadTask(title, subjectID, dueDate);
      setModalOpen(false);
      resetForm();
      fetchTasks();
    } catch (err) {
      handleApiError(err, (msg) => setError((prev) => ({ ...prev, general: msg })));
      console.log(err);
    }
  };

  const handleEditOpen = (t) => {
    setSelectedTask(t);
    setEditTitle(t.title);
    setEditSubjectID(t.subject?.id || "");
    setEditDueDate(t.dueDate ? new Date(t.dueDate).toISOString().slice(0,10) : "");
    setEditError({ title: "", subject: "", dueDate: "", general: "" });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    let hasError = false;
    const newError = { title: "", subject: "", dueDate: "", general: "" };
    if (!editTitle) { newError.title = "Task title is required."; hasError = true; }
    if (!editSubjectID) { newError.subject = "Subject is required."; hasError = true; }
    if (!editDueDate) { newError.dueDate = "Due date is required."; hasError = true; }
    if (hasError) { setEditError(newError); return; }
    try {
      if (!selectedTask) return;
      await editTask(selectedTask.id, editTitle, editSubjectID, editDueDate);
      setEditModalOpen(false);
      fetchTasks();
    } catch (err) {
      console.log("API not yet available");
      handleApiError(err, (msg) => setEditError((prev) => ({ ...prev, general: msg })));
    }
  };

  const handleDeleteOpen = (t) => {
    setSelectedTask(t);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      if (!selectedTask) return;
      await deleteTask(selectedTask.id);
      setDeleteModalOpen(false);
      fetchTasks();
    } catch (err) {
      console.log("API not yet available");
      console.log(err);
    }
  };

  const formatDate = (date) => new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  return (
    <div className="bg-[#F4F4F4] min-h-screen flex">
      <Sidebar />

      <div className="flex-1 p-8">
        <div className="mb-6">
          <p className="font-bold text-[1.7rem] font-[montserrat]">Task List</p>
          <p className="text-gray-400 text-sm">Manage and monitor student tasks, assignments, and deadlines.</p>
        </div>

        <div className="bg-white w-full mt-5 border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="grid grid-cols-[.2fr_3fr_1fr_1fr_.5fr] gap-4 bg-[#F5F5F5] p-3 items-center text-[#888888] text-sm font-bold border-b border-gray-200">
                <th className="flex items-center">No.</th>
                <th className="flex items-center"><Icon className="mr-2" icon="ix:tasks-all" width="22" height="22" />Task</th>
                <th className="flex items-center"><Icon className="mr-2" icon="material-symbols:book-outline" width="22" height="22" />Subject</th>
                <th className="flex items-center"><Icon className="mr-2" icon="mingcute:time-line" width="22" height="22" />Due Date</th>
                <th className="flex items-center">Actions</th>
              </tr>
            </thead>
          </table>

          <div className="h-125 overflow-y-auto flex flex-col">
            {tasks.length > 0 ? (
              <table className="w-full">
                <tbody>
                  {tasks.map((t, i) => (
                    <tr key={t.id} className="grid grid-cols-[.2fr_3fr_1fr_1fr_.5fr] gap-5 border-b border-gray-100 px-3 py-2 items-center text-sm font-medium transition-all duration-200 hover:bg-[#e1e1e188]">
                      <td className="text-[#4a4a4a88]">{i + 1}</td>
                      <td>{t.title}</td>
                      <td>{t.subject?.code}</td>
                      <td>{formatDate(t.dueDate)}</td>
                      <td className="flex gap-2">
                        <button
                          onClick={() => handleEditOpen(t)}
                          className="p-1.5 rounded-md bg-[#e6f1fb] hover:bg-[#185FA5] text-[#185FA5] hover:text-white transition-colors duration-200">
                          <Icon icon="mdi:pencil-outline" width="16" height="16" />
                        </button>
                        <button
                          onClick={() => handleDeleteOpen(t)}
                          className="p-1.5 rounded-md bg-[#fcebeb] hover:bg-[#A32D2D] text-[#A32D2D] hover:text-white transition-colors duration-200">
                          <Icon icon="mdi:trash-can-outline" width="16" height="16" />
                        </button>
                      </td>
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
              text="Add Task"
              onClick={() => setModalOpen(true)}
              bgColor="bg-[#1B651B]"
              typography="text-white font-bold"
              padding="px-6 py-2"
              dimensions="w-fit rounded-md"
              animation="active:scale-95 transition-all duration-100 hover:bg-[#288a28]"
            />
          </div>
        </div>

        {/* Add Modal */}
        <Modal isOpen={modalOpen} onClose={handleClose}>
          <form onSubmit={handleSubmit} className="flex flex-col w-80 p-5">
            <p className="font-bold text-[1.3rem] text-[#1B651B] uppercase font-['Montserrat'] tracking-wide">Add Task</p>
            <p className="text-gray-400 text-sm mb-5">Add a new task for your section.</p>

            <label className="text-xs font-bold mb-1 mt-3">Task Title <span className="text-red-400">*</span></label>
            <input type="text" value={title} placeholder="Enter task title" onChange={(e) => {setTitle(e.target.value);setError((prev) => ({ ...prev, title: "" }));}} className={`border rounded-md mt-1 mb-1 p-2 w-full outline-none text-sm focus:border-green-700 ${error.title ? "border-red-500" : "border-gray-300"}`}/>
            {error.title && (<p className="text-red-500 text-xs">{error.title}</p>)}

            <label className="text-xs font-bold mb-1 mt-4">Subject <span className="text-red-400">*</span></label>
            <select value={subjectID} onChange={(e) => {setSubjectID(e.target.value); setError((prev) => ({ ...prev, subject: "" }));}} className={`border rounded-md mt-1 mb-1 p-2 w-full outline-none text-sm focus:border-green-700 bg-white ${error.subject ? "border-red-500" : "border-gray-300"}`}>
              <option value="">Select a subject</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>{subject.code}</option>
              ))}
            </select>
            {error.subject && (<p className="text-red-500 text-xs">{error.subject}</p>)}

            <label className="text-xs font-bold mb-1 mt-4">Due Date <span className="text-red-400">*</span></label>
            <input type="date" value={dueDate} onChange={(e) => {setDueDate(e.target.value); setError((prev) => ({ ...prev, dueDate: "" }));}} className={`border rounded-md mt-1 mb-1 p-2 w-full outline-none text-sm focus:border-green-700 ${ error.dueDate ? "border-red-500" : "border-gray-300"}`}/>
            {error.dueDate && (<p className="text-red-500 text-xs">{error.dueDate}</p>)}

            {error.general && (<p className="text-red-500 text-[.8rem] leading-4 font-bold mt-3 text-center">{error.general}</p>)}

            <div className="flex gap-3 mt-5">
              <Button type="button" onClick={handleClose} text="Cancel" bgColor="bg-gray-100 hover:bg-gray-200" typography="text-gray-600 font-bold text-sm" padding="px-4 py-2" dimensions="w-full rounded-md" />
              <Button type="submit" text="Submit" bgColor="bg-[#1B651B]" typography="text-white font-bold text-sm" padding="px-4 py-2" dimensions="w-full rounded-md" animation="active:scale-95 transition-all duration-100 hover:bg-[#288a28]" />
            </div>
          </form>
        </Modal>

        {/* Edit Modal */}
        <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)}>
          <form onSubmit={handleEditSubmit} className="flex flex-col w-80 p-5">
            <p className="font-bold text-[1.3rem] text-[#1B651B] uppercase font-['Montserrat'] tracking-wide">Edit Task</p>
            <p className="text-gray-400 text-sm mb-5">Update the task details.</p>

            <label className="text-xs font-bold mb-1 mt-3">Task Title <span className="text-red-400">*</span></label>
            <input type="text" value={editTitle} onChange={(e) => { setEditTitle(e.target.value); setEditError((prev) => ({ ...prev, title: "" })); }} className={`border rounded-md mt-1 mb-1 p-2 w-full outline-none text-sm focus:border-blue-500 ${editError.title ? "border-red-500" : "border-gray-300"}`} />
            {editError.title && <p className="text-red-500 text-xs">{editError.title}</p>}

            <label className="text-xs font-bold mb-1 mt-4">Subject <span className="text-red-400">*</span></label>
            <select value={editSubjectID} onChange={(e) => { setEditSubjectID(e.target.value); setEditError((prev) => ({ ...prev, subject: "" })); }} className={`border rounded-md mt-1 mb-1 p-2 w-full outline-none text-sm focus:border-blue-500 bg-white ${editError.subject ? "border-red-500" : "border-gray-300"}`}>
              <option value="">Select a subject</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>{subject.code}</option>
              ))}
            </select>
            {editError.subject && <p className="text-red-500 text-xs">{editError.subject}</p>}

            <label className="text-xs font-bold mb-1 mt-4">Due Date <span className="text-red-400">*</span></label>
            <input type="date" value={editDueDate} onChange={(e) => { setEditDueDate(e.target.value); setEditError((prev) => ({ ...prev, dueDate: "" })); }} className={`border rounded-md mt-1 mb-1 p-2 w-full outline-none text-sm focus:border-blue-500 ${editError.dueDate ? "border-red-500" : "border-gray-300"}`} />
            {editError.dueDate && <p className="text-red-500 text-xs">{editError.dueDate}</p>}

            {editError.general && (<p className="text-red-500 text-xs font-bold text-center mt-2">{editError.general}</p>)}

            <div className="flex gap-3 mt-5">
              <Button type="button" onClick={() => setEditModalOpen(false)} text="Cancel" bgColor="bg-gray-100 hover:bg-gray-200" typography="text-gray-600 font-bold text-sm" padding="px-4 py-2" dimensions="w-full rounded-md" />
              <Button type="submit" text="Save Changes" bgColor="bg-[#1B651B]" typography="text-white font-bold text-sm" padding="px-4 py-2" dimensions="w-full rounded-md" animation="active:scale-95 transition-all duration-100 hover:bg-[#288a28]" />
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
          <div className="flex flex-col items-center w-72 p-5">
            <div className="bg-[#fcebeb] rounded-full p-4 mb-4">
              <Icon icon="mdi:trash-can-outline" width="30" className="text-[#A32D2D]" />
            </div>
            <p className="font-bold text-[1.1rem] text-center">Delete Task?</p>
            <p className="text-gray-400 text-sm text-center mt-2 mb-6">Are you sure you want to delete <span className="font-bold text-[#3a3a3a]">{selectedTask?.title}</span>? This action cannot be undone.</p>
            <div className="flex gap-3 w-full">
              <Button type="button" onClick={() => setDeleteModalOpen(false)} text="Cancel" bgColor="bg-gray-100 hover:bg-gray-200" typography="text-gray-600 font-bold text-sm" padding="px-4 py-2" dimensions="w-full rounded-md" />
              <Button type="button" onClick={handleDeleteConfirm} text="Delete" bgColor="bg-[#A32D2D] hover:bg-red-800" typography="text-white font-bold text-sm" padding="px-4 py-2" dimensions="w-full rounded-md" animation="active:scale-95 transition-all duration-100" />
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}

export default AdminList;