import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { UserProvider } from "./context/userContext";
import { SpeedInsights } from "@vercel/speed-insights/react"
import App from "./App.jsx";
import "./styles/style.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <UserProvider>
        <App />
        <SpeedInsights />
      </UserProvider>
    </BrowserRouter>
  </StrictMode>
);