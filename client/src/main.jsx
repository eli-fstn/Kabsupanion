import "./sentry.ts";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { UserProvider } from "./context/userContext";
import { ThemeProvider } from "./context/themeContext";
import { ToastProvider } from "./context/toastContext";
import { SpeedInsights } from "@vercel/speed-insights/react"
import { Analytics } from "@vercel/analytics/react"
import App from "./App.jsx";
import "./styles/style.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <UserProvider>
          <ToastProvider>
            <App />
            <SpeedInsights />
            <Analytics />
          </ToastProvider>
        </UserProvider>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
);