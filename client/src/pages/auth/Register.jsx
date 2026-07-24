import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { registerAccount } from "../../services/auth.ts";
import { useUser } from "../../context/userContext";
import { Icon } from "@iconify/react";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { handleApiError } from "../../services/errorHandler.ts";
import LoadingScreen from "../../components/ui/LoadingScreen";
import logo from "../../assets/images/Kabsupanion-Logo.png";

function Register(){
	const isNumber = (value) => /^[0-9]+$/.test(value);
  const [email, setEmail] = useState("");
  const [studentNumber, setStudentNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
	const [agreedToTerms, setAgreedToTerms] = useState(false);
	const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [error, setError] = useState({
		email: "",
		studentNumber: "",
		password: "",
		confirmPassword: "",
		general: "",
	});
	const [loading, setLoading] = useState(false);
	const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();
  const { student, setStudent } = useUser();

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
		} else if (studentNumber.length < 9) {
			newErrors.studentNumber = "Student Number should have 9 digits."
			hasError = true;
		}

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

		if (!agreedToTerms) {
			newErrors.terms = "You must agree to the Data Privacy terms to continue.";
			hasError = true;
		}

		if (hasError) {
      setError(newErrors);
      return;
    }

		setLoading(true);

		try {
      const data = await registerAccount(email, studentNumber, password);
      localStorage.setItem('token', data.token);
      setStudent(data.user);
			setModalOpen(true);
			const timer = setTimeout(() => navigate("/student/dashboard"), 4000);
		} catch (error) {
			handleApiError(error, (msg) => setError((prev) => ({ ...prev, general: msg })));
			setLoading(false);
		}
  }

	if (loading) return <LoadingScreen />;

  return(
    <div className="relative min-h-screen">

			{/* Registration Form */}
			<div className="absolute inset-0 flex items-center justify-center px-4">
				<form onSubmit={handleRegister} className="bg-[#fafafa] flex flex-col p-5 rounded-xl shadow-md w-80 z-10">
					<Button 
						text={<Icon className="mr-2" icon="formkit:arrowleft" width="20" height="20" />}
						typography="text-gray-500"
						onClick={() => navigate(-1)}
						dimensions="w-fit m-0 p-0"
						animation="active:scale-95 duration-100 transition-all"
					/>
					<div className="flex items-center justify-center mb-7">
						<img className="w-10 rounded-md" src={logo} alt="Kabsupanion Logo"/>
						<p className="font-bold text-2xl pl-2 text-[#1B651B] font-['Roboto_Condensed']">Registration Form</p>
					</div>
          
					<label className="text-[#A9A9A9] font-bold text-xs my-0" htmlFor="cvsu-email">CvSU email</label>
					<input onChange={(e) => {setEmail(e.target.value); setError((prev) => ({ ...prev, email: "" }));}} value={email} className={`border ${error.email ? "border-red-500" : "border-gray-300"} rounded-md text-xs mt-1 mb-1 w-full max-w p-1.5 outline-none focus:border-green-700`} type="email" id="cvsu-email"/>
					{error.email && (
						<p className="text-red-500 text-xs">{error.email}</p>
					)}

          <label className="text-[#A9A9A9] font-bold text-xs mt-2" htmlFor="studentNumber">Student Number</label>
					<input onChange={(e) => {setStudentNumber(e.target.value); setError((prev) => ({ ...prev, studentNumber: "" }));}} value={studentNumber} className={`border ${error.studentNumber ? "border-red-500" : "border-gray-300"} rounded-md text-xs mt-1 mb-1 p-1.5 w-full max-w outline-none focus:border-green-700`} type="text" maxLength={9} id="studentNumber"/>
					{error.studentNumber && (
						<p className="text-red-500 text-xs">{error.studentNumber}</p>
					)}

					<label className="text-[#A9A9A9] font-bold text-xs mt-2" htmlFor="password">Password</label>
					<input onChange={(e) => {setPassword(e.target.value); setError((prev) => ({ ...prev, password: "" }));}} value={password} className={`border ${error.password ? "border-red-500" : "border-gray-300"} rounded-md text-xs mt-1 mb-1 p-1.5 w-full max-w outline-none focus:border-green-700`} type="password" id="password"/>
					{error.password && (
						<p className="text-red-500 text-xs">{error.password}</p>
					)}

          <label className="text-[#A9A9A9] font-bold text-xs mt-2" htmlFor="verifyPassword">Confirm Password</label>
					<input onChange={(e) => {setConfirmPassword(e.target.value); setError((prev) => ({ ...prev, confirmPassword: "" }));}} value={confirmPassword} className={`border ${error.confirmPassword ? "border-red-500" : "border-gray-300"} rounded-md text-xs mt-1 mb-1 p-1.5 w-full max-w outline-none focus:border-green-700`} type="password" id="verifyPassword"/>
					{error.confirmPassword && (
						<p className="text-red-500 text-xs">{error.confirmPassword}</p>
					)}

					{/* Account Created Modal */}
					<Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
						<div className="text-center w-80 py-4">
							<Icon className="text-[#1B651B] text-2xl mx-auto" icon="gg:check-o" width="60"/>
							<p className="text-[#1B651B] text-2xl font-bold mt-3">Account Created!</p>
							<p className="text-[#A9A9A9] text-sm mt-2">Your account has been successfully registered. Redirecting you to the dashboard.</p>
						</div>
					</Modal>

					{/* Checkbox of ToS */}
					<div className="flex items-start gap-2 mt-4">
						<input
							id="terms"
							type="checkbox"
							checked={agreedToTerms}
							onChange={(e) => {
								setAgreedToTerms(e.target.checked);
								setError((prev) => ({ ...prev, terms: "" }));
							}}
							className="mt-0.5 w-4 h-4 accent-[#1B651B] cursor-pointer shrink-0"
						/>
						<label htmlFor="terms" className="text-xs text-gray-600 dark:text-[#E0E0E0] leading-snug cursor-pointer">
							I have read and agree to the{" "}
							<button
								type="button"
								onClick={() => setTermsModalOpen(true)}
								className="font-bold text-[#1B651B] dark:text-[#56e556] underline hover:no-underline"
							>
								Data Privacy Notice
							</button>
							.
						</label>
					</div>
					{error.terms && (
						<p className="text-red-500 text-xs mt-1">{error.terms}</p>
					)}

					{/* ToS Modal */}
					<Modal isOpen={termsModalOpen} onClose={() => setTermsModalOpen(false)}>
						<div className="flex flex-col w-80 sm:w-full max-w-lg sm:max-w-xl max-h-[90vh]">
							<div className="flex justify-end">
								<Button
									onClick={() => setTermsModalOpen(false)}
									bgColor="bg-transparent"
									typography="text-gray-400 hover:text-gray-600"
									padding="p-2 px-5"
									dimensions="rounded-md"
									animation="active:scale-95 transition-all duration-100"
									text={<Icon icon="mdi:close" className="text-2xl" />}
								/>
							</div>
							<div className="w-full border-t border-t-gray-200 dark:border-t-[#2a2a2a]"></div>

							<div className="px-6 py-3">
								<p className="font-bold text-base sm:text-[1.2rem] text-[#1B651B] dark:text-[#56e556] font-['Montserrat']">
									Data Privacy Notice
								</p>
								<p className="text-gray-400 dark:text-[#E0E0E0] text-xs mb-4">
									In accordance with the Data Privacy Act of 2012 (RA 10173)
								</p>

								<div className="overflow-y-auto flex-1 text-xs text-gray-700 dark:text-gray-200 leading-relaxed pr-1">
									<p>By registering for and using this platform, you consent to the collection, use, and processing of your personal data described below, in accordance with the Data Privacy Act of 2012 (Republic Act No. 10173) and its Implementing Rules and Regulations.</p>

									<p className="font-bold text-gray-900 dark:text-gray-100 mt-5 mb-1">What we collect</p>
									<p>We collect your name, student/account details, and any files, notes, or content you choose to upload or submit within the platform.</p>

									<p className="font-bold text-gray-900 dark:text-gray-100 mt-5 mb-1">Why we collect it</p>
									<p>Your information is used solely to operate core features of this platform; account access, class resource sharing, and related academic collaboration tools for your block.</p>

									<p className="font-bold text-gray-900 dark:text-gray-100 mt-5 mb-1">How it's protected</p>
									<p>Your data is stored securely and is not shared with third parties outside what is necessary to operate the platform's services.</p>

									<p className="font-bold text-gray-900 dark:text-gray-100 mt-5 mb-1">Your rights</p>
									<p>Under RA 10173, you have the right to access, correct, and request deletion of your personal data, and to withdraw consent at any time, subject to platform functionality requirements.</p>
								</div>
							</div>
						</div>
					</Modal>

					{error.general && (
            <p className="text-red-500 text-xs leading-4 font-bold mt-1 text-center">{error.general}</p>
          )}
					
					{/* BUTTON */}
					<div className="flex justify-center mt-4">
						<Button
							type="submit"
							text="Submit"
							bgColor="bg-[#1B651B]"
							typography="text-white font-medium text-xs"
							padding="px-6 py-2"
							dimensions="w-full rounded-md"
							animation="active:scale-95 transition-all duration-100 hover:bg-[#288a28]"
						/>
					</div>
				</form>
			</div>

			<div className="flex justify-center items-center fixed bottom-0 left-0 right-0 py-3">
        <p className="text-xs">Encountered a problem?<span className="text-[#1B651B] font-semibold ml-1">
					<a href="https://forms.gle/S7CdziBEMCq6DtEF6" target="_blank" rel="noreferrer">Report here</a>
					</span>
				</p>
      </div>
		</div>
  );
}

export default Register