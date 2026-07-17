import { useState, useEffect, useRef } from "react";
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
  const sectionRef = useRef(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const successTimeoutRef = useRef(null);

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
  }, [resources]);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const data = await getResources();
      setResources(data.filter((resource) => resource.status === "approved"));
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
      setShowSuccess(true);
      fetchResources();

      successTimeoutRef.current = setTimeout(() => {
        setShowSuccess(false);
        setModalOpen(false);
        resetForm();
      }, 5000);
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
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
    }
    setShowSuccess(false);
    resetForm();
    setModalOpen(false);
  }

  return (
    <section ref={sectionRef} className="min-h-screen p-4 sm:p-5 lg:px-20" id="class-resources">
      <header className="mt-3">
        <p className="animate-on-scroll font-bold text-[1.5rem] md:text-[1.7rem] font-[montserrat] leading-7 text-gray-900 dark:text-gray-100">Class Resources</p>
        <p className="animate-on-scroll text-sm sm:text-base text-gray-700 dark:text-[#E0E0E0]">Collaborate and exchange notes with your fellow blockmates.</p>
      </header>

      <div className="animate-on-scroll bg-white dark:bg-[#1a1a1a] w-full mt-5 border border-gray-200 dark:border-[#1a1a1a] rounded-xl p-3 sm:p-5 flex flex-col transition-colors duration-300">
        <div className="max-h-[70vh] sm:max-h-[75vh] md:h-150 overflow-y-auto flex flex-col pt-2">
          {loading ? (
            <div className="flex justify-center items-center h-96">
              <LoadingIcon dimensions="w-10 h-10" />
            </div>
          ) : (
            resources.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 items-stretch">
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
              <div className="flex justify-center items-center h-96 text-center">
                <p className="text-[#E0E0E0] dark:text-[#E0E0E0] text-sm sm:text-base">There's no resources uploaded yet.</p>
              </div>
            )
          )}
        </div>
        <div className="animate-on-scroll flex justify-center items-center pt-3">
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
          <form onSubmit={handleSubmit} className="flex flex-col w-full max-w-sm sm:max-w-md p-6">
            {loadingForm ? (
              <div className="flex flex-col justify-center items-center w-56 h-56 sm:h-64">
                <LoadingIcon dimensions="w-16 h-16 sm:w-20 sm:h-20" />
                <p className="text-gray-400 dark:text-[#E0E0E0] text-sm mt-5 animate-[pulse_1s_ease-in-out_infinite] text-center">Submitting...</p>
              </div>
            ) : showSuccess ? (
              <div className="flex flex-col justify-center items-center w-56 h-56 text-center">
                <Icon icon="mdi:clock-check-outline" className="text-[#1B651B] mb-3 w-16 h-16 sm:w-20 sm:h-20" />
                <p className="font-bold text-md text-[#1B651B]">Submitted!</p>
                <p className="text-gray-400 dark:text-[#E0E0E0] text-xs mt-2">Your resource is now in pending state and will be visible to your blockmates once approved.</p>
              </div>
            ) : (
              <>
                <p className="font-bold text-base sm:text-[1.2rem] text-[#1B651B] dark:text-[#56e556] font-['Montserrat']">Upload Resources</p>
                <p className="text-gray-400 dark:text-[#E0E0E0] text-xs mb-5">Share learning materials with your classmates</p>

                {/* Title of the resources*/}
                <label className="text-xs font-bold mb-1 mt-2 text-gray-700 dark:text-gray-100">Title <span className="text-red-400">*</span></label>
                <input
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setError((prev) => ({ ...prev, title: "" }));
                  }}
                  type="text"
                  placeholder="Enter resource title"
                  className={`border rounded-md mt-1 mb-1 p-2 w-full outline-none text-xs bg-white dark:bg-[#121212] text-gray-900 dark:text-gray-100 focus:border-green-700 dark:focus:border-green-500 
                    ${error.title ? "border-red-500" : "border-gray-300 dark:border-[#2a2a2a]"}`}
                />
                {error.title && (
                  <p className="text-red-500 text-xs">{error.title}</p>
                )}

                {/* Subject */}
                <label className="text-xs font-bold mb-1 mt-2 text-gray-700 dark:text-gray-100">Subject <span className="text-red-400">*</span></label>
                <select
                  value={subjectID}
                  onChange={(e) => {
                    setSubjectID(e.target.value);
                    setError((prev) => ({ ...prev, subject: "" }));
                  }}
                  className={`border rounded-md mt-1 mb-1 p-2 w-full outline-none text-xs bg-white dark:bg-[#121212] text-gray-900 dark:text-gray-100 focus:border-green-700 dark:focus:border-green-500 
                    ${error.subject ? "border-red-500" : "border-gray-300 dark:border-[#2a2a2a]"}`}
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
                <label className="text-xs font-bold mb-1 mt-2 text-gray-700 dark:text-gray-100">File <span className="text-red-400">*</span></label>
                <input
                  onChange={(e) => {
                    setFile(e.target.files[0]);
                    setError((prev) => ({ ...prev, file: "" }));
                  }}
                  type="file"
                  accept=".pdf, .png, .jpg, .jpeg, .docx, .pptx"
                  className={`border rounded-lg p-2.5 w-full outline-none text-xs bg-white dark:bg-[#121212] text-gray-900 dark:text-gray-100 focus:border-[#1B651B] dark:focus:border-green-500 transition-all duration-200 mb-1 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-[#1B651B] file:text-white hover:file:bg-[#288a28]
                    ${error.file ? "border-red-500" : "border-gray-200 dark:border-[#2a2a2a]"}`}
                />
                {error.file && (
                  <p className="text-red-500 text-xs">{error.file}</p>
                )}

                {/* Uploaded by (current user)*/}
                <label className="text-xs font-bold mb-1 mt-3 text-gray-700 dark:text-gray-100">Uploaded by</label>
                <div className="flex flex-row items-center mt-2 min-w-0">
                  <UserIcon typography="text-gray-600 dark:text-[#E0E0E0] shrink-0" dimensions="w-5" />
                  <span className="ml-1 text-xs font-bold text-gray-600 dark:text-[#E0E0E0] truncate">{student?.user?.name}</span>
                </div>

                {error.general && (
                  <p className="text-red-500 text-[.8rem] leading-4 font-bold my-1 text-center">{error.general}</p>
                )}

                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-5">
                  <Button
                    type="button"
                    onClick={handleClose}
                    text="Cancel"
                    bgColor="bg-gray-100 dark:bg-[#121212] hover:bg-gray-200 dark:hover:bg-[#444444]"
                    typography="text-gray-600 dark:text-gray-100 font-bold text-xs"
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