import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["**/*"],

      manifest: {
        name: "My Offline React App",
        short_name: "ReactApp",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#0d9488",
        icons: [
          {
            src: "https://img.icons8.com/3d-fluency/100/edit-property.png",
            sizes: "100x100",
            type: "image/png",
          },
        ],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 🔥 5MB limit
        globPatterns: [
          "**/*.{js,css,html,woff2,woff,png,svg,jpg,jpeg,ico,json}",
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
