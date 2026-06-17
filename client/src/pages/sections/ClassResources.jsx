import { useState , useEffect } from "react";
import ResourceCard from "../../components/ResourceCard";
import { getResources, uploadResource } from "../../services/auth";
import Button from "../../components/Button";
import Modal from "../../components/Modal";


export default function ClassResources() {
  const [resources, setResources] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [file, setFile] = useState(null);

  const fetchResources = async () => {
    try {
      const data = await getResources();
      setResources(data);
    } catch (error) {
      console.log(error);
    } 
  }

  useEffect(() => {
    fetchResources();
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

  const subjects = ["GNED 04", "MATH 1A", "COSC 55A", "COSC 60B", "DCIT 50A", "DCIT 24A", "INSY 50", "FITT 3"];

  return (
    <section className="min-h-screen p-10">
      <div className="mt-3">
        <p className="font-bold text-[1.3rem]">Class Resources</p>
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

        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit} className="flex flex-col w-80 p-5">
            <p className="font-bold text-[1.3rem] text-center">Resources Form</p>

            <label className="mt-10 text-sm text-gray-500 font-bold">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} type="text" className="border rounded-md mt-2 mb-1 p-2 w-full outline-none text-sm h-8 focus:border-green-700" required />

            <label className="mt-3 text-sm text-gray-500 font-bold">Subject</label>
            <select value={subject} onChange={(e) => setSubject(e.target.value)} className="border rounded-md mt-2 mb-1 w-full outline-none text-sm h-8 focus:border-green-700" required>
              <option value="">Select a subject</option>
              {subjects.map((subject) => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>

            <label className="mt-3 text-sm text-gray-500 font-bold">File</label>
            <input value={file} onChange={(e) => setFile
              (e.target.value)} type="file" accept=".pdf" className="border rounded-md mt-2 mb-1 p-2 w-full outline-none text-sm focus:border-green-700" required />

            <label className="mt-3 text-sm text-gray-500 font-bold">Uploaded by:</label>
            <p className="text-[1rem] font-bold">{resources.uploadedBy}</p>

            <div className="flex justify-center items-center mt-15">
              <Button type="submit" text="Submit" BGColor="bg-[#1B651B]" typography="text-white font-bold" padding="px-6 py-2" dimensions="w-fit"/>
            </div>
          </form>
        </Modal>
      </div>
    </section>
  );
}