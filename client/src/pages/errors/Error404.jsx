function Error404() {
  return (
    <div className="h-screen flex flex-col items-center justify-center text-center px-6">
      
      {/* IMAGE */}
      <img src="/assets/forErrors/lost.png" alt="404 Not Found" className="w-40 mb-6"/>

      {/* STATUS CODE */}
      <h1 className="text-4xl font-bold text-gray-800">ERROR: 404</h1>

      {/* DESCRIPTION */}
      <p className="text-gray-500 mt-4 text-lg">We couldn’t find the page you’re looking for. It may have been moved or doesn't exist.</p>

    </div>
  );
}

export default Error404;