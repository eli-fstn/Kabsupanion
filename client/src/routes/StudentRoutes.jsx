import { Routes, Route } from "react-router-dom";
import Dashboard from "../pages/student/Dashboard";
import PrivateRoute from "../routes/PrivateRoute.jsx";
import Error404 from "../pages/errors/Error404.jsx";

function StudentRoutes() {
  return (
    <Routes>
      <Route element={<PrivateRoute />} >
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>

        {/* Shows error 404 if the page doesn't exists. */}
        <Route path="*" element={<Error404 />} />
    </Routes>
  );
}

export default StudentRoutes;