import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { getMasterlist } from "../../services/auth";
import Button from "../../components/Button";

function ClassList() {
  const [academicStatus, setAcademicStatus] = useState("Regular");
  const [masterList, setMasterList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const acadStatus = [ "Regular", "Irregular" ];

  useEffect(() => {
    const fetchMasterlist = async () => {
      try {
        const data = await getMasterlist();
        setMasterList(data);
      } catch (error) {
        console.log(error);
      } 
    }

    fetchMasterlist();
  }, []);

  const filteredStudents = masterList.filter((t) => t.acadStatus === academicStatus).sort((a, b) => a.name.localeCompare(b.name));
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleStatusChange = (status) => {
    setAcademicStatus(status);
    setCurrentPage(1);
  };

  return(
    <section className="min-h-screen p-10">
      <div className="mt-3">
        <p className="font-bold text-[1.3rem]">Class List</p>
        <p className="text-[1rem]">View the complete list of your blockmates and stay connected with your section.</p>
      </div>

      <div className="mt-5 flex flex-row justify-between items-center">
        <div className="">
          {acadStatus.map((status) => (
            <Button key={status} text={status} BGColor={academicStatus === status ? "bg-[#1B651B]" : "bg-white"} typography={academicStatus === status ? "text-sm font-bold text-white" : "text-sm font-bold text-gray-700"} padding="px-5 py-1" shadow="shadow-md border border-gray-200" margin="mr-4" onClick={() => handleStatusChange(status)}/>
          ))}
        </div>
        <div className="">
          <p className="text-sm font-bold text-[#888888]">Total Students: <span className="text-[#003A02] font-bold text-[1.3rem] ml-1">{filteredStudents.length}</span></p>
        </div>
      </div>

      <div className="bg-white w-full mt-5 border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="grid grid-cols-[.2fr_3fr_2fr_1fr] gap-4 bg-[#F5F5F5] p-3 items-center text-[#888888] text-sm font-bold border-b border-gray-200">
              <th className="flex items-center">No.</th>
              <th className="flex items-center"><Icon className="mr-2" icon="material-symbols:person-outline-rounded" width="25" height="25"/>Student</th>
              <th className="flex items-center"><Icon className="mr-2" icon="tabler:id" width="25" height="25"/>Student Number</th>
              <th className="flex items-center"><Icon className="mr-2" icon="fluent:status-16-regular" width="25" height="25"/>Status</th>
            </tr>
          </thead>
        </table>
        <div className="h-125 overflow-y-auto">
          <table className="w-full h-full">
            <tbody>
              {paginatedStudents.map((t, i) => (
                <tr key={i} className="grid grid-cols-[.2fr_3fr_2fr_1fr] gap-5 border-b border-gray-100 p-3 items-center font-medium">
                  <td className="text-[#4a4a4a88]">{(currentPage - 1) * itemsPerPage + i + 1}</td>
                  <td>{t.name}</td>
                  <td>{t.studentNumber}</td>
                  {t.studentStatus === "Active" ? (
                    <td className="text-green-500">{t.studentStatus}</td>
                  ) : (
                    <td className="text-red-500">{t.studentStatus}</td>
                  )}
                </tr>
              ))}
              {paginatedStudents.length === 0 && (
                <tr className="flex justify-center items-center flex-1 h-full">
                  <td colSpan={4} className="text-center text-gray-400 p-5">No students found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 p-4 border-t border-gray-200">
            <Button text="Previous" BGColor={currentPage === 1 ? "bg-gray-100" : "bg-white"} typography={currentPage === 1 ? "text-sm text-gray-400" : "text-sm text-[#003A02]"} padding="px-3 py-1" shadow="shadow-md border border-gray-200" onClick={() => setCurrentPage((prev) => prev - 1)} disabled={currentPage === 1}/>
            <span className="text-sm text-gray-500">Page {currentPage} of {totalPages}</span>
            <Button text="Next" BGColor={currentPage === totalPages ? "bg-gray-100" : "bg-white"} typography={currentPage === totalPages ? "text-sm text-gray-400" : "text-sm text-[#003A02]"} padding="px-3 py-1" shadow="shadow-md border border-gray-200" onClick={() => setCurrentPage((prev) => prev + 1)} disabled={currentPage === totalPages}/>
          </div>
        )}
      </div>
    </section>
  );
}

export default ClassList;