import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import Table from "@/components/table";
import { CommandSearch } from "@/components/CommandSearch";
import { GlobalAlertDialog } from "@/components/alert-global-dialog";
import { Icons } from "@/components/Icons";
import { Label } from "./components/ui/label";
import { Switch } from "./components/ui/switch";
import { useGlobalStore } from "./GlobalProvider";
import { Quiz } from "@/components/Quiz/Quiz";

export default function Layout({ children }: { children?: React.ReactNode }) {
  const { isRenderingMode, setIsRenderingMode } = useGlobalStore();
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex flex-col h-screen w-full overflow-hidden">
        <div className="flex gap-2 justify-between">
          <SidebarTrigger />
          <div className="flex gap-2 mr-2">
            <div className="flex items-center gap-2">
              <Label data-key="e" htmlFor="renderingmode">
                Renders Mode
              </Label>
              <Switch
                id="renderingmode"
                checked={isRenderingMode}
                onCheckedChange={setIsRenderingMode}
              />
            </div>
          </div>
        </div>
        <Table />
        {children || null}
      </main>
      <CommandSearch />
      <Icons />
      <GlobalAlertDialog />
      <Quiz />
    </SidebarProvider>
  );
}
