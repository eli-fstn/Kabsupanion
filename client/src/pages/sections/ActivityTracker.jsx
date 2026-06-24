import { Icon } from "@iconify/react";
import Button from "../../components/ui/Button";
import { useState, useEffect } from "react";
import { getActivity } from "../../services/activityTracker.ts";

function ActivityTracker() {
  const [activeSubject, setActiveSubject] = useState("All");
  const [activity, setActivity] = useState([]);

  const fetchActivity = async () => {
    try {
      const data = await getActivity();
      setActivity(data);
    } catch (error) {
      console.log(error);
    } 
  }

  useEffect(() => {
    fetchActivity();
  }, []);

  const subjects = ["All", "GNED 04", "MATH 1A", "COSC 55A", "COSC 60B", "DCIT 50A", "DCIT 24A", "INSY 50", "FITT 3"];

  const filteredActivity = activeSubject === "All" ? activity : activity.filter((t) => t.subject === activeSubject);

  return(
    <section className="min-h-screen p-10">
      <div className="mt-3">
        <p className="font-bold text-[1.7rem] font-[montserrat] leading-7">Activity Tracker</p>
        <p className="text-[1rem]">Monitor your academic activities and progress.</p>
      </div>

      {/* FILTER BUTTONS */}
      <div className="mt-5">
        {subjects.map((subject) => (
          <Button
            key={subject}
            text={subject}
            onClick={() => setActiveSubject(subject)}
            bgColor={activeSubject === subject ? "bg-[#1B651B]" : "bg-white"}
            typography={activeSubject === subject ? "text-sm font-bold text-white" : "text-sm font-bold text-gray-700"}
            dimensions="rounded-md"
            padding="px-5 py-1"
            shadow="shadow-md border border-gray-200"
            margin="mr-4"
            animation="active:scale-95 transition-all duration-100 hover:bg-[#288a28] hover:text-white"
          />
        ))}
      </div>

      {/* TASK TABLE */}
      <div className="bg-white w-full mt-5 border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="grid grid-cols-[.2fr_3fr_1fr_1fr] gap-4 bg-[#F5F5F5] p-3 items-center text-[#888888] text-sm font-bold border-b border-gray-200">
              <th className="flex items-center">No.</th>
              <th className="flex items-center"><Icon className="mr-2" icon="ix:tasks-all" width="25" height="25" />Activity</th>
              <th className="flex items-center"><Icon className="mr-2" icon="material-symbols:book-outline" width="25" height="25" />Subject</th>
              <th className="flex items-center"><Icon className="mr-2" icon="mingcute:time-line" width="25" height="25" />Date Conducted</th>
            </tr>
          </thead>
        </table>
        <div className="h-125 overflow-y-auto">
          <table className="w-full h-full">
            <tbody>
              {filteredActivity.map((t, i) => (
                <tr key={i} className="grid grid-cols-[.2fr_3fr_1fr_1fr] gap-5 border-b border-gray-100 p-3 items-center text-sm font-medium">
                  <td>{i + 1}</td>
                  <td>{t.activity}</td>
                  <td>{t.subject}</td>
                  <td>{t.dateConducted}</td>
                </tr>
              ))}
              {activeSubject == "All" && filteredActivity.length === 0 ? (
                <tr className="flex justify-center items-center flex-1 h-full">
                  <td colSpan={3} className="text-center text-gray-400 p-5">No activities yet.</td>
                </tr>
              ) : (
                <tr className="flex justify-center items-center flex-1 h-full">
                  <td colSpan={3} className="text-center text-gray-400 p-5">No activities found for this subject yet.</td>
                </tr>
              ) }
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default ActivityTracker