import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { verifyLogin } from "../../api/auth";
import Button from "../../components/Button";

function LogIn() {

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState(false);
	const navigate = useNavigate();

	const handleLogIn = async (e) => {
		e.preventDefault();

		if (!password || !email) {
			setError("Input fields can not be empty!");
			return;
		}
		if (!email.includes("@cvsu.edu.ph")) {
			setError("Please use your CvSU Email.");
			return;
		}
		try {
			// COMMENT TEMPORARILY
			// const data = await login(email, password);
      // localStorage.setItem("token", data.token);
			navigate("/dashboard");
		} catch (error) {
			const status = error.response?.status;

			if (status === 401) {
				setError("Incorrect email or password.");
			} else if (status === 403) {
				setError("You are not authorized to access this.");
			} else if (status === 404) {
				setError("Account not found.");
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

			{/* Sign In Form */}
			<div className="absolute inset-0 flex items-center justify-center z-1 px-4">
				<form onSubmit={handleLogIn} className="bg-[#FAF9F6] flex flex-col p-5 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] w-80 max-w sm:max-w-sm">
					<div className="flex items-center justify-center mb-7">
						<img className="w-10 sm:w-13" src="/assets/CvSU-logo.png" alt="Logo"/>
						<p className="font-bold text-xl sm:text-2xl pl-3 text-[#1B651B]">MyKabsupanion</p>
					</div>

					<label className="text-[#A9A9A9] font-bold text-[.9rem] my-0" htmlFor="cvsu-email">CvSU email</label>
					<input onChange={(e) => setEmail(e.target.value)} className="border border-gray-300 rounded-md text-[.9rem] my-2 p-1 w-full max-w outline-none focus:border-green-700 text-sm" type="email" id="cvsu-email"/>

					<label className="text-[#A9A9A9] font-bold text-[.9rem] mt-2" htmlFor="password">Password</label>
					<input onChange={(e) => setPassword(e.target.value)} className="border border-gray-300 rounded-md text-[.9rem] mt-2 p-1 w-full max-w outline-none focus:border-green-700 text-sm" type="password"  id="password"/>

					{error && <p className="text-sm font-bold mt-3 mb-0 text-center text-red-500">{error}</p>}
					
					{/* BUTTON */}
					<div className="flex justify-center mt-7">
						<Button type="submit" text="Sign In" BGColor="bg-[#1B651B]" typography="text-white font-bold text-[1rem]" padding="px-6 py-2"/>
					</div>
					<p className="text-[.8rem] text-center mt-5">Don't have an account? <Link to="/register"><span className="text-[#1B651B] font-semibold" li>Register here</span></Link></p>
				</form>
			</div>

			{/* LAYA AT DIWA BACKGROUND */}
			<div className="sm:block absolute bottom-0 right-4 md:right-20 lg:right-80 z-0">
				<img className="opacity-50 w-80" src="/assets/Laya-at-Diwa.png" alt="Laya at Diwa"/>
			</div>
		</div>
	);
}

export default LogIn;