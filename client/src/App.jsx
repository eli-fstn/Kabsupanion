import AppRoutes from "./routes/AppRoutes.jsx";
import { useEffect } from "react";

function App() {
  useEffect(() => {
    const handler = (e) => e.preventDefault();
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  return <AppRoutes />;
}

export default App;