import Sidebar from "../../components/layout/Sidebar";
import { getMasterlist, addToMasterlist, editMasterlist, deleteMasterlist } from "../../services/auth";
import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { handleApiError } from "../../services/errorHandler";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";

function AdminMasterlist() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Add form
  const [name, setName] = useState("");
  const [studentNumber, setStudentNumber] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState({ name: "", studentNumber: "", general: "" });

  // Edit
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [editName, setEditName] = useState("");
  const [editStudentNumber, setEditStudentNumber] = useState("");
  const [editError, setEditError] = useState({ name: "", studentNumber: "", general: "" });

  // Delete
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const fetchList = async () => {
    setLoading(true);
    try {
      const data = await getMasterlist();
      setList(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);
  
  const filteredStudents = list.sort((a, b) => {
    const surnameA = a.fullName.split(" ").at(-1);
    const surnameB = b.fullName.split(" ").at(-1);
    return surnameA.localeCompare(surnameB);
  });

  const resetForm = () => {
    setName("");
    setStudentNumber("");
    setError({ name: "", studentNumber: "", general: "" });
  };

  const handleClose = () => {
    resetForm();
    setModalOpen(false);
  };

  const validateStudentNumber = (num) => /^[0-9]{9}$/.test(num);

  const handleSubmit = async (e) => {
    e.preventDefault();
    let hasError = false;
    const newError = { name: "", studentNumber: "", general: "" };

    if (!name) { newError.name = "Name is required."; hasError = true; }
    if (!studentNumber) { newError.studentNumber = "Student number is required."; hasError = true; }
    else if (!validateStudentNumber(studentNumber)) { newError.studentNumber = "Student number must be exactly 9 digits."; hasError = true; }
    if (hasError) { setError(newError); return; }

    try {
      await addToMasterlist(name, studentNumber);
      setModalOpen(false);
      resetForm();
      fetchList();
    } catch (err) {
      console.log("API not yet available");
      handleApiError(err, (msg) => setError((prev) => ({ ...prev, general: msg })));
    }
  };

  const handleEditOpen = (s) => {
    setSelected(s);
    setEditName(s.fullName);
    setEditStudentNumber(s.studentNumber);
    setEditError({ name: "", studentNumber: "", general: "" });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    let hasError = false;
    const newError = { name: "", studentNumber: "", general: "" };

    if (!editName) { newError.name = "Name is required."; hasError = true; }
    if (!editStudentNumber) { newError.studentNumber = "Student number is required."; hasError = true; }
    else if (!validateStudentNumber(editStudentNumber)) { newError.studentNumber = "Student number must be exactly 9 digits."; hasError = true; }
    if (hasError) { setEditError(newError); return; }
    
    try {
      if (!selected) return;
      await editMasterlist(selected.studentNumber, editName);
      setEditModalOpen(false);
      fetchList();
    } catch (err) {
      console.log("API not yet available");
      handleApiError(err, (msg) => setEditError((prev) => ({ ...prev, general: msg })));
    }
  };

  const handleDeleteOpen = (s) => {
    setSelected(s);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      if (!selected) return;
      await deleteMasterlist(selected.studentNumber);
      setDeleteModalOpen(false);
      fetchList();
    } catch (err) {
      console.log("API not yet available");
      console.log(err);
    }
  };

  return (
    <div className="bg-[#F4F4F4] min-h-screen flex">
      <Sidebar />

      <div className="flex-1 p-8">
        <div className="mb-6">
          <p className="font-bold text-[1.7rem] font-[montserrat]">Masterlist</p>
          <p className="text-gray-400 text-sm">Manage and monitor the official masterlist.</p>
        </div>

        <div className="bg-white w-full mt-5 border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="grid grid-cols-[.2fr_2fr_2fr_2fr_.5fr] gap-4 bg-[#F5F5F5] p-3 items-center text-[#888888] text-sm font-bold border-b border-gray-200">
                <th className="flex items-center">No.</th>
                <th className="flex items-center"><Icon className="mr-2" icon="akar-icons:person" width="22" height="22" />Name</th>
                <th className="flex items-center"><Icon className="mr-2" icon="material-symbols:badge-outline" width="22" height="22" />Student Number</th>
                <th className="flex items-center"><Icon className="mr-2" icon="fluent:status-16-regular" width="22" height="22" />Registration Status</th>
                <th className="flex items-center">Actions</th>
              </tr>
            </thead>
          </table>

          <div className="h-125 overflow-y-auto flex flex-col">
            {filteredStudents.length > 0 ? (
              <table className="w-full">
                <tbody>
                  {filteredStudents.map((s, i) => (
                    <tr key={i.id} className="grid grid-cols-[.2fr_2fr_2fr_2fr_.5fr] gap-5 border-b border-gray-100 px-3 py-2 items-center text-sm font-medium transition-all duration-200 hover:bg-[#e1e1e188]">
                      <td className="text-[#828282]">{i + 1}</td>
                      <td>{s.fullName.split(" ").at(-1)}, {s.fullName.split(" ").slice(0, -1).join(" ")}</td>
                      <td className="text-[#828282]">{s.studentNumber}</td>
                      <td>
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                            s.registrationStatus === "Regular"
                              ? "bg-green-100 text-green-700 border-green-300"
                              : "bg-orange-100 text-orange-700 border-orange-300"
                          }`}
                        >
                          {s.registrationStatus}
                        </span>
                      </td>
                      <td className="flex gap-2">
                        <Button
                          text={<Icon icon="mdi:pencil-outline" width="16" height="16" />}
                          onClick={() => handleEditOpen(s)}
                          bgColor="hover:bg-gray-100"
                          typography="text-gray-700 hover:text-black"
                          dimensions="rounded-md"
                          padding="p-1.5"
                          animation="transition-all duration-200 active:scale-95"
                        />

                        <Button
                          text={<Icon icon="mdi:trash-can-outline" width="16" height="16" />}
                          onClick={() => handleDeleteOpen(s)}
                          bgColor="hover:bg-red-100"
                          typography="text-red-500 hover:text-red-700"
                          dimensions="rounded-md"
                          padding="p-1.5"
                          animation="transition-all duration-200 active:scale-95"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex justify-center items-center flex-1">
                <p className="text-gray-400">No masterlist entries yet.</p>
              </div>
            )}
          </div>

          <div className="flex justify-center items-center mb-5 mt-4">
            <Button 
              text="+ Add Student" 
              onClick={() => setModalOpen(true)} 
              bgColor="bg-[#1B651B]" 
              typography="text-white font-bold text-sm" 
              padding="px-5 py-2" 
              dimensions="w-fit rounded-md" 
              animation="active:scale-95 transition-all duration-100 hover:bg-[#288a28]"
            />
          </div>
        </div>

        {/* Add Modal */}
        <Modal isOpen={modalOpen} onClose={handleClose}>
          <form onSubmit={handleSubmit} className="flex flex-col w-80 p-3">
            <p className="font-bold text-[1.2rem] text-[#1B651B] font-['Montserrat']">Add Masterlist Entry</p>
            <p className="text-gray-400 text-xs mb-5">Add a new student to the masterlist.</p>

            <label className="text-xs font-bold mb-1 mt-2">Full Name <span className="text-red-400">*</span></label>
            <input 
              type="text" 
              value={name} 
              placeholder="Enter full name" 
              onChange={(e) => { 
                setName(e.target.value); 
                setError((prev) => ({ ...prev, name: "" })); }} 
              className={`border rounded-md mt-1 mb-1 p-2 w-full outline-none text-xs focus:border-green-700 
              ${error.name ? "border-red-500" : "border-gray-300"}`} />
            {error.name && <p className="text-red-500 text-xs">{error.name}</p>}

            <label className="text-xs font-bold mb-1 mt-4">Student Number <span className="text-red-400">*</span></label>
            <input 
              type="text" 
              value={studentNumber} 
              placeholder="9-digit student number" 
              onChange={(e) => { 
                setStudentNumber(e.target.value); 
                setError((prev) => ({ ...prev, studentNumber: "" })); }} 
              className={`border rounded-md mt-1 mb-5 p-2 w-full outline-none text-xs focus:border-green-700 
                ${error.studentNumber ? "border-red-500" : "border-gray-300"}`} 
              maxLength={9} />
            {error.studentNumber && <p className="text-red-500 text-xs">{error.studentNumber}</p>}

            {error.general && (<p className="text-red-500 text-xs font-bold text-center my-1">{error.general}</p>)}

            <div className="flex flex-row justify-end gap-3 mt-2">
              <Button 
                type="button" 
                onClick={handleClose} 
                text="Cancel" 
                bgColor="bg-gray-100 hover:bg-gray-200" 
                typography="text-gray-600 font-bold text-xs" 
                padding="px-4 py-2" 
                dimensions="w-fit rounded-md"
              />
              <Button 
                type="submit" 
                text="Submit" 
                bgColor="bg-[#1B651B]" 
                typography="text-white font-bold text-xs" 
                padding="px-4 py-2" 
                dimensions="w-fit rounded-md" 
                animation="active:scale-95 transition-all duration-100 hover:bg-[#288a28]"
              />
            </div>
          </form>
        </Modal>

        {/* Edit Modal */}
        <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)}>
          <form onSubmit={handleEditSubmit} className="flex flex-col w-80 p-3">
            <p className="font-bold text-[1.2rem] text-[#1B651B] font-['Montserrat']">Edit Masterlist Entry</p>
            <p className="text-gray-400 text-xs mb-5">Update student details.</p>

            <label className="text-xs font-bold mb-1 mt-2">Full Name <span className="text-red-400">*</span></label>
            <input 
              type="text" 
              value={editName} 
              onChange={(e) => { setEditName(e.target.value); setEditError((prev) => ({ ...prev, name: "" })); }} 
              className={`border rounded-md mt-1 mb-1 p-2 w-full outline-none text-xs focus:border-green-700 
                ${editError.name ? "border-red-500" : "border-gray-300"}`} />
            {editError.name && <p className="text-red-500 text-xs">{editError.name}</p>}

            <label className="text-xs font-bold mb-1 mt-4">Student Number <span className="text-red-400">*</span></label>
            <input 
              type="text" 
              value={editStudentNumber} 
              onChange={(e) => { setEditStudentNumber(e.target.value); setEditError((prev) => ({ ...prev, studentNumber: "" })); }} 
              className={`border rounded-md mt-1 mb-5 p-2 w-full outline-none text-xs focus:border-green-700 
                ${editError.studentNumber ? "border-red-500" : "border-gray-300"}`} />
            {editError.studentNumber && <p className="text-red-500 text-xs">{editError.studentNumber}</p>}

            {editError.general && (<p className="text-red-500 text-xs font-bold text-center my-2">{editError.general}</p>)}

            <div className="flex flex-row justify-end gap-3 mt-2">
              <Button 
                type="button" 
                onClick={() => setEditModalOpen(false)} 
                text="Cancel"
                 bgColor="bg-gray-100 hover:bg-gray-200" 
                 typography="text-gray-600 font-bold text-xs" 
                 padding="px-4 py-2" 
                 dimensions="w-fit rounded-md"
                />
              <Button 
                type="submit" 
                text="Save Changes" 
                bgColor="bg-[#1B651B]" 
                typography="text-white font-bold text-xs"
                padding="px-4 py-2" 
                dimensions="w-fit rounded-md" 
                animation="active:scale-95 transition-all duration-100 hover:bg-[#288a28]"
              />
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
          <div className="flex flex-col items-center w-72 p-3">
            <div className="bg-[#fcebeb] rounded-full p-4 mb-4">
              <Icon icon="mdi:trash-can-outline" width="30" className="text-[#A32D2D]" />
            </div>
            <p className="font-bold text-[1rem] text-[#A32D2D] text-center">Remove from Masterlist?</p>
            <p className="text-gray-400 text-sm text-center mt-2 mb-6">Are you sure you want to remove <span className="font-bold text-[#3a3a3a]">{selected?.fullName}</span> from the masterlist? This action cannot be undone.</p>
            <div className="flex justify-center items-center gap-3 w-full">
              <Button 
                type="button" 
                onClick={() => setDeleteModalOpen(false)} 
                text="Cancel" 
                bgColor="bg-gray-100 hover:bg-gray-200" 
                typography="text-gray-600 font-bold text-xs" 
                padding="px-4 py-2" 
                dimensions="w-fit rounded-md"
              />
              <Button 
                type="button" 
                onClick={handleDeleteConfirm} 
                text="Delete" 
                bgColor="bg-[#A32D2D] hover:bg-red-800" 
                typography="text-white font-bold text-xs" 
                padding="px-4 py-2" 
                dimensions="w-fit rounded-md" 
                animation="active:scale-95 transition-all duration-100"
              />
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}

export default AdminMasterlist;
