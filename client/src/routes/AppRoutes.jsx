import { Routes, Route } from "react-router-dom";
import StudentRoutes from "./StudentRoutes";
import Error404 from "../pages/errors/Error404";
import Error503 from "../pages/errors/Error503";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/*" element={<StudentRoutes />} />

      <Route path="/error/404" element={<Error404 />} />
      <Route path="/error/503" element={<Error503 />} />

      <Route path="*" element={<Error404 />} />
    </Routes>
  );
}

export default AppRoutes;