import { AppSidebar } from "@/components/app-sidebar.jsx";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar.jsx";
import { Outlet } from "react-router";
import { UserNav } from "../components/User-nav.jsx";

function AdminLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 justify-between">
        <SidebarTrigger />
        <UserNav />
      </header>
        <Outlet />
      </main>
    </SidebarProvider>
  );
}
export default AdminLayout;
