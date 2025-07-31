import { AppSidebar } from "@/components/app-sidebar.jsx";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar.jsx";
import { Outlet, useNavigate } from "react-router";
// import { UserNavi } from "../components/user-nav"; // <-- 1. Import คอมโพเนนต์ใหม่

function EmployeeLayout() {
  const navigate = useNavigate();
  const { logout, user } = useUserStore();

  const handleLogout = () => {
    logout();
    navigate("/"); // กลับไปหน้าหลักหลังจาก Logout
  };

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

          {/* User Profile Dropdown */}
          <div className="ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.profileImage} alt="User Avatar" />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user?.email?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/employee/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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
