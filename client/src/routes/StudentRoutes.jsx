import { Routes, Route } from "react-router-dom";
import LogIn from "../pages/student/LogIn";
import Register from "../pages/student/Register";
import Dashboard from "../pages/student/Dashboard";
import PrivateRoute from "../../utils/PrivateRoute.jsx";

function StudentRoutes() {
  return (
    <Routes>
      <Route element={<PrivateRoute />} >
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>
    </Routes>
  );
}

export default StudentRoutes;