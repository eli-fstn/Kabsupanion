import { useEffect } from "react";
import { useNavigate, replace } from "react-router-dom";

function Error403() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate((-1), { replace: true });
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="h-screen flex flex-col items-center justify-center text-center px-6">
      
      {/* IMAGE */}
      <img src="/assets/illustrations/error403.svg" alt="404 Not Found" className="w-70 mb-6"/>

      {/* STATUS CODE */}
      <h1 className="text-4xl font-bold text-gray-800">ERROR: 403</h1>

      {/* DESCRIPTION */}
      <p className="text-gray-500 mt-4 sm:text-md text-lg">You don't have the permission to perform this action.</p>
      <p className="text-gray-500 text-md mt-3 animate-[pulse_1s_ease-in-out_infinite]">Redirecting to dashboard...</p>

    </div>
  );
}

export default Error403;