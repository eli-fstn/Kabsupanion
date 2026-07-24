const PrivateRoute = ({ requiredRole }) => {
  const token = localStorage.getItem("token");
  const { student, loading } = useUser();

  if (loading) return <LoadingScreen />;

  if (!token) return <Navigate to="/" replace />;

  if (!student) return <LoadingScreen />;

  if (requiredRole && student.user.role !== requiredRole) {
    return <Error403 />;
  }

  return <Outlet />;
};