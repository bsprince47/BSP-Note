import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { registerSW } from "virtual:pwa-register";

const version = "1.0.6";
registerSW({
  immediate: true,
  onRegisteredSW(_, reg) {
    if (!reg) return;

    reg.update(); // 🔁 Force SW to check for updates on page load

    // Optional: manual version compare (advanced)
    if (localStorage.getItem("app_version") !== version) {
      localStorage.setItem("app_version", version);

      if (reg.waiting) {
        reg.waiting.postMessage({ type: "SKIP_WAITING" });
        reg.waiting.addEventListener("statechange", (e) => {
          if ((e.target as ServiceWorker).state === "activated") {
            window.location.reload();
          }
        });
      }
    }
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
