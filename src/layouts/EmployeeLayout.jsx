import { AppSidebar } from "@/components/app-sidebar.jsx";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar.jsx";
import { Outlet } from "react-router";
import { UserNav } from "../components/User-nav";
// import { UserNavi } from "../components/user-nav"; // <-- 1. Import คอมโพเนนต์ใหม่

function EmployeeLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />

      <div className="w-full sticky">
        {" "}
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 justify-between">
          {/* <div className="md:hidden"> */}
          <SidebarTrigger />
          {/* </div> */}
          <UserNav />
        </header>
        {/* <main className="flex-1 p-4 sm:p-6 lg:p-8"> */}
        <Outlet />
        {/* </main> */}
      </div>
    </SidebarProvider>
  );
}

export default EmployeeLayout;
