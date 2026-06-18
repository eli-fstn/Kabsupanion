import { useState , useEffect } from "react";
import ResourceCard from "../../components/ResourceCard";
import { getResources, uploadResource, getMe } from "../../services/auth";
import Button from "../../components/Button";
import Modal from "../../components/Modal";


export default function ClassResources() {
  const [resources, setResources] = useState([]);
  const [student, setStudent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [file, setFile] = useState(null);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const data = await getResources();
        setResources(data);
      } catch (error) {
        console.log(error);
      } 
    }

    const fetchMe = async () => {
      try {
        const data = await getMe();
        setStudent(data);
      } catch (error) {
        console.log(error)
      }
    }

    fetchResources();
    fetchMe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await uploadResource(title, subject, uploadedBy, fileURL);
      setModalOpen(false);
      fetchResources(); 
    } catch (error) {
      handleApiError(error, setError);
    }
  }

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
    <section className="min-h-screen p-10">
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
                  subject={resource.subject}
                  uploadedBy={resource.uploadedBy}
                  fileUrl={resource.fileUrl}
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
          <Button onClick={() => setModalOpen(true)} type="submit" text="Upload resources" BGColor="bg-[#1B651B]" typography="text-white font-bold" padding="px-6 py-2" dimensions="w-fit"/>
        </div>

        <Modal isOpen={modalOpen} onClose={handleClose}>
          <form onSubmit={handleSubmit} className="flex flex-col w-96 p-6">
            <p className="font-bold text-[1.5rem] text-center text-[#1B651B] uppercase mb-6 font-['Montserrat']">Resources Form</p>

            {/* Title of the resources*/}
            <label className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} type="text" placeholder="Enter resource title" className="border border-gray-200 rounded-lg p-2.5 w-full outline-none text-sm focus:border-[#1B651B] focus:ring-1 focus:ring-[#1B651B] transition-all duration-200 mb-4" required />

            {/* Subject */}
            <label className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Subject</label>
            <select value={subject} onChange={(e) => setSubject(e.target.value)} className="border border-gray-200 rounded-lg p-2.5 w-full outline-none text-sm focus:border-[#1B651B] focus:ring-1 focus:ring-[#1B651B] transition-all duration-200 mb-4 bg-white" required >
              <option value="">Select a subject</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
            </select>

            {/* File to be uploaded | only accepts .PDF*/}
            <label className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">File</label>
            <input onChange={(e) => setFile(e.target.value)} type="file" accept=".pdf" className="border border-gray-200 rounded-lg p-2.5 w-full outline-none text-xs focus:border-[#1B651B] transition-all duration-200 mb-4 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-[#1B651B] file:text-white hover:file:bg-green-700" required />

            {/* Uploaded by (current user)*/}
            <label className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Uploaded by</label>
            <p className="text-sm font-bold text-[#3a3a3a] border border-gray-200 rounded-lg p-2.5 mb-6 bg-gray-50">{student?.user.name}</p>

            <div className="flex justify-center items-center">
              <Button type="submit" text="Submit" BGColor="bg-[#1B651B] hover:bg-green-700" typography="text-white font-bold" padding="px-10 py-2.5" dimensions="w-full" />
            </div>
          </form>
        </Modal>
      </div>
    </section>
  );
}