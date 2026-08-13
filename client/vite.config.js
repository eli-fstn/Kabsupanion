import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiOrigin = new URL(env.VITE_API_URL).origin;
  const apiOriginPattern = new RegExp(`^${apiOrigin.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`);

  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: "autoUpdate",
        manifest: false,
        workbox: {
          globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
        },
      }),
    ],
    server: {
      open: true,
    },
  }
})