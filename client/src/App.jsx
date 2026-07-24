import AppRoutes from "./routes/AppRoutes.jsx";
import { Suspense, useEffect } from "react";
import LoadingScreen from "./components/ui/LoadingScreen.jsx";
import ErrorBoundary from "./components/common/ErrorBoundary.jsx";
import SessionExpiryWatcher from "./components/common/SessionExpiryWatcher.jsx";

function App() {
  useEffect(() => {
    const handler = (e) => e.preventDefault();
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  return (
    <ErrorBoundary>
      <SessionExpiryWatcher />
      <Suspense fallback={<LoadingScreen />}>
        <AppRoutes />
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;