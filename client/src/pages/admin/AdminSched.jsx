import Sidebar from "../../components/layout/Sidebar";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import LoadingIcon from "../../components/ui/LoadingIcon";
import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { getSubjects } from "../../services/subjects";
import { uploadSchedule, editSchedule, deleteSchedule } from "../../services/schedule";
import { handleApiError } from "../../services/errorHandler";

function AdminSched() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingForm, setLoadingForm] = useState(false);

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  // Add form
  const [addSubjectId, setAddSubjectId] = useState("");
  const [addDay, setAddDay] = useState("");
  const [addStartTime, setAddStartTime] = useState("");
  const [addEndTime, setAddEndTime] = useState("");
  const [addRoom, setAddRoom] = useState("");
  const [error, setError] = useState({ subject: "", day: "", startTime: "", endTime: "", room: "", general: "" });

  // Edit form
  const [editDay, setEditDay] = useState("");
  const [editStartTime, setEditStartTime] = useState("");
  const [editEndTime, setEditEndTime] = useState("");
  const [editRoom, setEditRoom] = useState("");
  const [editError, setEditError] = useState({ day: "", startTime: "", endTime: "", room: "", general: "" });

  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const time_slots = [
    "07:00", "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00",
  ];

  const time_labels = [
    "7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM"
  ];

  const COLORS = [
    "bg-cyan-100", "bg-yellow-100", "bg-green-100", "bg-orange-100",
    "bg-pink-100", "bg-purple-100", "bg-red-100", "bg-blue-100",
  ];

  const TEXT_COLORS = [
    "text-cyan-800", "text-yellow-800", "text-green-800", "text-orange-800",
    "text-pink-800", "text-purple-800", "text-red-800", "text-blue-800",
  ];

  const getColor = (code) => {
    const index = subjects.findIndex((s) => s.code === code);
    return COLORS[index % COLORS.length];
  };

  const getColorIndex = (code) => subjects.findIndex((s) => s.code === code);

  const scheduleData = subjects.flatMap((subject) =>
    (subject.schedules || []).map((sched) => ({
      subjectId: subject.id,
      scheduleId: sched.id,
      code: subject.code,
      day: sched.day,
      startTime: sched.startTime,
      endTime: sched.endTime,
      room: sched.room,
    }))
  );

  const to24hr = (time) => {
    const [timePart, modifier] = time.split(" ");
    let [hours, minutes] = timePart.split(":");
    if (modifier === "PM" && hours !== "12") hours = String(parseInt(hours) + 12);
    if (modifier === "AM" && hours === "12") hours = "00";
    return `${hours.padStart(2, "0")}:${minutes}`;
  };

  const to12hr = (time) => {
    let [hours, minutes] = time.split(":");
    let h = parseInt(hours);
    const modifier = h >= 12 ? "PM" : "AM";
    if (h === 0) h = 12;
    if (h > 12) h = h - 12;
    return `${h}:${minutes} ${modifier}`;
  };

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const data = await getSubjects();
      setSubjects(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const resetForm = () => {
    setAddSubjectId(""); setAddDay(""); setAddStartTime(""); setAddEndTime(""); setAddRoom("");
    setError({ subject: "", day: "", startTime: "", endTime: "", room: "", general: "" });
  };

  const handleClose = () => { resetForm(); setAddModalOpen(false); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let hasError = false;
    const newError = { subject: "", day: "", startTime: "", endTime: "", room: "", general: "" };

    if (!addSubjectId) { newError.subject = "Subject is required."; hasError = true; }
    if (!addDay) { newError.day = "Day is required."; hasError = true; }
    if (!addStartTime) { newError.startTime = "Start time is required."; hasError = true; }
    if (!addEndTime) { newError.endTime = "End time is required."; hasError = true; }
    if (!addRoom) { newError.room = "Room is required."; hasError = true; }

    if (hasError) { setError(newError); return; }

    setLoadingForm(true);
    try {
      await uploadSchedule(addSubjectId, addDay, to12hr(addStartTime), to12hr(addEndTime), addRoom);
      setAddModalOpen(false);
      resetForm();
      fetchSubjects();
    } catch (err) {
      handleApiError(err, (msg) => setError((prev) => ({ ...prev, general: msg })));
    } finally {
      setLoadingForm(false);
    }
  };

  const handleEditOpen = (sched) => {
    setSelected(sched);
    setSelectedSchedule(sched);
    setEditDay(sched.day);
    setEditStartTime(to24hr(sched.startTime));
    setEditEndTime(to24hr(sched.endTime));
    setEditRoom(sched.room ?? "");
    setEditError({ day: "", startTime: "", endTime: "", room: "", general: "" });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    let hasError = false;
    const newError = { day: "", startTime: "", endTime: "", room: "", general: "" };

    if (!editDay) { newError.day = "Day is required."; hasError = true; }
    if (!editStartTime) { newError.startTime = "Start time is required."; hasError = true; }
    if (!editEndTime) { newError.endTime = "End time is required."; hasError = true; }

    if (hasError) { setEditError(newError); return; }

    console.log(editDay);
    setLoadingForm(true);
    try {
      await editSchedule(selectedSchedule.subjectId, selectedSchedule.scheduleId, editDay, to12hr(editStartTime), to12hr(editEndTime), editRoom);
      setEditModalOpen(false);
      fetchSubjects();
    } catch (err) {
      handleApiError(err, (msg) => setEditError((prev) => ({ ...prev, general: msg })));
    } finally {
      setLoadingForm(false);
    }
  };

  const handleDeleteOpen = (sched) => {
    setSelected(sched);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setLoadingForm(true);
    try {
      await deleteSchedule(selected.subjectId, selected.scheduleId);
      setDeleteModalOpen(false);
      fetchSubjects();
    } catch (err) {
      console.log(err);
    } finally {
      setLoadingForm(false);
    }
  };

  console.log(scheduleData);
  console.log(to24hr("10:00 AM"));
  console.log(to24hr("12:00 PM"));

  return (
    <div className="bg-[#fafafa] min-h-screen flex">
      <Sidebar />

      <div className="flex-1 p-8">
        <div className="mb-6">
          <p className="font-bold text-[1.7rem] font-[montserrat]">Class Schedule</p>
          <p className="text-gray-400 text-sm">Keep the section's class schedule up to date.</p>
        </div>

        <div className="overflow-x-auto mt-5 rounded-md">
          <table className="w-full border-collapse text-xs rounded-md">
            <thead>
              <tr>
                <th className="bg-[#1B651B] text-white border p-2 border-gray-300 text-xs">TIME</th>
                {days.map((t) => (
                  <th key={t} className="bg-[#F5F5F5] border text-black border-gray-200 text-xs uppercase w-32 p-3">{t}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white">
              {time_slots.map((time, si) => {
                const timeStart = time.split(" - ")[0];
                return (
                  <tr key={time}>
                    <td className="border border-gray-300 py-3 text-center text-xs font-bold text-gray-500 bg-gray-50 w-24 whitespace-nowrap px-2">
                      <div>{time_labels[si]}</div>
                      {time_labels[si + 1] && (
                        <div className="text-[10px] font-normal opacity-60">
                          – {time_labels[si + 1]}
                        </div>
                      )}
                    </td>
                    {days.map((d) => {
                      const subject = scheduleData.find(
                        (s) => s.day === d && timeStart >= to24hr(s.startTime) && timeStart < to24hr(s.endTime)
                      );
                      const colorIdx = subject ? getColorIndex(subject.code) : -1;
                      const bgColor = colorIdx >= 0 ? COLORS[colorIdx % COLORS.length] : "";
                      const textColor =
                        colorIdx >= 0 ? TEXT_COLORS[colorIdx % TEXT_COLORS.length] : "";
                      const isStart = subject && timeStart === to24hr(subject.startTime);

                      return (
                        <td key={d} className={`border border-gray-300 py-3 w-32 text-center text-xs font-bold ${subject ? getColor(subject.code) : ""}`}>
                          {subject && isStart ? (
                            <div className={`relative group px-1 ${textColor}`}>
                              <p className="font-bold">{subject.code}</p>
                              <p className="font-normal opacity-70">{subject.room}</p>
                              <div className="absolute top-0 right-0 hidden group-hover:flex gap-1 p-1">
                                <button
                                  onClick={() => handleEditOpen(subject)}
                                  className="bg-white rounded p-0.5 shadow hover:bg-gray-100"
                                >
                                  <Icon icon="mdi:pencil-outline" width="12" className="text-gray-700" />
                                </button>
                                <button
                                  onClick={() => handleDeleteOpen(subject)}
                                  className="bg-white rounded p-0.5 shadow hover:bg-red-100"
                                >
                                  <Icon icon="mdi:trash-can-outline" width="12" className="text-red-500" />
                                </button>
                              </div>
                            </div>
                          ) : null}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex justify-center items-center mt-5">
          <Button
            text="+ Add Schedule"
            onClick={() => setAddModalOpen(true)}
            bgColor="bg-[#1B651B]"
            typography="text-white font-bold text-xs"
            padding="px-5 py-2"
            dimensions="w-fit rounded-md"
            animation="active:scale-95 transition-all duration-100 hover:bg-[#288a28]"
          />
        </div>

        {/* Add Modal */}
        <Modal isOpen={addModalOpen} onClose={handleClose}>
          <form onSubmit={handleSubmit} className="flex flex-col w-80 p-3">
            {loadingForm ? (
              <div className="flex flex-col justify-center items-center h-70">
                <LoadingIcon dimensions="w-20 h-20" />
                <p className="text-gray-400 text-sm mt-5 animate-pulse">Submitting...</p>
              </div>
            ) : (
              <>
                <p className="font-bold text-[1.2rem] text-[#1B651B] font-['Montserrat']">Add Schedule</p>
                <p className="text-gray-400 text-xs mb-5">Add a new schedule slot.</p>

                <label className="text-xs font-bold mb-1 mt-2">Subject <span className="text-red-400">*</span></label>
                <select value={addSubjectId} onChange={(e) => { setAddSubjectId(e.target.value); setError((prev) => ({ ...prev, subject: "" })); }} className={`border rounded-md mt-1 mb-1 p-2 w-full outline-none text-xs focus:border-green-700 bg-white ${error.subject ? "border-red-500" : "border-gray-300"}`}>
                  <option value="">Select a subject</option>
                  {subjects.map((s) => (<option key={s.id} value={s.id}>{s.code} — {s.name}</option>))}
                </select>
                {error.subject && <p className="text-red-500 text-xs">{error.subject}</p>}

                <label className="text-xs font-bold mb-1 mt-4">Day <span className="text-red-400">*</span></label>
                <select value={addDay} onChange={(e) => { setAddDay(e.target.value); setError((prev) => ({ ...prev, day: "" })); }} className={`border rounded-md mt-1 mb-1 p-2 w-full outline-none text-xs focus:border-green-700 bg-white ${error.day ? "border-red-500" : "border-gray-300"}`}>
                  <option value="">Select a day</option>
                  {days.map((d) => (<option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>))}
                </select>
                {error.day && <p className="text-red-500 text-xs">{error.day}</p>}

                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-xs font-bold mb-1 mt-4 block">Start Time <span className="text-red-400">*</span></label>
                    <input type="time" value={addStartTime} onChange={(e) => { setAddStartTime(e.target.value); setError((prev) => ({ ...prev, startTime: "" })); }} className={`border rounded-md mt-1 mb-1 p-2 w-full outline-none text-xs focus:border-green-700 ${error.startTime ? "border-red-500" : "border-gray-300"}`} />
                    {error.startTime && <p className="text-red-500 text-xs">{error.startTime}</p>}
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-bold mb-1 mt-4 block">End Time <span className="text-red-400">*</span></label>
                    <input type="time" value={addEndTime} onChange={(e) => { setAddEndTime(e.target.value); setError((prev) => ({ ...prev, endTime: "" })); }} className={`border rounded-md mt-1 mb-1 p-2 w-full outline-none text-xs focus:border-green-700 ${error.endTime ? "border-red-500" : "border-gray-300"}`} />
                    {error.endTime && <p className="text-red-500 text-xs">{error.endTime}</p>}
                  </div>
                </div>

                <label className="text-xs font-bold mb-1 mt-4">Room <span className="text-red-400">*</span></label>
                <input type="text" value={addRoom} placeholder="e.g. A-304" onChange={(e) => { setAddRoom(e.target.value); setError((prev) => ({ ...prev, room: "" })); }} className={`border rounded-md mt-1 mb-1 p-2 w-full outline-none text-xs focus:border-green-700 ${error.room ? "border-red-500" : "border-gray-300"}`} />
                {error.room && <p className="text-red-500 text-xs">{error.room}</p>}

                {error.general && <p className="text-red-500 text-xs font-bold text-center my-1">{error.general}</p>}

                <div className="flex flex-row justify-end gap-3 mt-5">
                  <Button type="button" onClick={handleClose} text="Cancel" bgColor="bg-gray-100 hover:bg-gray-200" typography="text-gray-600 font-bold text-xs" padding="px-4 py-2" dimensions="w-fit rounded-md" />
                  <Button type="submit" text="Submit" bgColor="bg-[#1B651B]" typography="text-white font-bold text-xs" padding="px-4 py-2" dimensions="w-fit rounded-md" animation="active:scale-95 transition-all duration-100 hover:bg-[#288a28]" />
                </div>
              </>
            )}
          </form>
        </Modal>

        {/* Edit Modal */}
        <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)}>
          <form onSubmit={handleEditSubmit} className="flex flex-col w-80 p-3">
            {loadingForm ? (
              <div className="flex flex-col justify-center items-center h-70">
                <LoadingIcon dimensions="w-20 h-20" />
                <p className="text-gray-400 text-sm mt-5 animate-pulse">Saving...</p>
              </div>
            ) : (
              <>
                <p className="font-bold text-[1.2rem] text-[#1B651B] font-['Montserrat']">Edit Schedule</p>
                <p className="text-gray-400 text-xs mb-5">Update <span className="font-bold text-[#3a3a3a]">{selected?.code}</span> schedule.</p>

                <label className="text-xs font-bold mb-1 mt-2">Day <span className="text-red-400">*</span></label>
                <select value={editDay} onChange={(e) => { setEditDay(e.target.value); setEditError((prev) => ({ ...prev, day: "" })); }} className={`border rounded-md mt-1 mb-1 p-2 w-full outline-none text-xs focus:border-green-700 bg-white ${editError.day ? "border-red-500" : "border-gray-300"}`}>
                  <option value="">Select a day</option>
                  {days.map((d) => (<option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>))}
                </select>
                {editError.day && <p className="text-red-500 text-xs">{editError.day}</p>}

                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-xs font-bold mb-1 mt-4 block">Start Time <span className="text-red-400">*</span></label>
                    <input type="time" value={editStartTime} onChange={(e) => { setEditStartTime(e.target.value); setEditError((prev) => ({ ...prev, startTime: "" })); }} className={`border rounded-md mt-1 mb-1 p-2 w-full outline-none text-xs focus:border-green-700 ${editError.startTime ? "border-red-500" : "border-gray-300"}`} />
                    {editError.startTime && <p className="text-red-500 text-xs">{editError.startTime}</p>}
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-bold mb-1 mt-4 block">End Time <span className="text-red-400">*</span></label>
                    <input type="time" value={editEndTime} onChange={(e) => { setEditEndTime(e.target.value); setEditError((prev) => ({ ...prev, endTime: "" })); }} className={`border rounded-md mt-1 mb-1 p-2 w-full outline-none text-xs focus:border-green-700 ${editError.endTime ? "border-red-500" : "border-gray-300"}`} />
                    {editError.endTime && <p className="text-red-500 text-xs">{editError.endTime}</p>}
                  </div>
                </div>

                <label className="text-xs font-bold mb-1 mt-4">Room <span className="text-gray-300 font-normal">(optional)</span></label>
                <input type="text" value={editRoom} placeholder="e.g. A-304" onChange={(e) => setEditRoom(e.target.value)} className="border border-gray-300 rounded-md mt-1 mb-1 p-2 w-full outline-none text-xs focus:border-green-700" />

                {editError.general && <p className="text-red-500 text-xs font-bold text-center my-1">{editError.general}</p>}

                <div className="flex flex-row justify-end gap-3 mt-5">
                  <Button type="button" onClick={() => setEditModalOpen(false)} text="Cancel" bgColor="bg-gray-100 hover:bg-gray-200" typography="text-gray-600 font-bold text-xs" padding="px-4 py-2" dimensions="w-fit rounded-md" />
                  <Button type="submit" text="Save Changes" bgColor="bg-[#1B651B]" typography="text-white font-bold text-xs" padding="px-4 py-2" dimensions="w-fit rounded-md" animation="active:scale-95 transition-all duration-100 hover:bg-[#288a28]" />
                </div>
              </>
            )}
          </form>
        </Modal>

        {/* Delete Modal */}
        <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
          <div className="flex flex-col items-center w-72 p-3">
            {loadingForm ? (
              <div className="flex flex-col justify-center items-center h-50">
                <LoadingIcon dimensions="w-20 h-20" />
                <p className="text-gray-400 text-sm mt-5 animate-pulse">Deleting...</p>
              </div>
            ) : (
              <>
                <div className="bg-[#fcebeb] rounded-full p-4 mb-4">
                  <Icon icon="mdi:trash-can-outline" width="30" className="text-[#A32D2D]" />
                </div>
                <p className="font-bold text-[1rem] text-[#A32D2D] text-center">Delete Schedule?</p>
                <p className="text-gray-400 text-sm text-center mt-2 mb-6">
                  Are you sure you want to delete <span className="font-bold text-[#3a3a3a]">{selected?.code}</span> on <span className="font-bold text-[#3a3a3a]">{selected?.day}</span>? This action cannot be undone.
                </p>
                <div className="flex justify-center items-center gap-3 w-full">
                  <Button type="button" onClick={() => setDeleteModalOpen(false)} text="Cancel" bgColor="bg-gray-100 hover:bg-gray-200" typography="text-gray-600 font-bold text-xs" padding="px-4 py-2" dimensions="w-fit rounded-md" />
                  <Button type="button" onClick={handleDeleteConfirm} text="Delete" bgColor="bg-[#A32D2D] hover:bg-red-800" typography="text-white font-bold text-xs" padding="px-4 py-2" dimensions="w-fit rounded-md" animation="active:scale-95 transition-all duration-100" />
                </div>
              </>
            )}
          </div>
        </Modal>

      </div>
    </div>
  );
}

export default AdminSched;