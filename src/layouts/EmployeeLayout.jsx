import React from "react";
import { AppSidebar } from "@/components/app-sidebar.jsx";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar.jsx";
import { Outlet } from "react-router-dom";

function EmployeeLayout() {
  return (
    <SidebarProvider>
      {/* AppSidebar จะแสดงเมนูตาม Role ของ User ที่ login อยู่ */}
      <AppSidebar />

      {/* ส่วนของเนื้อหาหลัก */}
      <div className="md:ml-72">
        {" "}
        {/* ml-72 คือความกว้างของ Sidebar บน Desktop */}
        {/* Header ด้านบน */}
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 justify-between md:justify-end">
          {/* ปุ่มเมนูสำหรับ Mobile (จะถูกแสดงโดย AppSidebar) */}
          <div className="md:hidden">
            <SidebarTrigger />
          </div>

          {/* สามารถเพิ่มส่วนอื่นๆ ของ Header ได้ที่นี่ เช่น User Profile Dropdown */}
        </header>
        {/* พื้นที่สำหรับแสดงเนื้อหาของแต่ละหน้า */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
}

export default EmployeeLayout;
