import AppRoutes from "./routes/AppRoutes.jsx";
import { Suspense, useEffect } from "react";
import LoadingScreen from "./components/ui/LoadingScreen.jsx";

function App() {
  useEffect(() => {
    const handler = (e) => e.preventDefault();
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  return (
    <Suspense fallback={<LoadingScreen />}>
      <AppRoutes />
    </Suspense>
  );
}

export default App;