import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { resetPasswordConfirm } from "../../services/auth.ts";
import { getErrorMessage } from "../../services/errorHandler.ts";
import Button from "../../components/ui/Button";
import { Icon } from "@iconify/react";
import logo from "../../assets/images/Kabsupanion-Logo.png";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState({ password: "", confirmPassword: "", general: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    let hasError = false;
    const newErrors = { password: "", confirmPassword: "", general: "" };

    if (!password) {
      newErrors.password = "Password is required.";
      hasError = true;
    } else if (password.length < 8) {
      newErrors.password = "Password must be 8 characters and above.";
      hasError = true;
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match!";
      hasError = true;
    }

    if (hasError) {
      setError(newErrors);
      return;
    }

    setLoading(true);
    try {
      await resetPasswordConfirm(token, password);
      setSuccess(true);
      setTimeout(() => navigate("/"), 4000);
    } catch (err) {
      setError((prev) => ({ ...prev, general: getErrorMessage(err) }));
    } finally {
      setLoading(false);
    }
  };

  // No token in the URL at all — the link was malformed or opened without the query param.
  if (!token) {
    return (
      <div className="relative min-h-screen flex items-center justify-center px-4">
        <div className="bg-[#fafafa] flex flex-col items-center p-6 rounded-xl shadow-md w-80 text-center">
          <Icon icon="mdi:link-off" width="40" className="text-[#A32D2D] mb-3" />
          <p className="font-bold text-lg text-[#A32D2D]">Invalid Reset Link</p>
          <p className="text-gray-400 text-xs mt-2">This link is missing its reset token. Ask your section admin to generate a new one.</p>
          <Link to="/" className="mt-5">
            <span className="text-[#1B651B] font-semibold text-sm">Back to Login</span>
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="relative min-h-screen flex items-center justify-center px-4">
        <div className="bg-[#fafafa] flex flex-col items-center p-6 rounded-xl shadow-md w-80 text-center">
          <Icon icon="mdi:check-circle-outline" width="40" className="text-[#1B651B] mb-3" />
          <p className="font-bold text-lg text-[#1B651B]">Password Reset!</p>
          <p className="text-gray-400 text-xs mt-2">Your password has been updated. Redirecting you to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 flex items-center justify-center px-4">
        <form onSubmit={handleSubmit} className="bg-[#fafafa] flex flex-col p-5 rounded-xl shadow-md w-80 z-10">
          <div className="flex items-center justify-center mb-7">
            <img className="w-10 rounded-md" src={logo} alt="Kabsupanion Logo" />
            <p className="font-bold text-2xl pl-2 text-[#1B651B] font-['Roboto_Condensed']">Reset Password</p>
          </div>

          <p className="text-gray-400 text-xs text-center mb-5">Enter a new password for your account. You'll be signed out of any other active sessions once it's updated.</p>

          <label className="text-[#A9A9A9] font-bold text-[.8rem]">New Password</label>
          <input
            type="password"
            minLength={8}
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError((prev) => ({ ...prev, password: "" })); }}
            className={`border rounded-md mt-1 mb-1 p-2 w-full outline-none text-sm focus:border-green-700 ${error.password ? "border-red-500" : "border-gray-300"}`}
          />
          {error.password && <p className="text-red-500 text-xs">{error.password}</p>}

          <label className="text-[#A9A9A9] font-bold text-[.8rem] mt-3">Confirm New Password</label>
          <input
            type="password"
            minLength={8}
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); setError((prev) => ({ ...prev, confirmPassword: "" })); }}
            className={`border rounded-md mt-1 mb-1 p-2 w-full outline-none text-sm focus:border-green-700 ${error.confirmPassword ? "border-red-500" : "border-gray-300"}`}
          />
          {error.confirmPassword && <p className="text-red-500 text-xs">{error.confirmPassword}</p>}

          {error.general && (
            <p className="text-red-500 text-[.8rem] leading-4 font-bold mt-3 text-center">{error.general}</p>
          )}

          <div className="flex justify-center mt-6">
            <Button
              type="submit"
              text={loading ? "Resetting..." : "Reset Password"}
              disabled={loading}
              bgColor="bg-[#1B651B]"
              typography="text-white font-medium text-xs"
              padding="px-6 py-2"
              dimensions="rounded-md w-full"
              animation="active:scale-95 transition-all duration-100 hover:bg-[#288a28]"
            />
          </div>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;