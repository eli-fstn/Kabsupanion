import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { registerAccount } from "../../api/auth";
import { Icon } from "@iconify/react";
import Button from "../../components/Button";
import Modal from "../../components/Modal";

function Register(){

	const isNumber = (value) => /^[0-9]+$/.test(value);
  const [email, setEmail] = useState("");
  const [studentNumber, setStudentNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(false);
	const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

		if (!password || !email) {
			setError("Input fields can not be empty!");
			return;
		}
		if (!isNumber(studentNumber)) {
			setError("Student Number must be a number.");
			return;
		}
		if (!email.includes("@cvsu.edu.ph")) {
			setError("Please use your CvSU Email.");
			return;
		}
    if (!(password === confirmPassword)) {
      setError("Passwords don't match!")
      return;
    }
		try {
      // const data = await login(email, password, studentNumber);
      // localStorage.setItem("token", data.token);
			setModalOpen(true);
			setTimeout(() => {
				navigate("/dashboard");
			}, 4000);
		} catch (error) {
			const status = error.response?.status;

      if (status === 403) {
        setError("Student number doesn't exist in the class record.");
      } else if (status === 409) {
				setError("Student number was already claimed. Try again.");
			} else if (status === 429) {
				setError("Too many attempts. Please try again later.");
			} else if (status === 500) {
				setError("Server error. Please try again later.");
			} else if (status === 503) {
				navigate("/error/503");
			} else {
				setError("Something went wrong. Please try again.");
			}
		}
  }

  return(
    <div className="relative min-h-screen">

			{/* Registration Form */}
			<div className="absolute inset-0 flex items-center justify-center z-1 px-4">
				<form onSubmit={handleRegister} className="bg-[#FAF9F6] flex flex-col p-5 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] w-80 max-w sm:max-w-sm">
					<div className="flex items-center justify-center mb-7">
						{/* <img className="w-10 sm:w-13" src="/assets/CvSU-logo.png" alt="Logo"/> */}
						<p className="font-bold text-xl sm:text-2xl pl-3 text-[#1B651B]">Registration Form</p>
					</div>
          
					<label className="text-[#A9A9A9] font-bold text-[.9rem] my-0" htmlFor="cvsu-email">CvSU email</label>
					<input onChange={(e) => setEmail(e.target.value)} className="border border-gray-300 rounded-md text-[.9rem] my-2 p-1 w-full max-w outline-none focus:border-green-700 text-sm" type="email" id="cvsu-email"/>

          <label className="text-[#A9A9A9] font-bold text-[.9rem] mt-2" htmlFor="studentNumber">Student Number</label>
					<input onChange={(e) => setStudentNumber(e.target.value)} className="border border-gray-300 rounded-md text-[.9rem] my-2 p-1 w-full max-w outline-none focus:border-green-700 text-sm" type="text" maxLength={9} id="studentNumber"/>

					<label className="text-[#A9A9A9] font-bold text-[.9rem] mt-2" htmlFor="password">Password</label>
					<input onChange={(e) => setPassword(e.target.value)} className="border border-gray-300 rounded-md text-[.9rem] my-2 p-1 w-full max-w outline-none focus:border-green-700 text-sm" type="password" id="password"/>

          <label className="text-[#A9A9A9] font-bold text-[.9rem] mt-2" htmlFor="verifyPassword">Confirm Password</label>
					<input onChange={(e) => setConfirmPassword(e.target.value)} className="border border-gray-300 rounded-md text-[.9rem] my-2 p-1 w-full max-w outline-none focus:border-green-700 text-sm" type="password" id="verifyPassword"/>

					{error && <p className="text-sm font-bold mt-3 mb-0 text-center text-red-500">{error}</p>}

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
				<img className="opacity-50 w-80" src="/assets/Laya-at-Diwa.png" alt="Laya at Diwa"/>
			</div>
		</div>
  );
}

export default Register