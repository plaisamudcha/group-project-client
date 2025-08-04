import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarFooter,
} from "@/components/ui/sidebar";
import useUserStore from "@/src/stores/useUserStore.js";
import { Link, useLocation } from "react-router";
import { UserNav } from "@/src/components/User-nav";
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  CalendarDays, 
  Settings, 
  UserCog, 
  Calendar, 
  FileText,
  User,
  Building2,
  Shield
} from "lucide-react";

// Icon mapping
const adminIcons = {
  "Dashboard": LayoutDashboard,
  "User Management": Users,
  "Attendance": Clock,
  "Leave Requests": CalendarDays,
  "Leave Entitlements": FileText,
  "Work Policy Management": Settings,
  "Shift Management": UserCog,
  "Holidays Management": Calendar,
  "Audit log": Shield,
};

const employeeIcons = {
  "Dashboard": LayoutDashboard,
  "My Profile": User,
  "My Attendance": Clock,
  "Request Leave": CalendarDays,
  "My Leave Request": FileText,
  "Company Holidays": Building2,
};

const adminMenu = {
  navMain: [
    {
      title: "Admin Panel",
      items: [
        { title: "Dashboard", url: "/admin/dashboard" },
        { title: "User Management", url: "/admin/users-management" },
        { title: "Attendance", url: "/admin/attendances" },
        { title: "Leave Requests", url: "/admin/leave-requests" },
        { title: "Leave Entitlements", url: "/admin/leave-entitlements" },
        { title: "Work Policy Management", url: "/admin/work-policies" },
        { title: "Shift Management", url: "/admin/shifts" },
        { title: "Holidays Management", url: "/admin/holidays" },
        { title: "Audit log", url: "/admin/audit-logs" },
      ],
    },
  ],
};

const employeeMenu = {
  navMain: [
    {
      title: "Employee Portal",
      items: [
        { title: "Dashboard", url: "/employee" },
        { title: "My Profile", url: "/employee/profile" },
        { title: "My Attendance", url: "/employee/attendance" },
        { title: "Request Leave", url: "/employee/request-leave" },
        { title: "My Leave Request", url: "/employee/leave-requests" },
        { title: "Company Holidays", url: "/employee/holidays" },
      ],
    },
  ],
};

export function AppSidebar({ ...props }) {
  const user = useUserStore((state) => state.user);
  const location = useLocation();

  const userRole = user?.role || "EMPLOYEE";
  const finalMenuList = userRole === "HR" ? adminMenu : employeeMenu;
  const iconMap = userRole === "HR" ? adminIcons : employeeIcons;

  return (
    <Sidebar {...props} className="border-r border-gray-200 bg-gradient-to-b from-slate-50 to-blue-50">
      <SidebarHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-white text-xl">PERSIST</h1>
            <p className="text-blue-100 text-sm">
              {userRole === "HR" ? "Admin Portal" : "Employee Portal"}
            </p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="p-4">
        {finalMenuList.navMain.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel className="text-gray-700 font-semibold text-sm uppercase tracking-wide mb-3">
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {group.items.map((item) => {
                  const IconComponent = iconMap[item.title];
                  const isActive = location.pathname === item.url;
                  
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        className={`
                          rounded-lg transition-all duration-200
                          ${isActive 
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg' 
                            : 'hover:bg-blue-50 hover:text-blue-700 text-gray-700'
                          }
                          px-3 py-2.5
                        `}
                        asChild
                      >
                        <Link to={item.url} className="flex items-center gap-3">
                          {IconComponent && (
                            <IconComponent className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                          )}
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      
      <SidebarFooter className="p-4 border-t border-gray-200">
        <UserNav />
      </SidebarFooter>
      
      <SidebarRail className="bg-blue-100" />
    </Sidebar>
  );
}