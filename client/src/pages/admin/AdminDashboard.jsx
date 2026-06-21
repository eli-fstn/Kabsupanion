import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import Sidebar from "../../components/layout/Sidebar";
import { getTasks, getMasterlist, getResources } from "../../services/auth";
import { useState, useEffect } from "react";
import { useUser } from "../../context/userContext";
import { Icon } from "@iconify/react";

function AdminDashboard() {
  const [masterlist, setMasterlist] = useState([]);
  const [task, setTask] = useState([]);
  const [resources, setResources] = useState([]);
  const { student } = useUser();

  useEffect(() => {
    const fetchMasterlist = async () => {
      try {
        const data = await getMasterlist();
        console.log(data);
        setMasterlist(data);
      } catch (error) {
        console.log(error);
      }
    }

    const fetchTask = async () => {
      try {
        const data = await getTasks();
        setTask(data);
      } catch (error) {
        console.log(error);
      }
    }

    const fetchResources = async () => {
      try {
        const data = await getResources();
        setResources(data);
      } catch (error) {
        console.log(error);
      }
    }

    fetchMasterlist();
    fetchResources();
    fetchTask();
  }, []);

  const subjects = ["All", "GNED 04", "MATH 1A", "COSC 55A", "COSC 60B", "DCIT 50A", "DCIT 24A", "INSY 50", "FITT 3"];
  const TASK_COLORS = ["#1B651B", "#185FA5", "#BA7517", "#0F6E56", "#A32D2D", "#533AB7", "#3a3a3a", "#D4537E"];

  const registrationData = [
    { name: "Registered", value: masterlist.filter(s => s.claimed).length },
    { name: "Not Registered", value: masterlist.filter(s => !s.claimed).length },
  ];

  const subjectData = subjects.map((subject) => ({
    name: subject,
    resources: resources.filter(r => r.subject === subject).length,
  }));

  const taskData = subjects.map((subject) => ({
    name: subject,
    value: task.filter(t => t.subject === subject).length,
  })).filter(s => s.value > 0);
  return (
    <div className="bg-[#F4F4F4] min-h-screen flex">
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-8">

        {/* Header */}
        <div className="mb-6">
          <p className="font-bold text-[1.7rem] font-[montserrat]">Dashboard</p>
          <p className="text-gray-400 text-sm">Welcome back,<span className="font-[montserrat] font-bold pl-1 text-[1.3rem] text-[#003A02]">{student?.user?.name.split(" ").at(0)}!</span> Here's what's happening in your section.</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-3 gap-4">

          {/* Total Students */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
            <div className="bg-[#eaf3de] rounded-lg p-3">
              <Icon icon="akar-icons:people-group" width="26" className="text-[#1B651B]" />
            </div>
            <div>
              <label className="text-gray-400 font-bold text-xs uppercase tracking-widest">Total Students</label>
              <p className="text-[2rem] font-bold text-[#1B651B] leading-8">{masterlist.length}</p>
            </div>
          </div>

          {/* Uploaded Tasks */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
            <div className="bg-[#e6f1fb] rounded-lg p-3">
              <Icon icon="ix:tasks-all" width="26" className="text-[#185FA5]" />
            </div>
            <div>
              <label className="text-gray-400 font-bold text-xs uppercase tracking-widest">Uploaded Tasks</label>
              <p className="text-[2rem] font-bold text-[#185FA5] leading-8">{task.length}</p>
            </div>
          </div>

          {/* Uploaded Resources */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
            <div className="bg-[#faeeda] rounded-lg p-3">
              <Icon icon="grommet-icons:resources" width="26" className="text-[#BA7517]" />
            </div>
            <div>
              <label className="text-gray-400 font-bold text-xs uppercase tracking-widest">Uploaded Resources</label>
              <p className="text-[2rem] font-bold text-[#BA7517] leading-8">{resources.length}</p>
            </div>
          </div>
        </div>

        {/* Recent uploaded resources */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mt-5">
          <p className="font-bold text-[1rem] mb-4">Recent Resources</p>
          {resources.slice(0, 5).map((r) => (
            <div key={r.id} className="flex items-center gap-3 py-3 border-b border-gray-100">
              <div className="bg-[#faeeda] rounded-lg p-2">
                <Icon icon="mdi:file-document-outline" width="20" className="text-[#BA7517]" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm">{r.title}</p>
                <p className="text-gray-400 text-xs">{r.subject} · {r.uploadedBy}</p>
              </div>
              <p className="text-gray-400 text-xs">{new Date(r.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
          {resources.length === 0 && (
            <div className="flex justify-center items-center flex-1 h-full">
              <p colSpan={4} className="text-center text-gray-400 p-5">No resources uploaded yet.</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mt-5">

          {/* Bar Chart — Resources per Subject */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="font-bold text-[1rem] mb-1">Resources per Subject</p>
            <p className="text-gray-400 text-xs mb-4">Number of uploaded files per subject</p>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={subjectData} barSize={18}>
                <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="resources" fill="#BA7517" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart — Tasks per Subject */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="font-bold text-[1rem] mb-1">Tasks per Subject</p>
            <p className="text-gray-400 text-xs mb-4">Distribution of tasks across subjects</p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={taskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {taskData.map((entry, index) => (
                    <Cell key={index} fill={TASK_COLORS[index % TASK_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
              {taskData.map((entry, index) => (
                <div key={index} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: TASK_COLORS[index % TASK_COLORS.length] }}></div>
                  <p className="text-xs text-gray-500">{entry.name} ({entry.value})</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;