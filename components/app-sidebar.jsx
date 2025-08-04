import * as React from "react";

import { SearchForm } from "@/components/search-form";
import { VersionSwitcher } from "@/components/version-switcher";
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
} from "@/components/ui/sidebar";
import useUserStore from "@/src/stores/useUserStore.js";
import { Link, useLocation } from "react-router";
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  FileText, 
  Calendar, 
  Shield, 
  Settings, 
  UserCheck,
  Home,
  User,
  ClipboardList,
  SendHorizontal,
  History,
  Building2,
  Sparkles,
  Star
} from "lucide-react";

// This is sample data.
const adminMenu = {
  navMain: [
    {
      title: "Admin Panel",
      url: "#",
      icon: Shield,
      items: [
        {
          title: "Dashboard",
          url: "/admin/dashboard",
          icon: LayoutDashboard,
          color: "text-blue-600"
        },
        {
          title: "User Management",
          url: "/admin/users-management",
          icon: Users,
          color: "text-green-600"
        },
        {
          title: "Attendance",
          url: "/admin/attendances",
          icon: Clock,
          color: "text-purple-600"
        },
        {
          title: "Leave Requests",
          url: "/admin/leave-requests",
          icon: FileText,
          color: "text-orange-600"
        },
        {
          title: "Leave Entitlements",
          url: "/admin/leave-entitlements",
          icon: ClipboardList,
          color: "text-pink-600"
        },
        {
          title: "Work Policy Management",
          url: "/admin/work-policies",
          icon: Settings,
          color: "text-indigo-600"
        },
        {
          title: "Shift Management",
          url: "/admin/shifts",
          icon: UserCheck,
          color: "text-teal-600"
        },
        {
          title: "Holidays Management",
          url: "/admin/holidays",
          icon: Calendar,
          color: "text-red-600"
        },
        {
          title: "Audit log",
          url: "/admin/audit-logs",
          icon: History,
          color: "text-gray-600"
        },
      ],
    },
  ],
};

const employeeMenu = {
  navMain: [
    {
      title: "Employee Portal",
      url: "#",
      icon: Building2,
      items: [
        {
          title: "Dashboard",
          url: "/employee",
          icon: Home,
          color: "text-blue-600"
        },
        {
          title: "My Profile",
          url: "/employee/profile",
          icon: User,
          color: "text-green-600"
        },
        {
          title: "My Attendance",
          url: "/employee/attendance",
          icon: Clock,
          color: "text-purple-600"
        },
        {
          title: "Request Leave",
          url: "/employee/request-leave",
          icon: SendHorizontal,
          color: "text-orange-600"
        },
        {
          title: "My Leave Request",
          url: "/employee/leave-requests",
          icon: FileText,
          color: "text-pink-600"
        },
        {
          title: "Company Holidays",
          url: "/employee/holidays",
          icon: Calendar,
          color: "text-red-600"
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }) {
  const user = useUserStore((state) => state.user);
  const location = useLocation();

  const userRole = user?.role || "EMPLOYEE";
  const finalMenuList =
    userRole === "HR"
      ? adminMenu
      : userRole === "EMPLOYEE"
      ? employeeMenu
      : null;

  return (
    <Sidebar {...props} className="border-r-2 border-blue-100 bg-gradient-to-b from-white to-blue-50/3">
      <SidebarHeader className="p-6 bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-600 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 via-sky-600/90 to-cyan-600/90"></div>
        <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-16 -translate-y-16"></div>
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-full translate-x-12 translate-y-12"></div>
        
        <div className="relative z-10">
          {/* Company Logo/Icon */}
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/30">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 p-1 bg-yellow-400 rounded-full animate-pulse">
                <Sparkles className="h-3 w-3 text-yellow-800" />
              </div>
            </div>
          </div>

          {/* Animated Company Name */}
          <div className="text-center">
            <div className="overflow-hidden">
              <h1 className="font-black text-white text-xl tracking-wider relative inline-block">
                <span className="inline-block animate-bounce" style={{animationDelay: '0ms'}}>P</span>
                <span className="inline-block animate-bounce" style={{animationDelay: '100ms'}}>E</span>
                <span className="inline-block animate-bounce" style={{animationDelay: '200ms'}}>R</span>
                <span className="inline-block animate-bounce" style={{animationDelay: '300ms'}}>S</span>
                <span className="inline-block animate-bounce" style={{animationDelay: '400ms'}}>I</span>
                <span className="inline-block animate-bounce" style={{animationDelay: '500ms'}}>S</span>
                <span className="inline-block animate-bounce" style={{animationDelay: '600ms'}}>T</span>
              </h1>
            </div>
            <div className="overflow-hidden mt-1">
              <h2 className="font-bold text-blue-100 text-sm tracking-widest relative inline-block">
                <span className="inline-block animate-pulse" style={{animationDelay: '0ms'}}>C</span>
                <span className="inline-block animate-pulse" style={{animationDelay: '150ms'}}>O</span>
                <span className="inline-block animate-pulse" style={{animationDelay: '300ms'}}>M</span>
                <span className="inline-block animate-pulse" style={{animationDelay: '450ms'}}>P</span>
                <span className="inline-block animate-pulse" style={{animationDelay: '600ms'}}>A</span>
                <span className="inline-block animate-pulse" style={{animationDelay: '750ms'}}>N</span>
                <span className="inline-block animate-pulse" style={{animationDelay: '900ms'}}>Y</span>
              </h2>
            </div>
            
            {/* Decorative line */}
            <div className="mt-3 flex items-center justify-center">
              <div className="h-0.5 w-8 bg-white/30 rounded-full"></div>
              <Star className="h-3 w-3 text-yellow-400 mx-2 animate-spin" style={{animationDuration: '3s'}} />
              <div className="h-0.5 w-8 bg-white/30 rounded-full"></div>
            </div>
          </div>

          {/* Role Badge */}
          <div className="mt-4 flex justify-center">
            <div className="px-4 py-2 bg-white/20 rounded-full backdrop-blur-sm border border-white/30">
              <span className="text-xs font-bold text-white flex items-center">
                {userRole === "HR" ? (
                  <>
                    <Shield className="h-3 w-3 mr-1" />
                    Administrator
                  </>
                ) : (
                  <>
                    <User className="h-3 w-3 mr-1" />
                    Employee
                  </>
                )}
              </span>
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4">
        {/* We create a SidebarGroup for each parent. */}
        {finalMenuList.navMain.map((section) => (
          <SidebarGroup key={section.title} className="mb-6">
            <SidebarGroupLabel className="text-base font-bold text-gray-700 mb-4 flex items-center px-2">
              {section.icon && <section.icon className="h-5 w-5 mr-2 text-blue-600" />}
              {section.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-2">
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      className={`
                        group relative overflow-hidden rounded-xl p-3 transition-all duration-300 hover:scale-105 hover:shadow-lg
                        ${location.pathname === item.url 
                          ? 'bg-gradient-to-r from-blue-500 to-sky-500 text-white shadow-lg shadow-blue-500/30 scale-105' 
                          : 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-sky-50 hover:text-blue-700 text-gray-700'
                        }
                      `}
                      asChild
                      isActive={location.pathname === item.url}
                    >
                      <Link to={item.url} className="flex items-center space-x-3 relative z-10">
                        <div className={`p-2 rounded-lg transition-colors duration-300 ${
                          location.pathname === item.url 
                            ? 'bg-white/20' 
                            : 'bg-gray-100 group-hover:bg-white'
                        }`}>
                          <item.icon className={`h-4 w-4 ${
                            location.pathname === item.url 
                              ? 'text-white' 
                              : item.color + ' group-hover:scale-110 transition-transform duration-300'
                          }`} />
                        </div>
                        <span className="font-medium group-hover:font-semibold transition-all duration-300">
                          {item.title}
                        </span>
                        
                        {/* Active indicator */}
                        {location.pathname === item.url && (
                          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                          </div>
                        )}
                        
                        {/* Hover glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-sky-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      
      <SidebarRail className="bg-blue-200/50" />
    </Sidebar>
  );
}