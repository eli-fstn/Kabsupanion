import { useState , useEffect } from "react";
import { Icon } from "@iconify/react";
import ResourceCard from "../../components/ui/ResourceCard";
import { getResources, uploadResource } from "../../services/auth";
import { handleApiError } from "../../services/errorHandler";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { useUser } from "../../context/userContext";


export default function ClassResources() {
  const [resources, setResources] = useState([]);
  const { student } = useUser();
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [file, setFile] = useState("");
  const [error, setError] = useState({
    title: "",
    subject: "",
    file: "",
    general: ""
  });

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const data = await getResources();
        setResources(data);
      } catch (error) {
        console.log(error);
      } 
    }

    fetchResources();
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
    if (!subject) {
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

    try {
      await uploadResource(title, subject, student?.user?.name, file);
      setModalOpen(false);
      fetchResources();
    } catch (error) {
      handleApiError(error, (msg) => setError((prev) => ({ ...prev, general: msg })));
      console.log(error);
    }
  };

  const resetForm = () => {
    setTitle("");
    setSubject("");
    setFile("");
  }

  const handleClose = () => {
    resetForm();
    setModalOpen(false);
  }

  const subjects = ["GNED 04", "MATH 1A", "COSC 55A", "COSC 60B", "DCIT 50A", "DCIT 24A", "INSY 50", "FITT 3"];

  return (
    <section className="min-h-screen p-10" id="class-resources">
      <div className="mt-3">
        <p className="font-bold text-[1.7rem] font-[montserrat] leading-7">Class Resources</p>
        <p className="text-[1rem]">Collaborate and exchange notes with your fellow Kabsuhenyos.</p>
      </div>
      <div className="bg-white w-full mt-5 border border-gray-200 rounded-xl h-140 p-4 flex flex-col">
        <div className="h-140 overflow-y-auto flex flex-col">
          {resources.length > 0 ? (
            <div className="grid grid-cols-5 gap-4 items-center">
              {resources.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  title={resource.title}
                  subject={resource.subjectID}
                  uploadedBy={resource.uploadedBy}
                  fileUrl={resource.file}
                />
              ))}
            </div>
          ) : (
            <div className="flex justify-center items-center flex-1">
              <p className="text-gray-400">There's no resources uploaded yet.</p>
            </div>
          )}
        </div>
        <div className="flex justify-center items-center ">
          <Button
            text="Upload resources"
            onClick={() => setModalOpen(true)}
            bgColor="bg-[#1B651B]"
            typography="text-white font-bold"
            padding="px-6 py-2"
            dimensions="w-fit rounded-md"
            animation="active:scale-95 transition-all duration-100 hover:bg-[#288a28]"
          />
        </div>

        {/* FORM */}
        <Modal isOpen={modalOpen} onClose={handleClose}>
          <form onSubmit={handleSubmit} className="flex flex-col w-96 p-5">
            <p className="font-bold text-[1.3rem] text-[#1B651B] uppercase font-['Montserrat'] tracking-wide">Upload Resources</p>
            <p className="text-gray-400 text-sm">Share learning materials with your classmates</p>

            {/* Title of the resources*/}
            <label className="text-xs font-bold mb-1 mt-7">Title</label>
            <input value={title} onChange={(e) => {setTitle(e.target.value); setError((prev) => ({ ...prev, title: "" }));}} type="text" placeholder="Enter resource title" className={`border rounded-md mt-1 mb-1 p-2 w-full outline-none text-sm focus:border-green-700 ${error.title ? "border-red-500" : "border-gray-300"}`} />
            {error.title && (
              <p className="text-red-500 text-xs">{error.title}</p>
            )}

            {/* Subject */}
            <label className="text-xs font-bold mb-1 mt-3">Subject</label>
            <select value={subject} onChange={(e) => {setSubject(e.target.value); setError((prev) => ({ ...prev, subject: "" }));}} className={`border rounded-md mt-1 mb-1 p-2 w-full outline-none text-sm focus:border-green-700 ${error.subject ? "border-red-500" : "border-gray-300"}`} >
              <option value="">Select a subject</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
            </select>
            {error.subject && (
              <p className="text-red-500 text-xs">{error.subject}</p>
            )}

            {/* File to be uploaded | only accepts .PDF*/}
            <label className="text-xs font-bold mb-1 mt-3">File</label>
            <input onChange={(e) => {setFile(e.target.value[0]); setError((prev) => ({ ...prev, file: "" }));}} type="file" accept=".pdf, .png, .jpg, .jpeg, .docx, .pptx" className={`border rounded-lg p-2.5 w-full outline-none text-xs focus:border-[#1B651B] transition-all duration-200 mb-1 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-[#1B651B] file:text-white hover:file:bg-green-700 ${error.file ? "border-red-500" : "border-gray-200"}`} />
            {error.file && (
              <p className="text-red-500 text-xs">{error.file}</p>
            )}

            {/* Uploaded by (current user)*/}
            <label className="text-xs font-bold mb-1 mt-3">Uploaded by</label>
            <div className="flex flex-row ">
              <Icon icon="mdi:account-circle" width="20" className="text-gray-400" />
              <p className="ml-2 text-sm font-bold text-gray-500 mb-8">{student?.user?.name}</p>
            </div>
            

            {error.general && (
              <p className="text-red-500 text-[.8rem] leading-4 font-bold mb-3 text-center">{error.general}</p>
            )}

            <div className="flex justify-center items-center">
              <Button
                type="submit"
                text="Submit"
                bgColor="bg-[#1B651B]"
                typography="text-white font-bold"
                padding="px-10 py-2.5"
                dimensions="w-full rounded-md"
                animation="active:scale-95 transition-all duration-100 hover:bg-[#288a28] hover:text-white"
              />
            </div>
          </form>
        </Modal>
      </div>
    </section>
  );
}