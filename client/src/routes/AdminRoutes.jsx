import { Routes, Route } from "react-router-dom";
import PrivateRoute from "../../utils/PrivateRoute.jsx";
import AdminDashboard from "../pages/admin/AdminDashboard";

function AdminRoutes() {
  return(
    <Routes>
      <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<AdminDashboard />} />
      </Route>
    </Routes>
  );
}

export default AdminRoutes;