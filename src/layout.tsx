import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import Table from "@/components/table";
import { CommandSearch } from "@/components/CommandSearch";
import { GlobalAlertDialog } from "@/components/alert-global-dialog";
import { Icons } from "@/components/Icons";

export default function Layout({ children }: { children?: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex flex-col h-screen w-full overflow-hidden">
        <SidebarTrigger />
        <Table />
        {children || null}
      </main>
      <CommandSearch />
      <Icons />
      <GlobalAlertDialog />
    </SidebarProvider>
  );
}
