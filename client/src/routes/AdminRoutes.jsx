import { lazy } from "react";
import { Routes, Route } from "react-router-dom";
import PrivateRoute from "../routes/PrivateRoute.jsx";

const AdminDashboard = lazy(() => import("../pages/admin/AdminDashboard"));
const AdminList = lazy(() => import("../pages/admin/AdminTaskList.jsx"));
const AdminSched = lazy(() => import("../pages/admin/AdminSched.jsx"));
const AdminResources = lazy(() => import("../pages/admin/AdminResources.jsx"));
const AdminSubjects = lazy(() => import("../pages/admin/AdminClassSubjects.jsx"));
const AdminMasterlist = lazy(() => import("../pages/admin/AdminMasterlist.jsx"));
const Error404 = lazy(() => import("../pages/errors/Error404.jsx"));

function AdminRoutes() {
  return (
    <Routes>
      <Route element={<PrivateRoute requiredRole={"admin"} />}>
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/tasklist" element={<AdminList />} />
        <Route path="/schedule" element={<AdminSched />} />
        <Route path="/resources" element={<AdminResources />} />
        <Route path="/subjects" element={<AdminSubjects />} />
        <Route path="/masterlist" element={<AdminMasterlist />} />

        {/* Shows error 404 if the page doesn't exists. */}
        <Route path="*" element={<Error404 />} />
      </Route>
    </Routes>
  );
}

export default AdminRoutes;