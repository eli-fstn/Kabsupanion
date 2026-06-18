import { getMe, getResources } from "../../services/auth";
import { useState,useEffect } from "react";

function ResourceCard() {
  const [resources, setResources] = useState(null);
  const [student, setStudent] = useState(null);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const data = await getResources();
        setResourcesd(data);
      } catch (error) {
        console.log(error);
      }
    }

    const fetchMe = async () => {
      try {
        const data = await getMe();
        setStudent(data);
      } catch (error) {
        console.log(error);
      }
    }

    fetchMe();
    fetchResources();
  }, []);


  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:shadow-md transition flex flex-col">
      
      <div className="h-40 bg-gray-100 border-b border-gray-200 flex items-center justify-center">
        <iframe src={`${fileUrl}#toolbar=0&navpanes=0&scrolling=0`} className="w-full h-full pointer-events-none"title={title}/>
      </div>

      <div className="p-4 flex flex-col gap-1">
        <p className="text-xs text-gray-500">{resources?.subject}</p>
        <p className="font-semibold text-md leading-tight">{resources?.title}</p>
        <p className="text-xs text-gray-400">{student?.user.name}</p>
      </div>

    </div>
  );
}

export default ResourceCard;