import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "../context/userContext";
import Error403 from "../pages/errors/Error403";
import LoadingScreen from "../components/ui/LoadingScreen";

const PrivateRoute = ({ requiredRole }) => {
  const token = localStorage.getItem("token");
  const { student, loading } = useUser();

  if (loading) return <LoadingScreen />;

  if (!token) return <Navigate to="/" />;

  if (!student) return <LoadingScreen />;

  if (requiredRole && student?.user?.role !== requiredRole) {
    return <Error403 />
  } 
 
  return <Outlet />;
};

export default PrivateRoute;