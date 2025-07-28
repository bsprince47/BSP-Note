import Layout from "@/layout";
import { Toaster } from "@/components/ui/sonner";
import { allSync } from "./SyncEngine";
import { useEffect } from "react";
import { useGlobalStore } from "./GlobalProvider";
import { lastSyncedCheck } from "./SyncEngine";
import { registerSW } from "virtual:pwa-register";

registerSW();

function App() {
  const { setSyncLoading } = useGlobalStore();
  useEffect(() => {
    (async () => {
      await lastSyncedCheck();

      allSync(setSyncLoading);

      setInterval(() => {
        allSync(setSyncLoading);
      }, 30000);
    })();
  }, []);

  return (
    <>
      <Layout></Layout>

      <Toaster position="top-right" expand={true} richColors />
    </>
  );
}

export default App;
