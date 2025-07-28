import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { registerSW } from "virtual:pwa-register";

const updateSW = registerSW({
  onNeedRefresh() {
    // auto-reload when update is available
    window.location.reload();
  },
  onRegistered(r) {
    // optional: force update check
    r && setInterval(() => r.update(), 60 * 1000);
  },
});
updateSW();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
