import { Routes, Route } from "react-router-dom";
import LogIn from "./pages/student/LogIn";
import Dashboard from "./pages/student/Dashboard";
import Testing from "./pages/student/Testing.jsx";
import AdminLogIn from "./pages/admin/AdminLogIn";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Error503 from "./pages/errors/Error503.jsx";
import Error404 from "./pages/errors/Error404.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LogIn />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/testing" element={<Testing />} />
      <Route path="/adminlogin" element={<AdminLogIn />} />
      <Route path="/admindashboard" element={<AdminDashboard />} />
      <Route path="/error/503" element={<Error503 />} />
      <Route path="/error/404" element={<Error404 />} />
    </Routes>
  );
}

export default App;