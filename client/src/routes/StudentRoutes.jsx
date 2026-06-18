import { Routes, Route } from "react-router-dom";

import LogIn from "../pages/student/LogIn";
import Register from "../pages/student/Register";
import Dashboard from "../pages/student/Dashboard";

function StudentRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LogIn />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}

export default StudentRoutes;