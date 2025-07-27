import Layout from "@/layout";
import { Toaster } from "@/components/ui/sonner";
import { allSync } from "./SyncEngine";
import { useEffect } from "react";
import { useGlobalStore } from "./GlobalProvider";

function App() {
  const { setSyncLoading } = useGlobalStore();
  useEffect(() => {
    allSync(setSyncLoading);

    setInterval(() => {
      allSync(setSyncLoading);
    }, 30000);
  }, []);

  return (
    <>
      <Layout></Layout>

      <Toaster position="top-right" expand={true} richColors />
    </>
  );
}

export default App;
