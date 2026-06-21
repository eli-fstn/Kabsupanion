import { Routes, Route } from "react-router-dom";
import PrivateRoute from "../../utils/PrivateRoute.jsx";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminList from "../pages/admin/AdminTaskList.jsx";
import AdminSched from "../pages/admin/AdminSched.jsx";
import AdminResources from "../pages/admin/AdminResources.jsx";
import AdminSubjects from "../pages/admin/AdminClassSubjects.jsx";
import AdminMasterlist from "../pages/admin/AdminMasterlist.jsx";

function AdminRoutes() {
  return(
    <Routes>
      <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/tasklist" element={<AdminList />} />
        <Route path="/schedule" element={<AdminSched />} />
        <Route path="/resources" element={<AdminResources />} />
        <Route path="/subjects" element={<AdminSubjects />} />
        <Route path="/masterlist" element={<AdminMasterlist />} />
      </Route>
    </Routes>
  );
}

export default AdminRoutes;