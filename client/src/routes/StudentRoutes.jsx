import { Routes, Route } from "react-router-dom";
import Dashboard from "../pages/student/Dashboard";
import PrivateRoute from "../../utils/PrivateRoute.jsx";
import Error404 from "../pages/errors/Error404.jsx";

function StudentRoutes() {
  return (
    <Routes>
      <Route element={<PrivateRoute />} >
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Shows error 404 if the page doesn't exists. */}
        <Route path="*" element={<Error404 />} />
      </Route>
    </Routes>
  );
}

export default StudentRoutes;