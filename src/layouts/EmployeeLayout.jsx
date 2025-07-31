import { AppSidebar } from "@/components/app-sidebar.jsx";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar.jsx";
import { Outlet } from "react-router";
import { UserNav } from "../components/User-nav";
// import { UserNavi } from "../components/user-nav"; // <-- 1. Import คอมโพเนนต์ใหม่

function EmployeeLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />

      {/* ส่วนของเนื้อหาหลัก */}
      <div className="flex-1 mx-auto p-12">
        {" "}
        {/* ml-72 คือความกว้างของ Sidebar บน Desktop */}
        {/* Header ด้านบน */}
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 justify-between">
          {/* ปุ่มเมนูสำหรับ Mobile (จะถูกแสดงโดย AppSidebar) */}
          <div className="md:hidden">
            <SidebarTrigger />
          </div>
          <UserNav />
        </header>
        {/* พื้นที่สำหรับแสดงเนื้อหาของแต่ละหน้า */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
}

export default EmployeeLayout;
