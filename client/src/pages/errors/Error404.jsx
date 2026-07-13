import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import error404 from "../../assets/illustrations/error404.svg";

function Error404() {
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
      <img src={error404} alt="Error 404" className="w-40 md:w-70 mb-6"/>

      {/* STATUS CODE */}
      <h1 className="text-2xl md:text-4xl font-bold text-gray-800">ERROR: 404</h1>

      {/* DESCRIPTION */}
      <p className="text-gray-500 mt-4 text-xs md:text-lg">We couldn’t find the page you’re looking for. It may have been moved or doesn't exist.</p>
      <p className="text-gray-500 text-xs md:text-md mt-3 animate-[pulse_1s_ease-in-out_infinite]">Redirecting you back...</p>

    </div>
  );
}

export default Error404;