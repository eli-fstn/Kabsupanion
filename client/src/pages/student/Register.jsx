import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { registerAccount, getMe } from "../../services/auth";
import { Icon } from "@iconify/react";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import { handleApiError } from "../../services/errorHandler";

function Register(){
	const isNumber = (value) => /^[0-9]+$/.test(value);
  const [email, setEmail] = useState("");
  const [studentNumber, setStudentNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState({
		email: "",
		studentNumber: "",
		password: "",
		confirmPassword: "",
		general: "",
	});
	const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    let hasError = false;
    const newErrors = {
			email: "",
			studentNumber: "",
			password: "",
			confirmPassword: "",
			general: ""
		};

		if (!email) {
			newErrors.email = "CvSU Email is required.";
			hasError = true;
		} else if (!email.includes("@cvsu.edu.ph")) {
			newErrors.email = "Please use your CvSU email.";
			hasError = true;
		}

		if (!studentNumber) {
			newErrors.studentNumber = "Student Number is required.";
			hasError = true;
		} else if (!isNumber(studentNumber)) {
			newErrors.studentNumber = "Student Number must be a number.";
			hasError = true;
		}

		if (!password) {
			newErrors.password = "Password is required.";
			hasError = true;
		} else if (password.length < 8) {
			newErrors.password = "Password must be 8 characters and above.";
			hasError = true;
		}

		if (password && password !== confirmPassword) {
			newErrors.confirmPassword = "Passwords don't match!";
			hasError = true;
		}
		if (hasError) {
      setError(newErrors);
      return;
    }

		try {
      const data = await registerAccount(email, studentNumber, password);
      localStorage.setItem('token', data.token);
			const user = getMe();
			setModalOpen(true);
			const timer = setTimeout(() => navigate("/dashboard"), 4000);
		} catch (error) {
			handleApiError(error, (msg) => setError((prev) => ({ ...prev, general: msg })));
		}
  }

  return(
    <div className="relative min-h-screen">

			{/* Registration Form */}
			<div className="absolute inset-0 flex items-center justify-center z-1 px-4">
				<form onSubmit={handleRegister} className="bg-[#FAF9F6] flex flex-col p-5 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] w-80 max-w sm:max-w-sm">
					<div className="flex items-center justify-center mb-7 z-10">
						<img className="w-12" src="/assets/Kabsupanion-Logo.png" alt="Logo"/>
						<p className="font-bold text-2xl pl-2 text-[#1B651B] font-['Roboto_Condensed']">Registration Form</p>
					</div>
          
					<label className="text-[#A9A9A9] font-bold text-[.8rem] my-0" htmlFor="cvsu-email">CvSU email</label>
					<input onChange={(e) => {setEmail(e.target.value); setError((prev) => ({ ...prev, email: "" }));}} value={email} className={`border ${error.email ? "border-red-500" : "border-gray-300"} rounded-md text-[.9rem] mt-1 mb-1 p-1 w-full max-w outline-none focus:border-green-700 text-sm`} type="email" id="cvsu-email"/>
					{error.email && (
						<p className="text-red-500 text-xs">{error.email}</p>
					)}

          <label className="text-[#A9A9A9] font-bold text-[.8rem] mt-2" htmlFor="studentNumber">Student Number</label>
					<input onChange={(e) => {setStudentNumber(e.target.value); setError((prev) => ({ ...prev, studentNumber: "" }));}} value={studentNumber} className={`border ${error.studentNumber ? "border-red-500" : "border-gray-300"} rounded-md text-[.9rem] mt-1 mb-1 p-1 w-full max-w outline-none focus:border-green-700 text-sm`} type="text" maxLength={9} id="studentNumber"/>
					{error.studentNumber && (
						<p className="text-red-500 text-xs">{error.studentNumber}</p>
					)}

					<label className="text-[#A9A9A9] font-bold text-[.8rem] mt-2" htmlFor="password">Password</label>
					<input onChange={(e) => {setPassword(e.target.value); setError((prev) => ({ ...prev, password: "" }));}} value={password} className={`border ${error.password ? "border-red-500" : "border-gray-300"} rounded-md text-[.9rem] mt-1 mb-1 p-1 w-full max-w outline-none focus:border-green-700 text-sm`} type="password" id="password" minLength={8}/>
					{error.password && (
						<p className="text-red-500 text-xs">{error.password}</p>
					)}

          <label className="text-[#A9A9A9] font-bold text-[.8rem] mt-2" htmlFor="verifyPassword">Confirm Password</label>
					<input onChange={(e) => setConfirmPassword(e.target.value)} value={confirmPassword} className={`border ${error.confirmPassword ? "border-red-500" : "border-gray-300"} rounded-md text-[.9rem] mt-1 mb-1 p-1 w-full max-w outline-none focus:border-green-700 text-sm`} type="password" id="verifyPassword"/>
					{error.confirmPassword && (
						<p className="text-red-500 text-xs">{error.confirmPassword}</p>
					)}

					{error.general && (
            <p className="text-red-500 text-sm font-bold mt-3 text-center">{error.general}</p>
          )}

					<Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
						<div className="text-center w-80 py-4">
							<Icon className="text-[#1B651B] text-2xl mx-auto" icon="gg:check-o" width="60"/>
							<p className="text-[#1B651B] text-2xl font-bold mt-3">Account Created!</p>
							<p className="text-[#A9A9A9] text-sm mt-2">Your account has been successfully registered. Redirecting you to the dashboard.</p>
						</div>
					</Modal>
					
					{/* BUTTON */}
					<div className="flex justify-center mt-5">
						<Button type="submit" text="Submit" BGColor="bg-[#1B651B]" typography="text-white font-bold text-[1rem]" padding="px-6 py-2"/>
					</div>
				</form>
			</div>

			{/* LAYA AT DIWA BACKGROUND */}
			<div className="sm:block absolute bottom-0 right-4 md:right-20 lg:right-80 z-0">
				<img className="opacity-50 w-72" src="/assets/Laya-at-Diwa.png" alt="Laya at Diwa"/>
			</div>
		</div>
  );
}

export default Register