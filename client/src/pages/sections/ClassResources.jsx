import { useState , useEffect } from "react";
import ResourceCard from "../../components/ResourceCard";
import { handleApiError } from "../../api/errorHandler";
import { getResources } from "../../api/auth";

export default function ClassResources() {
  const [resources, setResources] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect (() => {
    const fetchResources = async () => {
      try {
        const data = await getResources();
        setResources(data);
      } catch (error) {
        handleApiError(error, setGeneralError);
      } finally {
        setLoading(false);
      }
    }

    fetchResources();
  }, []);

  return (
    <section className="min-h-screen p-10">
      <div className="mt-3">
        <p className="font-bold text-[1.3rem]">Class Resources</p>
        <p className="text-[1rem]">Collaborate and exchange notes with your fellow Kabsuhenyos.</p>
      </div>
      <div className="bg-white w-full mt-5 border border-gray-200 rounded-xl h-140 p-4 overflow-y-auto flex flex-col">
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
    </section>
  );
}