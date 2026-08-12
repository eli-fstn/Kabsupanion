import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import Sidebar from "../../components/layout/Sidebar";
import { getTasks } from "../../services/taskList.ts";
import { getMasterlist } from "../../services/masterlist.ts";
import { getResources } from "../../services/resources.ts";
import { getSubjects } from "../../services/subjects.ts";
import { getUsers } from "../../services/adminUser.ts";
import { useState, useEffect } from "react";
import { useUser } from "../../context/userContext";
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import CountUp from 'react-countup';
import Pagination from "../../components/ui/Pagination.jsx";
import LoadingIcon from "../../components/ui/LoadingIcon.jsx";
import { useGreeting } from "../../hooks/useGreeting.js";
import { isDeveloper } from "../../utils/developers.ts";

function AdminDashboard() {
  const [masterlist, setMasterlist] = useState([]);
  const [task, setTask] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [resources, setResources] = useState([]);
  const [users, setUsers] = useState([]);
  const { student } = useUser();
  const [resourcePage, setResourcePage] = useState(1);
  const [loading, setLoading] = useState(false);
  const greetings = useGreeting();
  const pendingCount = resources.filter((r) => r.status === "pending").length;
  const approvedCount = resources.filter((r) => r.status === "approved").length;
  const irregStudents = masterlist.filter((r) => r.status === "irregular").length;
  const regStudents = masterlist.filter((r) => r.status === "regular").length;
  const students = users.filter((r) => r.role === "student").length;
  const admins = users.filter((r) => r.role === "admin").length;
  const isRowDeveloper = (id) => isDeveloper(id).length();

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
      const sorted = [...data].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setResources(sorted);
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

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchMasterlist();
    fetchResources();
    fetchTask();
    fetchSubjects();
    fetchUsers();
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
      <div className="flex-1 p-6 sm:p-8 max-w-[1600px]">

        {/* HEADER */}
        <div className="mb-5">
          <p className="font-bold text-[1.5rem] sm:text-[1.7rem] font-[montserrat] leading-tight">
            {greetings}, <span className="font-[parisienne] font-bold pl-1 text-[2rem] sm:text-[2.2rem] text-[#387c39]">{student?.user?.name?.split(" ").slice(-1)[0]}!</span>
          </p>
          <p className="text-gray-400 text-sm">Here's what's happening in your section.</p>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

          {/* Total Students */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 transition-shadow duration-200 hover:shadow-md">
            <div className="flex items-center gap-4">
              <div className="bg-[#eaf3de] rounded-lg p-3 shrink-0">
                <Icon icon="akar-icons:people-group" className="w-5 h-5 text-[#1B651B]" />
              </div>
              <div className="min-w-0">
                <label className="text-[.65rem] font-bold uppercase tracking-widest text-gray-400 block truncate">
                  Total Students
                </label>
                <p className="text-[1.6rem] font-bold leading-7 text-[#1B651B]">
                  <CountUp.default start={0} end={masterlist.length} duration={2} />
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                <p className="text-xs text-gray-500">
                  <span className="font-bold text-amber-700">{irregStudents}</span> Irregular
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#1B651B] shrink-0"></span>
                <p className="text-xs text-gray-500">
                  <span className="font-bold text-[#1B651B]">{regStudents}</span> Regular
                </p>
              </div>
            </div>
          </div>

          {/* Total Registered Users */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 transition-shadow duration-200 hover:shadow-md">
            <div className="flex items-center gap-4">
              <div className="bg-[#eaf3de] rounded-lg p-3 shrink-0">
                <Icon icon="akar-icons:people-group" className="w-5 h-5 text-[#1B651B]" />
              </div>
              <div className="min-w-0">
                <label className="text-[.65rem] font-bold uppercase tracking-widest text-gray-400 block truncate">
                  Total Users
                </label>
                <p className="text-[1.6rem] font-bold leading-7 text-[#1B651B]">
                  <CountUp.default start={0} end={users.length} duration={2} />
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                <p className="text-xs text-gray-500">
                  <span className="font-bold text-amber-700">{admins}</span> Admins
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#1B651B] shrink-0"></span>
                <p className="text-xs text-gray-500">
                  <span className="font-bold text-[#1B651B]">{students}</span> Students
                </p>
              </div>
            </div>
          </div>

          {/* Resources — combined total + pending/approved breakdown */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 transition-shadow duration-200 hover:shadow-md">
            <div className="flex items-center gap-4">
              <div className="bg-[#eaf3de] rounded-lg p-3 shrink-0">
                <Icon icon="grommet-icons:resources" className="w-5 h-5 text-[#1B651B]" />
              </div>
              <div className="min-w-0">
                <label className="text-[.65rem] font-bold uppercase tracking-widest text-gray-400 block truncate">
                  Uploaded Resources
                </label>
                <p className="text-[1.6rem] font-bold leading-7 text-[#1B651B]">
                  <CountUp.default start={0} end={resources.length} duration={2} />
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                <p className="text-xs text-gray-500">
                  <span className="font-bold text-amber-700">{pendingCount}</span> Pending
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#1B651B] shrink-0"></span>
                <p className="text-xs text-gray-500">
                  <span className="font-bold text-[#1B651B]">{approvedCount}</span> Approved
                </p>
              </div>
            </div>
          </div>

          {/* Uploaded Tasks */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4 transition-shadow duration-200 hover:shadow-md">
            <div className="bg-[#eaf3de] rounded-lg p-3 shrink-0">
              <Icon icon="ix:tasks-all" className="w-5 h-5 text-[#1B651B]" />
            </div>
            <div className="min-w-0">
              <label className="text-[.65rem] font-bold uppercase tracking-widest text-gray-400 block truncate">
                Uploaded Tasks
              </label>
              <p className="text-[1.6rem] font-bold leading-7 text-[#1B651B]">
                <CountUp.default start={0} end={task.length} duration={2} />
              </p>
            </div>
          </div>

        </div>

        {/* RECENT RESOURCES */}
        <div className="bg-white rounded-xl border border-gray-200 mt-5 flex flex-col overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
            <div>
              <p className="font-bold text-sm">Recent Uploaded Resources</p>
              <p className="text-gray-400 text-xs">Latest files shared across your section</p>
            </div>
          </div>

          <div className="h-71.25 flex flex-col justify-start px-2">
            {loading ? (
              <div className="flex flex-col">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 px-3 py-2.5 border-b border-gray-100"
                  >
                    <div className="bg-gray-200 rounded-lg w-9 h-9 animate-pulse shrink-0" />
                    <div className="flex-1 flex flex-col gap-1.5">
                      <div className="h-3.5 bg-gray-200 rounded animate-pulse w-40" />
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-24" />
                    </div>
                    <div className="h-5 bg-gray-200 rounded-full animate-pulse w-16 shrink-0" />
                  </div>
                ))}
              </div>
            ) : (
              paginatedResources.length > 0 ? (
                paginatedResources.map((r, i) => (
                  <Link key={i} to={"/admin/resources"}>
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-md border-b border-gray-100 transition-colors duration-150 hover:bg-gray-50">
                      <div className="bg-amber-100 rounded-lg p-2 shrink-0">
                        <Icon icon="mdi:file-document-outline" width="20" className="text-amber-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">{r.title}</p>
                        <p className="text-gray-400 text-xs truncate">{r.subject.code} · {r.uploadedBy.name}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span
                          className={`px-2.5 py-0.5 uppercase text-[.6rem] font-bold rounded-full border ${
                            r.status === "pending"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-[#eaf3de] text-[#1B651B] border-[#c3ddb4]"
                          }`}
                        >
                          {r.status}
                        </span>
                        <p className="text-gray-400 text-xs">{new Date(r.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="flex flex-col justify-center items-center h-full gap-2">
                  <Icon icon="mdi:file-document-outline" width="32" className="text-gray-300" />
                  <p className="text-gray-400 text-sm">No resources uploaded yet.</p>
                </div>
              )
            )}
          </div>
          <div className="px-3 pb-3">
            <Pagination
              currentPage={resourcePage}
              totalPages={totalResourcePages}
              onPageChange={setResourcePage}
            />
          </div>
        </div>

        {/* CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-5">

          {/* Bar Chart — Resources per Subject */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
              <div className="bg-[#eaf3de] rounded-lg p-2 shrink-0">
                <Icon icon="material-symbols:bar-chart-rounded" width="18" className="text-[#1B651B]" />
              </div>
              <div>
                <p className="font-bold text-sm">Resources per Subject</p>
                <p className="text-gray-400 text-xs">Number of uploaded files per subject</p>
              </div>
            </div>
            <div className="p-5">
              {loading ? (
                <div className="flex justify-center items-center h-70">
                  <Icon icon="svg-spinners:3-dots-bounce" width="40" className="text-[#1B651B]" />
                </div>
              ) : subjectData.every(s => s.resources === 0) ? (
                <div className="flex flex-col justify-center items-center h-70 gap-2">
                  <Icon icon="material-symbols:bar-chart-rounded" width="32" className="text-gray-300" />
                  <p className="text-gray-400 text-sm">No resource data yet.</p>
                </div>
              ) : (
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
              )}
            </div>
          </div>

          {/* Pie Chart — Tasks per Subject */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
              <div className="bg-[#eaf3de] rounded-lg p-2 shrink-0">
                <Icon icon="material-symbols:pie-chart-rounded" width="18" className="text-[#1B651B]" />
              </div>
              <div>
                <p className="font-bold text-sm">Tasks per Subject</p>
                <p className="text-gray-400 text-xs">Distribution of tasks across subjects</p>
              </div>
            </div>
            <div className="p-5">
              {loading ? (
                <div className="flex justify-center items-center h-70">
                  <Icon icon="svg-spinners:3-dots-bounce" width="40" className="text-[#1B651B]" />
                </div>
              ) : taskData.length === 0 ? (
                <div className="flex flex-col justify-center items-center h-70 gap-2">
                  <Icon icon="material-symbols:pie-chart-rounded" width="32" className="text-gray-300" />
                  <p className="text-gray-400 text-sm">No task data yet.</p>
                </div>
              ) : (
                <>
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
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;