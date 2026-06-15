function Error503() {
  return (
    <div className="h-screen flex flex-col items-center justify-center text-center px-6">
      
      {/* IMAGE */}
      <img src="/assets/forErrors/hook.png" alt="503 Server Error" className="w-40 mb-6" />

      {/* STATUS CODE */}
      <h1 className="text-4xl font-bold text-gray-800">ERROR: 503</h1>

      {/* DESCRIPTION */}
      <p className="text-gray-500 mt-4 text-lg">The system is currently under maintenance. Please check back soon.</p>
    </div>
  );
}

export default Error503;