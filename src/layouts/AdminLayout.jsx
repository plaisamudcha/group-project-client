import { AppSidebar } from "@/components/app-sidebar.jsx";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar.jsx";
import { Outlet } from "react-router";

function AdminLayout() {
  return (
    <SidebarProvider>
      <AppSidebar/>
      <SidebarTrigger/>
      <Outlet/>
    </SidebarProvider>
  );
}
export default AdminLayout;
