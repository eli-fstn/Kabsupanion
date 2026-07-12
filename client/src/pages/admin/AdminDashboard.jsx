import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import Sidebar from "../../components/layout/Sidebar";
import { getTasks } from "../../services/taskList.ts";
import { getMasterlist } from "../../services/masterlist.ts";
import { getResources } from "../../services/resources.ts";
import { getSubjects } from "../../services/subjects.ts";
import { useState, useEffect } from "react";
import { useUser } from "../../context/userContext";
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import CountUp from 'react-countup';
import Pagination from "../../components/ui/Pagination.jsx";
import LoadingIcon from "../../components/ui/LoadingIcon.jsx";
import { useGreeting } from "../../hooks/useGreeting.ts";

function AdminDashboard() {
  const [masterlist, setMasterlist] = useState([]);
  const [task, setTask] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [resources, setResources] = useState([]);
  const { student } = useUser();
  const [resourcePage, setResourcePage] = useState(1);
  const [loading, setLoading] = useState(false);
  const greetings = useGreeting();

  const fetchMasterlist = async () => {
    try {
      const data = await getMasterlist();
      setMasterlist(data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchTask = async () => {
    try {
      const data = await getTasks();
      setTask(data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchResources = async () => {
    setLoading(true);
    try {
      const data = await getResources();
      setResources(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const data = await getSubjects();
      setSubjects(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchMasterlist();
    fetchResources();
    fetchTask();
    fetchSubjects();
  }, []);

  const resourcesPerPage = 5;
  const totalResourcePages = Math.ceil(resources.length / resourcesPerPage);
  const paginatedResources = resources.slice(
    (resourcePage - 1) * resourcesPerPage,
    resourcePage * resourcesPerPage
  );

  const TASK_COLORS = ["#1B651B", "#185FA5", "#BA7517", "#0F6E56", "#A32D2D", "#533AB7", "#3a3a3a", "#D4537E"];

  const subjectData = subjects.map((subject) => ({
    name: subject.code,
    resources: resources.filter(r => r.subject.code === subject.code).length,
  }));

  const taskData = subjects.map((subject) => ({
    name: subject.code,
    value: task.filter(t => t.subject.code === subject.code).length,
  })).filter(s => s.value > 0);
  
  return (
    <div className="bg-[#fafafa] min-h-screen flex">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="mb-7 leading-5">
          <p className="font-bold text-[1.7rem] font-[montserrat]">{greetings}, <span className="font-[parisienne] font-bold pl-1 text-[2.2rem] text-[#387c39]">{student?.user?.name.split(" ").at(0)}!</span></p>
          <p className="text-gray-400 text-sm mt-1">Here's what's happening in your section.</p>
        </div>

        <div className="grid grid-cols-3 gap-5">
          <div className="bg-white rounded-xl border border-gray-200 p-4 border-t-4 border-t-green-700 flex items-center gap-4">
            <div className="bg-[#eaf3de] rounded-lg p-3">
              <Icon icon="akar-icons:people-group" className="text-[#1B651B] w-5 h-5" />
            </div>
            <div>
              <label className="text-gray-400 font-bold text-xs uppercase tracking-widest">Total Students</label>
              <p className="text-[1.7rem] font-bold text-[#1B651B] leading-7"><CountUp.default start={0} end={masterlist.length} duration={2}/></p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 border-t-4 border-t-green-700  flex items-center gap-4">
            <div className="bg-[#e6f1fb] rounded-lg p-3">
              <Icon icon="ix:tasks-all" className="text-[#185FA5] w-5 h-5" />
            </div>
            <div>
              <label className="text-gray-400 font-bold text-xs uppercase tracking-widest">Uploaded Tasks</label>
              <p className="text-[1.7rem] font-bold text-[#185FA5] leading-7"><CountUp.default start={0} end={task.length} duration={2}/></p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 border-t-4 border-t-green-700  flex items-center gap-4">
            <div className="bg-[#faeeda] rounded-lg p-3">
              <Icon icon="grommet-icons:resources" className="text-[#BA7517] w-5 h-5" />
            </div>
            <div>
              <label className="text-gray-400 font-bold text-xs uppercase tracking-widest">Uploaded Resources</label>
              <p className="text-[1.7rem] font-bold text-[#BA7517] leading-7"><CountUp.default start={0} end={resources.length} duration={2}/></p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 mt-5 flex flex-col">
          <p className="font-bold text-sm mb-4">Recent Uploaded Resources</p>

          {/* Recent Resources */}
          <div className="h-71.25 flex flex-col justify-start">
            {loading ? (
              <div className="flex flex-col">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 px-3 py-2 border-b border-gray-100"
                  >
                    <div className="bg-gray-200 rounded-lg w-9 h-9 animate-pulse" />
                    <div className="flex-1 flex flex-col gap-1.5">
                      <div className="h-3.5 bg-gray-200 rounded animate-pulse w-40" />
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-24" />
                    </div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-14" />
                  </div>
                ))}
              </div>
            ) : (
              paginatedResources.length > 0 ? (
                paginatedResources.map((r, i) => (
                  <Link key={i} to={"/admin/resources"} >
                  <div key={r.id} className="flex items-center gap-3 px-3 py-2 rounded-md border-b border-gray-100 transition-all duration-100 hover:bg-gray-100">
                    <div className="bg-[#faeeda] rounded-lg p-2">
                      <Icon icon="mdi:file-document-outline" width="20" className="text-[#BA7517]" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm">{r.title}</p>
                      <p className="text-gray-400 text-xs">{r.subject.code} · {r.uploadedBy.name}</p>
                    </div>
                    <p className="text-gray-400 text-xs">{new Date(r.createdAt).toLocaleDateString()}</p>
                  </div>
                  </Link>
                ))
              ) : (
                <div className="flex justify-center items-center h-full">
                  <p className="text-gray-400">No resources uploaded yet.</p>
                </div>
              )
            )}
          </div>
          <Pagination
            currentPage={resourcePage}
            totalPages={totalResourcePages}
            onPageChange={setResourcePage}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mt-5">

          {/* Bar Chart — Resources per Subject */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="font-bold text-sm mb-1">Resources per Subject</p>
            <p className="text-gray-400 text-xs mb-4">Number of uploaded files per subject</p>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={subjectData} barSize={18}>
                <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="resources" radius={[4, 4, 0, 0]}>
                  {subjectData.map((entry, index) => (
                    <Cell key={index} fill={TASK_COLORS[index % TASK_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart — Tasks per Subject */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="font-bold text-sm mb-1">Tasks per Subject</p>
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