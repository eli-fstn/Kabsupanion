import Sidebar from "../../components/layout/Sidebar";
import { getSubjects, uploadSubject, editSubject, deleteSubject } from "../../services/auth";
import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { handleApiError } from "../../services/errorHandler";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";

function AdminSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState({ code: "", name: "", general: "" });

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editCode, setEditCode] = useState("");
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editError, setEditError] = useState({ code: "", name: "", general: "" });

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const fetchSubjects = async () => {
    try {
      const data = await getSubjects();
      setSubjects(Array.isArray(data) ? [...data].reverse() : []);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    let hasError = false;
    const newError = { code: "", name: "", general: "" };
    if (!code) { newError.code = "Subject code is required."; hasError = true; }
    if (!name) { newError.name = "Subject name is required."; hasError = true; }
    if (hasError) { setError(newError); return; }
    try {
      await uploadSubject(code, name, description);
      setModalOpen(false);
      resetForm();
      fetchSubjects();
    } catch (error) {
      handleApiError(error, (msg) => setError((prev) => ({ ...prev, general: msg })));
    }
  };

  const resetForm = () => {
    setCode("");
    setName("");
    setDescription("");
    setError({ code: "", name: "", general: "" });
  };

  const handleClose = () => {
    resetForm();
    setModalOpen(false);
  };

  const handleEditOpen = (subject) => {
    setSelectedSubject(subject);
    setEditCode(subject.code);
    setEditName(subject.name);
    setEditDescription(subject.description ?? "");
    setEditError({ code: "", name: "", general: "" });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    let hasError = false;
    const newError = { code: "", name: "", general: "" };
    if (!editCode) { newError.code = "Subject code is required."; hasError = true; }
    if (!editName) { newError.name = "Subject name is required."; hasError = true; }
    if (hasError) { setEditError(newError); return; }
    try {
      await editSubject(selectedSubject.id, editCode, editName, editDescription);
      setEditModalOpen(false);
      fetchSubjects();
    } catch (error) {
      handleApiError(error, (msg) => setEditError((prev) => ({ ...prev, general: msg })));
    }
  };

  const handleDeleteOpen = (subject) => {
    setSelectedSubject(subject);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteSubject(selectedSubject.id);
      setDeleteModalOpen(false);
      fetchSubjects();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="bg-[#F4F4F4] min-h-screen flex">
      <Sidebar />

      <div className="flex-1 p-8">
        <div className="mb-6">
          <p className="font-bold text-[1.7rem] font-[montserrat]">Subject List</p>
          <p className="text-gray-400 text-sm">Manage and monitor all subjects for your section.</p>
        </div>

        <div className="bg-white w-full mt-5 border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="grid grid-cols-[.2fr_.5fr_2fr_2fr_.6fr] gap-4 bg-[#F5F5F5] p-3 items-center text-[#888888] text-sm font-bold border-b border-gray-200">
                <th className="flex items-center">No.</th>
                <th className="flex items-center"><Icon className="mr-2" icon="material-symbols:book-outline" width="22" height="22" />Code</th>
                <th className="flex items-center"><Icon className="mr-2" icon="mdi:text-box-outline" width="22" height="22" />Name</th>
                <th className="flex items-center"><Icon className="mr-2" icon="mdi:text" width="22" height="22" />Description</th>
                <th className="flex items-center">Actions</th>
              </tr>
            </thead>
          </table>

          <div className="h-125 overflow-y-auto flex flex-col">
            {subjects.length > 0 ? (
              <table className="w-full">
                <tbody>
                  {subjects.map((t, i) => (
                    <tr key={i.id} className="grid grid-cols-[.2fr_.5fr_2fr_2fr_.6fr] gap-5 border-b border-gray-100 px-3 py-2 items-center text-sm font-medium transition-all duration-200 hover:bg-[#e1e1e188]">
                      <td className="text-[#4a4a4a88]">{i + 1}</td>
                      <td>{t.code}</td>
                      <td>{t.name}</td>
                      <td>{t.description ?? "—"}</td>
                      <td className="flex gap-4">
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
                <p className="text-gray-400">No subjects added yet.</p>
              </div>
            )}
          </div>

          <div className="flex justify-center items-center mb-5 mt-4">
            <Button
              text="Add Subject"
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
            <p className="font-bold text-[1.3rem] text-[#1B651B] uppercase font-['Montserrat'] tracking-wide">Add Subject</p>
            <p className="text-gray-400 text-sm mb-5">Add a new subject for your section.</p>

            <label className="text-xs font-bold mb-1 mt-3">Subject Code <span className="text-red-400">*</span></label>
            <input
              type="text"
              value={code}
              placeholder="e.g. DCIT 25A"
              onChange={(e) => { setCode(e.target.value); setError((prev) => ({ ...prev, code: "" })); }}
              className={`border rounded-md mt-1 mb-1 p-2 w-full outline-none text-sm focus:border-green-700 ${error.code ? "border-red-500" : "border-gray-300"}`}
            />
            {error.code && <p className="text-red-500 text-xs">{error.code}</p>}

            <label className="text-xs font-bold mb-1 mt-4">Subject Name <span className="text-red-400">*</span></label>
            <input
              type="text"
              value={name}
              placeholder="e.g. Data Structures and Algorithms"
              onChange={(e) => { setName(e.target.value); setError((prev) => ({ ...prev, name: "" })); }}
              className={`border rounded-md mt-1 mb-1 p-2 w-full outline-none text-sm focus:border-green-700 ${error.name ? "border-red-500" : "border-gray-300"}`}
            />
            {error.name && <p className="text-red-500 text-xs">{error.name}</p>}

            <label className="text-xs font-bold mb-1 mt-4">Description <span className="text-gray-300 font-normal">(optional)</span></label>
            <textarea
              value={description}
              placeholder="Enter subject description"
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="border border-gray-300 rounded-md mt-1 mb-1 p-2 w-full outline-none text-sm focus:border-green-700 resize-none"
            />

            {error.general && (
              <p className="text-red-500 text-xs font-bold text-center mt-2">{error.general}</p>
            )}

            <div className="flex gap-3 mt-5">
              <Button
                type="button"
                onClick={handleClose}
                text="Cancel"
                bgColor="bg-gray-100 hover:bg-gray-200"
                typography="text-gray-600 font-bold text-sm"
                padding="px-4 py-2"
                dimensions="w-full rounded-md"
              />
              <Button
                type="submit"
                text="Submit"
                bgColor="bg-[#1B651B]"
                typography="text-white font-bold text-sm"
                padding="px-4 py-2"
                dimensions="w-full rounded-md"
                animation="active:scale-95 transition-all duration-100 hover:bg-[#288a28]"
              />
            </div>
          </form>
        </Modal>

        {/* Edit Modal */}
        <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)}>
          <form onSubmit={handleEditSubmit} className="flex flex-col w-80 p-5">
            <p className="font-bold text-[1.3rem] text-[#1B651B] uppercase font-['Montserrat'] tracking-wide">Edit Subject</p>
            <p className="text-gray-400 text-sm mb-5">Update the subject details.</p>

            <label className="text-xs font-bold mb-1 mt-3">Subject Code <span className="text-red-400">*</span></label>
            <input
              type="text"
              value={editCode}
              onChange={(e) => { setEditCode(e.target.value); setEditError((prev) => ({ ...prev, code: "" })); }}
              className={`border rounded-md mt-1 mb-1 p-2 w-full outline-none text-sm focus:border-blue-500 ${editError.code ? "border-red-500" : "border-gray-300"}`}
            />
            {editError.code && <p className="text-red-500 text-xs">{editError.code}</p>}

            <label className="text-xs font-bold mb-1 mt-4">Subject Name <span className="text-red-400">*</span></label>
            <input
              type="text"
              value={editName}
              onChange={(e) => { setEditName(e.target.value); setEditError((prev) => ({ ...prev, name: "" })); }}
              className={`border rounded-md mt-1 mb-1 p-2 w-full outline-none text-sm focus:border-blue-500 ${editError.name ? "border-red-500" : "border-gray-300"}`}
            />
            {editError.name && <p className="text-red-500 text-xs">{editError.name}</p>}

            <label className="text-xs font-bold mb-1 mt-4">Description <span className="text-gray-300 font-normal">(optional)</span></label>
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              rows={3}
              className="border border-gray-300 rounded-md mt-1 mb-1 p-2 w-full outline-none text-sm focus:border-blue-500 resize-none"
            />

            {editError.general && (
              <p className="text-red-500 text-xs font-bold text-center mt-2">{editError.general}</p>
            )}

            <div className="flex gap-3 mt-5">
              <Button
                type="button"
                onClick={() => setEditModalOpen(false)}
                text="Cancel"
                bgColor="bg-gray-100 hover:bg-gray-200"
                typography="text-gray-600 font-bold text-sm"
                padding="px-4 py-2"
                dimensions="w-full rounded-md"
              />
              <Button
                type="submit"
                text="Save Changes"
                bgColor="bg-[#1B651B]"
                typography="text-white font-bold text-sm"
                padding="px-4 py-2"
                dimensions="w-full rounded-md"
                animation="active:scale-95 transition-all duration-100 hover:bg-[#288a28]"
              />
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
          <div className="flex flex-col items-center w-72 p-5">
            <div className="bg-[#fcebeb] rounded-full p-4 mb-4">
              <Icon icon="mdi:trash-can-outline" width="30" className="text-[#A32D2D]" />
            </div>
            <p className="font-bold text-[1.1rem] text-center">Delete Subject?</p>
            <p className="text-gray-400 text-sm text-center mt-2 mb-6">
              Are you sure you want to delete <span className="font-bold text-[#3a3a3a]">{selectedSubject?.code}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3 w-full">
              <Button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                text="Cancel"
                bgColor="bg-gray-100 hover:bg-gray-200"
                typography="text-gray-600 font-bold text-sm"
                padding="px-4 py-2"
                dimensions="w-full rounded-md"
              />
              <Button
                type="button"
                onClick={handleDeleteConfirm}
                text="Delete"
                bgColor="bg-[#A32D2D] hover:bg-red-800"
                typography="text-white font-bold text-sm"
                padding="px-4 py-2"
                dimensions="w-full rounded-md"
                animation="active:scale-95 transition-all duration-100"
              />
            </div>
          </div>
        </Modal>

      </div>
    </div>
  );
}

export default AdminSubjects;