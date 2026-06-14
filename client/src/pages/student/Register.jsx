import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { registerAccount } from "../../api/auth";
import Button from "../../components/Button";

function Register(){

	const isNumber = (value) => /^[0-9]+$/.test(value);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

		if (!password || !email) {
			setError("Input fields can not be empty!");
			return;
		}
		if (!isNumber(password)) {
			setError("Password must be a number.");
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
			navigate("/dashboard");
		} catch (error) {
			setError("Account can't be registered!")
		}
  }

  return(
    <div className="relative min-h-screen">

			{/* Registration Form */}
			<div className="absolute inset-0 flex items-center justify-center z-1 px-4">
				<form onSubmit={handleRegister} className="bg-[#FAF9F6] flex flex-col p-5 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] w-80 max-w sm:max-w-sm">
					<div className="flex items-center justify-center mb-10">
						<img className="w-10 sm:w-13" src="/assets/CvSU-logo.png" alt="Logo"/>
						<p className="font-bold text-xl sm:text-2xl pl-3 text-[#1B651B]">Registration Form</p>
					</div>
					<label className="text-[#A9A9A9] font-bold text-[.9rem] my-0" htmlFor="cvsu-email">CvSU email</label>
					<input onChange={(e) => setEmail(e.target.value)} className="border border-gray-300 rounded-md text-[.9rem] my-2 p-1 w-full max-w outline-none focus:border-green-700" type="email" id="cvsu-email"/>

					<label className="text-[#A9A9A9] font-bold text-[.9rem] mt-2" htmlFor="password">Password</label>
					<input onChange={(e) => setPassword(e.target.value)} className="border border-gray-300 rounded-md text-[.9rem] my-2 p-1 w-full max-w outline-none focus:border-green-700" type="password" maxLength={9} id="password"/>

          <label className="text-[#A9A9A9] font-bold text-[.9rem] mt-2" htmlFor="verifyPassword">Confirm Password</label>
					<input onChange={(e) => setConfirmPassword(e.target.value)} className="border border-gray-300 rounded-md text-[.9rem] my-2 p-1 w-full max-w outline-none focus:border-green-700" type="password" maxLength={9} id="verifyPassword"/>

					{error && <p className="text-sm font-bold mt-3 mb-0 text-center text-red-500">{error}</p>}
					
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