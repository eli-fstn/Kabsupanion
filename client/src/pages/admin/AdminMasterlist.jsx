import Sidebar from "../../components/layout/Sidebar";
import { getMasterlist, addToMasterlist, editMasterlist, deleteMasterlist } from "../../services/masterlist";
import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { handleApiError, getErrorMessage } from "../../services/errorHandler.ts";
import Button from "../../components/ui/Button";
import { useToast } from "../../context/toastContext";
import Modal from "../../components/ui/Modal";
import LoadingIcon from "../../components/ui/LoadingIcon.jsx";
import CountUp from "react-countup";
import Pagination from "../../components/ui/Pagination.jsx";
import { useUser } from "../../context/userContext.jsx";

function AdminMasterlist() {
  const [list, setList] = useState([]);
  const [listPage, setListPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingForm, setLoadingForm] = useState(false);
  const [activeStatus, setActiveStatus] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState({ 
    name: "", 
    studentNumber: "", 
    registrationStatus: "", 
    general: "" 
  });
  const { student } = useUser()
  const currentUserId = student?.user?.studentNumber;

  // Add forms
  const [name, setName] = useState("");
  const [studentNumber, setStudentNumber] = useState("");
  const [addRegistrationStatus, setAddRegistrationStatus] = useState("");

  // Edit
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [editName, setEditName] = useState("");
  const [editStudentNumber, setEditStudentNumber] = useState("");
  const [editRegistrationStatus, setEditRegistrationStatus] = useState("");
  const [editError, setEditError] = useState({ 
    name: "", 
    studentNumber: "", 
    registrationStatus: "", 
    general: "" 
  });

  // Delete
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const { showToast } = useToast();

  const fetchList = async () => {
    setLoading(true);
    try {
      const data = await getMasterlist();
      setList(data);
    } catch (err) {
      showToast(getErrorMessage(err));
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);
  
  const regStatus = ["All", "regular", "irregular"];

  const filteredStudents = (activeStatus === "All" ? list : list.filter((t) => t.status === activeStatus)).sort((a, b) => {
    const surnameA = a.fullName.split(" ").at(-1) ?? "";
    const surnameB = b.fullName.split(" ").at(-1) ?? "";
    return surnameA.localeCompare(surnameB);
  });

  const handleStatusChange = (status) => {
    setActiveStatus(status);
    setListPage(1);
  };

  const resetForm = () => {
    setName("");
    setStudentNumber("");
    setAddRegistrationStatus("");
    setError({ 
      name: "", 
      studentNumber: "", 
      registrationStatus: "",
      general: "" 
    });
  };

  const handleClose = () => {
    resetForm();
    setModalOpen(false);
  };

  const validateStudentNumber = (num) => /^[0-9]{9}$/.test(num);

  const handleSubmit = async (e) => {
    e.preventDefault();
    let hasError = false;
    const newError = { 
      name: "",
      studentNumber: "", 
      registrationStatus: "", 
      general: "" 
    };

    if (!name) { 
      newError.name = "Name is required."; 
      hasError = true; 
    }
    if (!studentNumber) { 
      newError.studentNumber = "Student number is required."; 
      hasError = true; 
    }
    if (!addRegistrationStatus) { 
      newError.registrationStatus = "Registration Status is required."; 
      hasError = true; 
    }
    else if (!validateStudentNumber(studentNumber)) { 
      newError.studentNumber = "Student number must be exactly 9 digits."; 
      hasError = true; 
    }
    if (hasError) { 
      setError(newError); 
      return; 
    }
    setLoadingForm(true);
    try {
      await addToMasterlist(name, studentNumber, addRegistrationStatus);
      setModalOpen(false);
      resetForm();
      fetchList();
    } catch (err) {
      handleApiError(
        err,
        (msg) => setEditError((prev) => ({ ...prev, general: msg })),
        showToast
      );
    } finally {
      setLoadingForm(false);
    }
  };

  const handleEditOpen = (s) => {
    setSelected(s);
    setEditName(s.fullName);
    setEditStudentNumber(s.studentNumber);
    setEditRegistrationStatus(s.status);
    setEditError({ 
      name: "", 
      studentNumber: "",
      registrationStatus: "",
      general: "" 
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    let hasError = false;
    const newError = { 
      name: "", 
      studentNumber: "", 
      registrationStatus: "",
      general: "" 
    };

    if (!editName) { 
      newError.name = "Name is required."; 
      hasError = true; 
    }
    if (!editStudentNumber) { 
      newError.studentNumber = "Student number is required."; 
      hasError = true; 
    }
    if (!editRegistrationStatus) {
      newError.registrationStatus = "Registration Status is required.";
      hasError = true;
    }
    else if (!validateStudentNumber(editStudentNumber)) { 
      newError.studentNumber = "Student number must be exactly 9 digits.";
       hasError = true;
       }
    if (hasError) { 
      setEditError(newError); 
      return;
    }
    setLoadingForm(true);
    try {
      if (!selected) return;
      await editMasterlist(editName, editStudentNumber, editRegistrationStatus);
      setEditModalOpen(false);
      fetchList();
    } catch (err) {
      handleApiError(
        err,
        (msg) => setEditError((prev) => ({ ...prev, general: msg })),
        showToast
      );
    } finally {
      setLoadingForm(false);
    }
  };

  const handleDeleteOpen = (s) => {
    setSelected(s);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setLoadingForm(true);
    try {
      if (!selected) return;
      await deleteMasterlist(selected.studentNumber);
      setDeleteModalOpen(false);
      fetchList();
    } catch (err) {
      showToast(getErrorMessage(err));
      console.log(err);
    } finally {
      setLoadingForm(false);
    }
  };

  const masterlistPerPage = 10;

  const totalMasterlistPages = Math.ceil(
    filteredStudents.length / masterlistPerPage
  );

  const paginatedMasterlist = filteredStudents.slice(
    (listPage - 1) * masterlistPerPage,
    listPage * masterlistPerPage
  );

  return (
    <div className="bg-[#fafafa] min-h-screen flex">
      <Sidebar />

      <div className="flex-1 px-8 py-4">
        <div className="mb-4">
          <p className="font-bold text-[1.5rem] font-[montserrat]">Masterlist</p>
          <p className="text-gray-400 text-sm">Manage and monitor the official masterlist.</p>
        </div>

        {/*  FILTER BUTTONS */}
        <div className="my-3 flex flex-row justify-between items-center">
          <div className="">
            {regStatus.map((status) => (
              <Button
                key={status}
                text={status}
                onClick={() => handleStatusChange(status)}
                bgColor={activeStatus === status ? "bg-[#1B651B]" : "bg-white"}
                typography={activeStatus === status ? "text-xs font-bold text-white uppercase" : "text-xs font-bold text-gray-700 uppercase"}
                dimensions="rounded-2xl"
                padding="px-5 py-1"
                shadow={activeStatus === status ? "border border-[#1B651B] dark:border-[#1B651B]" : "border border-gray-300 dark:border-[#5a5a5a]"}
                margin="mr-2"
                animation={activeStatus === status ? "" : "transition duration-200 hover:border-gray-500 dark:hover:border-[#8a8a8a]"}
              />
            ))}
          </div>
          <div className="">
            <p className="text-sm font-bold text-[#888888]">Total Students: <span className="text-[#003A02] font-bold text-[1.3rem] ml-1"><CountUp.default start={0} end={filteredStudents.length} duration={1}/></span></p>
          </div>
      </div>

        {/* TABLE */}
        <div className="bg-white w-full mt-4 border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full">

            {/* TABLE HEADER */}
            <thead>
              <tr className="grid grid-cols-[.2fr_2fr_2fr_2fr_.5fr] gap-4 bg-[#F5F5F5] p-2 items-center text-[#888888] text-xs font-bold border-b border-gray-200">
                <th className="flex items-center">No.</th>
                <th className="flex items-center"><Icon className="mr-2" icon="akar-icons:person" width="20" height="20" />Name</th>
                <th className="flex items-center"><Icon className="mr-2" icon="material-symbols:badge-outline" width="20" height="20" />Student Number</th>
                <th className="flex items-center"><Icon className="mr-2" icon="fluent:status-16-regular" width="20" height="20" />Registration Status</th>
                <th className="flex items-center">Actions</th>
              </tr>
            </thead>
          </table>

          {/* TABLE BODY */}
          <div className="h-95 overflow-y-auto flex flex-col">
            {loading ? (
              <div className="flex flex-col">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-[.2fr_2fr_2fr_2fr_.5fr] gap-5 border-b border-gray-100 px-3 py-2 items-center"
                  >
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-4" />
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-32" />
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-24" />
                    <div className="h-5 bg-gray-200 rounded-full animate-pulse w-20" />
                    <div className="flex gap-2">
                      <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                      <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              paginatedMasterlist.length > 0 ? (
                <table className="w-full">
                  <tbody>
                    {paginatedMasterlist.map((s, i) => (
                      <tr key={i} className="grid grid-cols-[.2fr_2fr_2fr_2fr_.5fr] gap-5 border-b border-gray-100 px-3 py-1 items-center text-xs font-medium transition-all duration-200 hover:bg-gray-100">
                        <td className="text-[#828282]">{(listPage - 1) * masterlistPerPage + i + 1}</td>
                        <td>
                          {s.fullName.split(" ").at(-1)}, {s.fullName.split(" ").slice(0, -1).join(" ")}
                          {s.studentNumber === currentUserId && <span className="text-gray-400 font-normal"> (you)</span>}
                          </td>
                        <td>{s.studentNumber}</td>
                        <td>
                          <span
                            className={`px-3 py-0.5 text-xs font-semibold rounded-full border ${
                              s.status === "regular"
                                ? "bg-green-50 text-green-700 border-green-200 uppercase"
                                : "bg-amber-50 text-amber-700 border-amber-200 uppercase"
                            }`}
                          >
                            {s.status}
                          </span>
                        </td>
                        <td className="flex gap-2">
                          <Button
                            text={<Icon icon="mdi:pencil-outline" width="16" height="16" />}
                            onClick={() => handleEditOpen(s)}
                            bgColor="hover:bg-gray-200"
                            typography="text-gray-700 hover:text-gray-500"
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
              ))
            }
          </div>
          <div className="mx-5">
            <Pagination
              currentPage={listPage}
              totalPages={totalMasterlistPages}
              onPageChange={setListPage}
            />
          </div>

          <div className="flex justify-center items-center mb-5 mt-3">
            <Button 
              text="+ Add Student" 
              onClick={() => setModalOpen(true)} 
              bgColor="bg-[#1B651B]" 
              typography="text-white font-bold text-xs" 
              padding="px-5 py-2" 
              dimensions="w-fit rounded-md" 
              animation="active:scale-95 transition-all duration-100 hover:bg-[#288a28]"
            />
          </div>
        </div>

        {/* Add Modal */}
        <Modal isOpen={modalOpen} onClose={handleClose}>
          <form onSubmit={handleSubmit} className="flex flex-col w-80 p-6">
            {loadingForm ? (
              <div className="flex flex-col justify-center items-center h-70">
                <LoadingIcon dimensions="w-20 h-20"/>
                <p className="text-gray-400 text-sm mt-5 animate-[pulse_1s_ease-in-out_infinite]">Submitting...</p>
              </div>
            ) : (
              <>
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
                  className={`border rounded-md mt-1 mb-1 p-2 w-full outline-none text-xs focus:border-green-700 
                    ${error.studentNumber ? "border-red-500" : "border-gray-300"}`} 
                  maxLength={9} />
                {error.studentNumber && <p className="text-red-500 text-xs">{error.studentNumber}</p>}

                <label className="text-xs font-bold mb-1 mt-4">Registration Status <span className="text-red-400">*</span></label>
                <select
                  value={addRegistrationStatus}
                  onChange={(e) => {
                    setAddRegistrationStatus(e.target.value);
                    setError((prev) => ({ ...prev, registrationStatus: "" }));
                  }}
                  className={`border rounded-md mt-1 mb-1 p-2 w-full outline-none text-xs focus:border-green-700 bg-white
                    ${error.registrationStatus ? "border-red-500" : "border-gray-300"}`}
                >
                  <option value="">Select status</option>
                  <option value="regular">Regular</option>
                  <option value="irregular">Irregular</option>
                </select>
                {error.registrationStatus && <p className="text-red-500 text-xs">{error.registrationStatus}</p>}

                {error.general && (<p className="text-red-500 text-xs font-bold text-center my-1">{error.general}</p>)}

                <div className="flex flex-row justify-end gap-3 mt-5">
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
              </>
            )
          }
          </form>
        </Modal>

        {/* Edit Modal */}
        <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)}>
          <form onSubmit={handleEditSubmit} className="flex flex-col w-80 p-6">
            {loadingForm ? (
              <div className="flex flex-col justify-center items-center h-70">
                <LoadingIcon dimensions="w-20 h-20"/>
                <p className="text-gray-400 text-sm mt-5 animate-[pulse_1s_ease-in-out_infinite]">Saving Changes...</p>
              </div>
            ) : (
              <>
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
                  className={`border rounded-md mt-1 mb-1 p-2 w-full outline-none text-xs focus:border-green-700 
                    ${editError.studentNumber ? "border-red-500" : "border-gray-300"}`} />
                {editError.studentNumber && <p className="text-red-500 text-xs">{editError.studentNumber}</p>}

                <label className="text-xs font-bold mb-1 mt-4">Registration Status <span className="text-red-400">*</span></label>
                <select
                  value={editRegistrationStatus}
                  onChange={(e) => {
                    setEditRegistrationStatus(e.target.value);
                    setEditError((prev) => ({ ...prev, registrationStatus: "" }));
                  }}
                  className={`border rounded-md mt-1 mb-1 p-2 w-full outline-none text-xs focus:border-green-700 bg-white
                    ${editError.registrationStatus ? "border-red-500" : "border-gray-300"}`}
                >
                  <option value="">Select status</option>
                  <option value="regular">Regular</option>
                  <option value="irregular">Irregular</option>
                </select>
                {editError.registrationStatus && <p className="text-red-500 text-xs">{editError.registrationStatus}</p>}

                {editError.general && (<p className="text-red-500 text-xs font-bold text-center my-1">{editError.general}</p>)}

                <div className="flex flex-row justify-end gap-3 mt-5">
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
              </>
              )
            }
          </form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
          <div className="flex flex-col items-center w-72 p-6">
             {selected?.studentNumber === currentUserId ? (
              <div className="flex flex-col justify-center items-center h-50">
                <Icon icon="mdi:alert-circle-outline" className="text-[#A32D2D] w-20 h-20" />
                <p className="text-sm text-gray-400 text-center my-5">You can not remove yourself from the masterlist.</p>
                <Button
                  type="button"
                  onClick={() => setDeleteModalOpen(false)}
                  text="Cancel"
                  bgColor="bg-gray-100 hover:bg-gray-200"
                  typography="text-gray-600 font-bold text-xs"
                  padding="px-4 py-2"
                  dimensions="w-fit rounded-md"
                />
              </div>
            ) : selected?.role === "admin" ? (
              <div className="flex flex-col justify-center items-center h-50">
                <Icon icon="mdi:alert-circle-outline" className="text-[#A32D2D] w-20 h-20" />
                <p className="text-sm text-gray-400 text-center my-5">You can not remove another admin from the masterlist, you can demote them from the Admin Users first.</p>
                <Button
                  type="button"
                  onClick={() => setDeleteModalOpen(false)}
                  text="Cancel"
                  bgColor="bg-gray-100 hover:bg-gray-200"
                  typography="text-gray-600 font-bold text-xs"
                  padding="px-4 py-2"
                  dimensions="w-fit rounded-md"
                />
              </div>
            ) : (loadingForm ? (
              <div className="flex flex-col justify-center items-center h-50">
                <LoadingIcon dimensions="w-20 h-20"/>
                <p className="text-gray-400 text-sm mt-5 animate-[pulse_1s_ease-in-out_infinite]">Deleting...</p>
              </div>
            ) : (
              <>
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
              </>
            ))}
          </div>
        </Modal>
      </div>
    </div>
  );
}

export default AdminMasterlist;