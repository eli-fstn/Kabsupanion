import error503 from "/assets/illustrations/error503.svg";

function Error503() {
  return (
    <div className="h-screen flex flex-col items-center justify-center text-center px-6">
      
      {/* IMAGE */}
      <img src={error503} alt="Error 503" className="w-70 mb-6" />

      {/* STATUS CODE */}
      <h1 className="text-4xl font-bold text-gray-800">ERROR: 503</h1>

      {/* DESCRIPTION */}
      <p className="text-gray-500 mt-4 sm:text-md text-lg">The system is currently under maintenance. Please check back soon.</p>
    </div>
  );
}

export default Error503;