import * as React from "react"

import { SearchForm } from "@/components/search-form"
import { VersionSwitcher } from "@/components/version-switcher"
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
} from "@/components/ui/sidebar"
import useUserStore from "@/src/stores/useUserStore.js"
import { Link } from "react-router"

// This is sample data.
const adminMenu = {
  // versions: ["1.0.1", "1.1.0-alpha", "2.0.0-beta1"],
  navMain: [
    {
      title: 'AdminMenu',
      url: "#",
      items: [
        {
          title: "Dashboard",
          url: "/admin/dashboard",
        },
        {
          title: "User Management",
          url: "/admin/users-management",
        },
        {
          title: "Attendance",
          url: "/admin/attendance",
        },
        {
          title: "Leave Requests",
          url: "/admin/leave-requests",
        },
        {
          title: "Leave Entitlements",
          url: "/admin/leave-entitlements",
        },
        {
          title: "Work Policy Management",
          url: "/admin/work-policies",
        },
        {
          title: "Shift Management",
          url: "/admin/shifts",
        },
        {
          title: "Audit log",
          url: "/admin/audit-logs",
        },
      ],
    },
  ],
}

const employeeMenu = {
  // versions: ["1.0.1", "1.1.0-alpha", "2.0.0-beta1"],
  navMain: [
    {
      title: 'Employee Menu',
      url: "#",
      items: [
        {
          title: "Dashboard",
          url: "/employee/dashboard",
        },
        {
          title: "My Profile",
          url: "/employee/profile",
        },
        {
          title: "My Attendance",
          url: "/employee/attendance",
        },
        {
          title: "Request Leave",
          url: "/employee/request-leave",
        },
        {
          title: "My Leave Request",
          url: "/employee/leave-requests",
        },
        {
          title: "Leave Entitlement",
          url: "/employee/entitlement",
        },
        {
          title: "Company Holidays",
          url: "/employee/holidays",
        },
      ],
    },
  ],
}

export function AppSidebar({
  ...props
}) {
  const user = useUserStore((state) => state.user);
  const userRole = user?.role ; 
  const finalMenuList =
    userRole === "HR"
      ? adminMenu
      : userRole === "EMPLOYEE"
      ? employeeMenu
      : null;

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <p className="font-extrabold text-blue-900 text-2xl text-center">PERSIST COMPANY</p>
        {/* <VersionSwitcher versions={data.versions} defaultVersion={data.versions[0]} /> */}
        {/* <SearchForm /> */}
      </SidebarHeader>
      <SidebarContent>
        {/* We create a SidebarGroup for each parent. */}
        {finalMenuList.navMain.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={item.isActive}>
                      <Link to={item.url}>{item.title}</Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
