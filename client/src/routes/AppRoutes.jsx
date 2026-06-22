import { Routes, Route } from "react-router-dom";
import LogIn from "../pages/auth/LogIn";
import Register from "../pages/auth/Register";
import StudentRoutes from "./StudentRoutes";
import AdminRoutes from "./AdminRoutes";
import Error404 from "../pages/errors/Error404";
import Error503 from "../pages/errors/Error503";

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LogIn />} />
      <Route path="/register" element={<Register />} />

      {/* Admin Route */}
      <Route path="/admin/*" element={<AdminRoutes />} />

      {/* Student Route */}
      <Route path="/student/*" element={<StudentRoutes />} />
      
      <Route path="/error/404" element={<Error404 />} />
      <Route path="/error/503" element={<Error503 />} />

      <Route path="/*" element={<Error404 />} />
    </Routes>
  );
}

export default AppRoutes;