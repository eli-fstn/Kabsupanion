import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import ResourceCard from "../../components/ui/ResourceCard";
import { getResources, uploadResource } from "../../services/resources.ts";
import { getSubjects } from "../../services/subjects.ts";
import { handleApiError } from "../../services/errorHandler.ts";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { useUser } from "../../context/userContext";
import UserIcon from "../../components/common/UserIcon";
import LoadingIcon from "../../components/ui/LoadingIcon.jsx";

export default function ClassResources() {
  const [resources, setResources] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const { student } = useUser();
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingForm, setLoadingForm] = useState(false);

  // Add
  const [title, setTitle] = useState("");
  const [subjectID, setSubjectID] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState({
    title: "",
    subject: "",
    file: "",
    general: ""
  });

  const fetchResources = async () => {
    setLoading(true);
    try {
      const data = await getResources();
      setResources(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  const fetchSubjects = async () => {
    try {
      const data = await getSubjects();
      setSubjects(data);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchResources();
    fetchSubjects();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    let hasError = false;
    const newError = {
      title: "",
      subject: "",
      file: "",
      genral: ""
    };

    if (!title) {
      newError.title = "Title is required.";
      hasError = true;
    }
    if (!subjectID) {
      newError.subject = "Subject is required.";
      hasError = true;
    }
    if (!file) {
      newError.file = "File is required.";
      hasError = true;
    }
    if (hasError) {
      setError(newError);
      return;
    }
    setLoadingForm(true);
    try {
      await uploadResource(title, subjectID, student?.user?.name, file);
      setModalOpen(false);
      fetchResources();
    } catch (error) {
      handleApiError(error, (msg) => setError((prev) => ({ ...prev, general: msg })));
      console.log(error);
    } finally {
      setLoadingForm(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setSubjectID("");
    setFile("");
    setError({ title: "", subjectID: "", file: "" });
  }

  const handleClose = () => {
    resetForm();
    setModalOpen(false);
  }

  return (
    <section className="min-h-screen p-4 sm:p-6 md:p-8 lg:p-10" id="class-resources">
      <header className="mt-3">
        <p className="font-bold text-[1.5rem] md:text-[1.7rem] font-[montserrat] leading-7">Class Resources</p>
        <p className="text-sm sm:text-base">Collaborate and exchange notes with your fellow blockmates.</p>
      </header>

      <div className="bg-white w-full mt-5 border border-gray-200 rounded-xl p-3 sm:p-4 flex flex-col">
        <div className="max-h-[60vh] sm:max-h-[65vh] md:h-150 overflow-y-auto flex flex-col">
          {loading ? (
            <div className="flex justify-center items-center flex-1 py-16">
              <LoadingIcon dimensions="w-10 h-10" />
            </div>
          ) : (
            resources.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 items-stretch">
                {resources.map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    title={resource.title}
                    subject={resource.subject.code}
                    uploadedBy={resource.uploadedBy.name}
                    fileUrl={resource.fileUrl}
                  />
                ))}
              </div>
            ) : (
              <div className="flex justify-center items-center flex-1 py-16 text-center px-4">
                <p className="text-gray-400 text-sm sm:text-base">There's no resources uploaded yet.</p>
              </div>
            )
          )}
        </div>
        <div className="flex justify-center items-center pt-3">
          <Button
            text="+ Upload Resources"
            onClick={() => setModalOpen(true)}
            bgColor="bg-[#1B651B]"
            typography="text-white font-bold text-xs whitespace-nowrap"
            padding="px-4 py-2"
            dimensions="w-fit rounded-md"
            animation="active:scale-95 transition-all duration-100 hover:bg-[#288a28]"
          />
        </div>

        {/* FORM */}
        <Modal isOpen={modalOpen} onClose={handleClose}>
          <form onSubmit={handleSubmit} className="flex flex-col w-full max-w-sm sm:max-w-md p-3">
            {loadingForm ? (
              <div className="flex flex-col justify-center items-center h-56 sm:h-64">
                <LoadingIcon dimensions="w-16 h-16 sm:w-20 sm:h-20" />
                <p className="text-gray-400 text-sm mt-5 animate-[pulse_1s_ease-in-out_infinite] text-center">Submitting...</p>
              </div>
            ) : (
              <>
                <p className="font-bold text-base sm:text-[1.2rem] text-[#1B651B] font-['Montserrat']">Upload Resources</p>
                <p className="text-gray-400 text-xs mb-5">Share learning materials with your classmates</p>

                {/* Title of the resources*/}
                <label className="text-xs font-bold mb-1 mt-2">Title <span className="text-red-400">*</span></label>
                <input
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setError((prev) => ({ ...prev, title: "" }));
                  }}
                  type="text"
                  placeholder="Enter resource title"
                  className={`border rounded-md mt-1 mb-1 p-2 w-full outline-none text-xs focus:border-green-700 
                    ${error.title ? "border-red-500" : "border-gray-300"}`}
                />
                {error.title && (
                  <p className="text-red-500 text-xs">{error.title}</p>
                )}

                {/* Subject */}
                <label className="text-xs font-bold mb-1 mt-2">Subject <span className="text-red-400">*</span></label>
                <select
                  value={subjectID}
                  onChange={(e) => {
                    setSubjectID(e.target.value);
                    setError((prev) => ({ ...prev, subject: "" }));
                  }}
                  className={`border rounded-md mt-1 mb-1 p-2 w-full outline-none text-xs focus:border-green-700 
                    ${error.subject ? "border-red-500" : "border-gray-300"}`}
                >
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

                {/* File to be uploaded */}
                <label className="text-xs font-bold mb-1 mt-2">File <span className="text-red-400">*</span></label>
                <input
                  onChange={(e) => {
                    setFile(e.target.files[0]);
                    setError((prev) => ({ ...prev, file: "" }));
                  }}
                  type="file"
                  accept=".pdf, .png, .jpg, .jpeg, .docx, .pptx"
                  className={`border rounded-lg p-2.5 w-full outline-none text-xs focus:border-[#1B651B] transition-all duration-200 mb-1 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-[#1B651B] file:text-white hover:file:bg-green-700 
                    ${error.file ? "border-red-500" : "border-gray-200"}`}
                />
                {error.file && (
                  <p className="text-red-500 text-xs">{error.file}</p>
                )}

                {/* Uploaded by (current user)*/}
                <label className="text-xs font-bold mb-1 mt-3">Uploaded by</label>
                <div className="flex flex-row items-center mt-2">
                  <UserIcon typography="text-gray-400 shrink-0" dimensions="w-5" />
                  <span className="ml-1 text-xs font-bold text-gray-500 truncate">{student?.user?.name}</span>
                </div>

                {error.general && (
                  <p className="text-red-500 text-[.8rem] leading-4 font-bold my-1 text-center">{error.general}</p>
                )}

                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-5">
                  <Button
                    type="button"
                    onClick={handleClose}
                    text="Cancel"
                    bgColor="bg-gray-100 hover:bg-gray-200"
                    typography="text-gray-600 font-bold text-xs"
                    padding="px-4 py-2"
                    dimensions="w-full sm:w-fit rounded-md"
                  />
                  <Button
                    type="submit"
                    text="Submit"
                    bgColor="bg-[#1B651B]"
                    typography="text-white font-bold text-xs"
                    padding="px-4 py-2"
                    dimensions="w-full sm:w-fit rounded-md"
                    animation="active:scale-95 transition-all duration-100 hover:bg-[#288a28]"
                  />
                </div>
              </>
            )}
          </form>
        </Modal>
      </div>
    </section>
  );
}