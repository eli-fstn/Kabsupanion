import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { verifyLogin, getMe } from "../../services/auth.js";
import Button from "../../components/ui/Button.jsx";
import LoadingScreen from "../../components/ui/LoadingScreen.jsx"
import { handleApiError } from "../../services/errorHandler.js";

function LogIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState({
    email: "",
    password: "",
    general: ""
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogIn = async (e) => {
    e.preventDefault();

    let hasError = false;
    const newErrors = {
      email: "",
      password: "", 
      general: ""
    };

    if (!email) {
      newErrors.email = "Email is required.";
      hasError = true;
    }
    if (!password) {
      newErrors.password = "Password is required.";
      hasError = true;
    }
    if (email && !email.includes("@cvsu.edu.ph")) {
      newErrors.email = "Please use your CvSU email.";
      hasError = true;
    }
    if (hasError) {
      setError(newErrors);
      return;
    }

    setLoading(true);

    try {
      const data = await verifyLogin(email, password);
      localStorage.setItem("token", data.token);
      const response = await getMe();
      const user = response.user;

      if (user?.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/student/dashboard");
      }

    } catch (error) {
      handleApiError(error, (msg) => setError((prev) => ({ ...prev, general: msg })));
      setLoading(false)
    } 
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 flex items-center justify-center px-4">
        <form onSubmit={handleLogIn} className="bg-[#FAF9F6] flex flex-col p-5 rounded-xl shadow-md w-80 z-10">
          <div className="flex items-center justify-center mb-7">
            <img className="w-12" src="/assets/images/Kabsupanion-Logo.png" alt="Logo" />
            <p className="font-bold text-2xl pl-2 text-[#1B651B] font-['Roboto_Condensed']">Kabsupanion</p>
          </div>

          <label className="text-gray-500 font-bold text-[.8rem]">CvSU Email</label>
          <input type="email" value={email} onChange={(e) => {setEmail(e.target.value); setError((prev) => ({ ...prev, email: "" }));}} className={`border rounded-md mt-1 mb-1 p-2 w-full outline-none text-sm focus:border-green-700 ${error.email ? "border-red-500" : "border-gray-300"}`} />
          {error.email && (
            <p className="text-red-500 text-xs">{error.email}</p>
          )}

          <label className="text-gray-500 font-bold text-[.8rem] mt-3">Password</label>
          <input type="password" minLength={8} value={password} onChange={(e) => {setPassword(e.target.value); setError((prev) => ({ ...prev, password: "" }));}} className={`border rounded-md mt-1 mb-1 p-2 w-full outline-none text-sm focus:border-green-700 ${error.password ? "border-red-500" : "border-gray-300"}`} />
          {error.password && (
            <p className="text-red-500 text-xs">{error.password}</p>
          )}

          {error.general && (
            <p className="text-red-500 text-[.8rem] leading-4 font-bold mt-3 text-center">{error.general}</p>
          )}

          <div className="flex justify-center mt-6">
            <Button
              type="submit"
              text="Sign In"
              bgColor="bg-[#1B651B]"
              typography="text-white font-bold"
              padding="px-6 py-2"
              dimensions="rounded-md w-full"
              animation="active:scale-95 transition-all duration-100 hover:bg-[#288a28]"
            />
          </div>

          <p className="text-[.8rem] text-center mt-5">Don't have an account?{" "}
            <Link to="/register"><span className="text-[#1B651B] font-semibold">Register here</span>
            </Link>
          </p>
        </form>
      </div>
      <div className="sm:block absolute bottom-0 right-4 md:right-20 lg:right-80 z-0">
        <img className="opacity-50 w-72" src="/assets/images/Laya-at-Diwa.png" alt="Laya at Diwa"/>
      </div>
    </div>
  );
}

export default LogIn;