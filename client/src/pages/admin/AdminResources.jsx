import Sidebar from "../../components/layout/Sidebar";
import { Icon } from "@iconify/react";
import { getResources } from "../../services/resources";
import Button from "../../components/ui/Button";
import { useState, useEffect } from "react";
import UserIcon from "../../components/common/UserIcon";

function AdminResources() {
  const [resources, setResources] = useState([]);

  // Edit
  const [editModal, setEditModalOpen] = useState(false);
  // const []

  const fetchResources = async () => {
    try {
      const data = await getResources();
      console.log(data);
      setResources(data);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchResources();
  }, []);

  return(
    <div className="bg-[#F4F4F4] min-h-screen flex">
      <Sidebar />

      <div className="flex-1 p-8">
        <div className="mb-6">
          <p className="font-bold text-[1.7rem] font-[montserrat]">Resources List</p>
          <p className="text-gray-400 text-sm">Manage and monitor uploaded resources for your section.</p>
        </div>

        <div className="bg-white w-full mt-5 border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="grid grid-cols-[.5fr_.5fr_1fr_1fr_.6fr] gap-4 bg-[#F5F5F5] p-3 items-center text-[#888888] text-sm font-bold border-b border-gray-200">
                <th className="flex items-center">Image</th>
                <th className="flex items-center"><Icon className="mr-2" icon="mdi:text-box-outline" width="22" height="22" />Title</th>
                <th className="flex items-center"><Icon className="mr-2" icon="material-symbols:book-outline" width="22" height="22" />Subject</th>
                <th className="flex items-center"><UserIcon dimensions="w-5 h-5 mr-2" />Uploader</th>
                <th className="flex items-center">Actions</th>
              </tr>
            </thead>
          </table>

          <div className="h-95 overflow-y-auto flex flex-col">
            {resources.length > 0 ? (
              <table className="w-full">
                <tbody>
                  {resources.map((t, i) => (
                    <tr key={t.id} className="grid grid-cols-[.5fr_.5fr_1fr_1fr_.6fr] gap-5 border-b border-gray-100 px-3 py-1 items-center text-xs font-medium transition-all duration-200 hover:bg-[#e1e1e188]">
                      <img
                        src={t.fileUrl.replace("/upload/", "/upload/f_jpg,pg_1,w_50,h_50,c_fill/")}
                        alt={t.title}
                        className="w-10 h-10 rounded object-cover border border-gray-200"
                      />
                      <td>{t.title}</td>
                      <td>{t.subject.code}</td>
                      <td>{t.uploadedBy.name}</td>
                      <td className="flex gap-2">
                        <Button
                          text={<Icon icon="material-symbols:pending-actions" width="16" height="16" />}
                          onClick={() => handleEditOpen(t)}
                          bgColor="hover:bg-blue-100"
                          typography="text-blue-700 hover:text-black"
                          dimensions="rounded-md"
                          padding="p-1.5"
                          animation="transition-all duration-200 active:scale-95"
                        />
                        <Button
                          text={<Icon icon="mdi:pencil-outline" width="16" height="16" />}
                          onClick={() => handleEditOpen(t)}
                          bgColor="hover:bg-gray-100"
                          typography="text-gray-700 hover:text-black"
                          dimensions="rounded-md"
                          padding="p-1.5"
                          animation="transition-all duration-200 active:scale-95"
                        />
                        <Button
                          text={<Icon icon="mdi:trash-can-outline" width="16" height="16" />}
                          onClick={() => handleDeleteOpen(t)}
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
                <p className="text-gray-400">No subjects added yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminResources;