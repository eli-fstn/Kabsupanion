import { lazy } from "react";
import { Routes, Route } from "react-router-dom";
import StudentRoutes from "./StudentRoutes";
import AdminRoutes from "./AdminRoutes";

const LogIn = lazy(() => import("../pages/auth/LogIn"));
const Register = lazy(() => import("../pages/auth/Register"));
const ResetPassword = lazy(() => import("../pages/auth/ResetPassword"));
const Error404 = lazy(() => import("../pages/errors/Error404"));
const Error503 = lazy(() => import("../pages/errors/Error503"));
const Error403 = lazy(() => import("../pages/errors/Error403"));

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

      {/* Reset Password */}
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route path="/error/403" element={<Error403 />} />
      <Route path="/error/404" element={<Error404 />} />
      <Route path="/error/503" element={<Error503 />} />

      <Route path="*" element={<Error404 />} />
    </Routes>
  );
}

export default AppRoutes;