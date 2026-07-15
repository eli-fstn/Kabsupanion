import { lazy } from "react";
import { Routes, Route } from "react-router-dom";
import PrivateRoute from "../routes/PrivateRoute.jsx";

const Dashboard = lazy(() => import("../pages/student/Dashboard"));
const Error404 = lazy(() => import("../pages/errors/Error404.jsx"));

function StudentRoutes() {
  return (
    <Routes>
      <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>

      {/* Shows error 404 if the page doesn't exists. */}
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
}

export default StudentRoutes;