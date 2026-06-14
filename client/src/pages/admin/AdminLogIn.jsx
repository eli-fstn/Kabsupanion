import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Button from "../../components/Button";

function AdminLogIn(){
  // const isNumber = (value) => /^[0-9]+$/.test(value);
	const [adminUser, setAdminUser] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
	const navigate = useNavigate();

// WILL CHANGE THE ALERT INTO MODALS SOON
	const handleLogIn = (e) => {
		if (adminUser.length === 0 || adminPassword.length === 0) {
			alert("Input field can not be empty!");
		}
		else {
			e.preventDefault();
			navigate("/admindashboard");
		}
	}

	return(
		<div className="relative min-h-screen">

			{/* LOG IN FORM */}
			<div className="absolute inset-0 flex items-center justify-center z-1 px-4">
				<form onSubmit={handleLogIn} className="bg-[#FAF9F6] flex flex-col p-5 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] w-80 max-w sm:max-w-sm">
					<div className="flex items-center justify-center mb-10">
						<img className="w-10 sm:w-13" src="/assets/CvSU-logo.png" alt="Logo"/>
						<p className="font-bold text-xl sm:text-2xl pl-3 text-[#1B651B]">Administrator</p>
					</div>
					<label className="text-[#A9A9A9] font-bold text-[.9rem] my-0" htmlFor="student-number">Username</label>
					<input onChange={(e) => setAdminUser(e.target.value)} className="border border-gray-300 rounded-md text-[.9rem] my-2 p-1 w-full max-w outline-none focus:border-green-700" type="text" maxLength={9} id="student-number"/>
					<label className="text-[#A9A9A9] font-bold text-[.9rem] my-0" htmlFor="student-number">Password</label>
					<input onChange={(e) => setAdminPassword(e.target.value)} className="border border-gray-300 rounded-md text-[.9rem] my-2 p-1 w-full max-w outline-none focus:border-green-700" type="password" id="passwordForAdmin"/>

					{/* BUTTON */}
					<div className="flex justify-center mt-8">
						<Button type="submit" text="Sign In" BGColor="bg-[#1B651B]" typography="text-white font-bold text-[1rem]" padding="px-6 py-2"/>
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

export default AdminLogIn;