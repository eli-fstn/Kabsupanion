console.log(import.meta.env.VITE_MAINTENANCE_MODE);
console.log(import.meta.env);

import AppRoutes from "./routes/AppRoutes.jsx";
import Error503 from "./pages/errors/Error503.jsx";

function App() {
   if (import.meta.env.VITE_MAINTENANCE_MODE === "true") {
    return <Error503 />;
  }
  return <AppRoutes />;
}

export default App;