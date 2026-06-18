import { Routes, Route } from "react-router-dom";
import LogIn from "./pages/student/LogIn";
import Register from "./pages/student/Register.jsx";
import Dashboard from "./pages/student/Dashboard";
import Error404 from "./components/errors/Error404.jsx";
import Error503 from "./components/errors/Error404.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LogIn />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/adminlogin" element={<AdminLogIn />} />
      <Route path="/admindashboard" element={<AdminDashboard />} />
      <Route path="/error/503" element={<Error503 />} />
      <Route path="/error/404" element={<Error404 />} />
    </Routes>
  );
}

export default App;