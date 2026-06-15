import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { verifyLogin } from "../../api/auth";
import Button from "../../components/Button";

function LogIn() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    general: ""
  });
  const navigate = useNavigate();

  const handleLogIn = async (e) => {
    e.preventDefault();

    setErrors({ email: "", password: "", general: "" });
    let hasError = false;
    const newErrors = { email: "", password: "", general: "" };

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
      setErrors(newErrors);
      return;
    }

    try {
      // const data = await verifyLogin(email, password);
      // localStorage.setItem("token", data.token);

      navigate("/dashboard");
    } catch (error) {
      const res = error.response;

      if (!res) {
        setErrors({
          general: "Network error. Please try again."
        });
        return;
      }

      const { status } = res;

      switch (status) {
        case 400:
          setErrors({ general: "Invalid request. Please check your input." });
          break;

        case 401:
        case 404:
          setErrors({ general: "Invalid credentials." });
          break;

        case 429:
          setErrors({ general: "Too many attempts. Please try again later." });
          break;

        case 500:
          setErrors({ general: "Server error. Please try again later." });
          break;

        case 503:
          setErrors({ general: "Service unavailable. Please try again later." });
          break;

        default:
          setErrors({ general: "Something went wrong. Please try again." });
      }
    }
  };

  return (
    <div className="relative min-h-screen">

      <div className="absolute inset-0 flex items-center justify-center px-4">
        <form onSubmit={handleLogIn} className="bg-[#FAF9F6] flex flex-col p-5 rounded-xl shadow-md w-80">
          <div className="flex items-center justify-center mb-7">
            <img className="w-10" src="/assets/CvSU-logo.png" alt="Logo" />
            <p className="font-bold text-xl pl-3 text-[#1B651B]">MyKabsupanion</p>
          </div>

          <label className="text-gray-500 font-bold text-sm">CvSU Email</label>
          <input type="email" value={email} onChange={(e) => {setEmail(e.target.value); setErrors((prev) => ({ ...prev, email: "" }));}} className={`border rounded-md my-2 p-2 w-full outline-none text-sm ${errors.email ? "border-red-500" : "border-gray-300"}`}/>
          {errors.email && (
            <p className="text-red-500 text-xs">{errors.email}</p>
          )}

          <label className="text-gray-500 font-bold text-sm mt-3">Password</label>
          <input type="password" value={password} onChange={(e) => {setPassword(e.target.value); setErrors((prev) => ({ ...prev, password: "" }));}} className={`border rounded-md mt-2 p-2 w-full outline-none text-sm ${errors.password ? "border-red-500" : "border-gray-300"}`}/>
          {errors.password && (
            <p className="text-red-500 text-xs">{errors.password}</p>
          )}

          {errors.general && (
            <p className="text-red-500 text-sm font-bold mt-3 text-center">{errors.general}</p>
          )}

          <div className="flex justify-center mt-6">
            <Button type="submit" text="Sign In" BGColor="bg-[#1B651B]" typography="text-white font-bold" padding="px-6 py-2"/>
          </div>

          <p className="text-xs text-center mt-5">Don't have an account?{" "}
            <Link to="/register"><span className="text-[#1B651B] font-semibold">Register here</span>
            </Link>
          </p>
        </form>
      </div>
      <div className="absolute bottom-0 right-10 opacity-50">
        <img className="w-72" src="/assets/Laya-at-Diwa.png" alt="Laya at Diwa"/>
      </div>
    </div>
  );
}

export default LogIn;