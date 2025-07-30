import Layout from "@/layout";
import { Toaster } from "@/components/ui/sonner";
import { allSync } from "./SyncEngine";
import { useEffect } from "react";
import { useGlobalStore } from "./GlobalProvider";
import { lastSyncedCheck } from "./SyncEngine";

function App() {
  const { setSyncLoading } = useGlobalStore();
  useEffect(() => {
    (async () => {
      await lastSyncedCheck();

      allSync(setSyncLoading);

      setInterval(() => {
        allSync(setSyncLoading);
      }, 60000);
    })();
    window.addEventListener("keydown", (e) => {
      const key = e.key.toLowerCase();

      if (e.ctrlKey && e.altKey) {
        const el = document.querySelector(`[data-key="${key}"]`);
        if (el instanceof HTMLElement) {
          e.preventDefault(); // optional: block browser default
          el.click();
        }
      }
    });
  }, []);

  return (
    <>
      <Layout></Layout>

      <Toaster position="bottom-right" expand={false} richColors />
    </>
  );
}

export default App;
