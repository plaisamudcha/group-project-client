import { createBrowserRouter } from "react-router";
import { lazy } from "react";

const AdminLayout = lazy(() => import("../layouts/AdminLayout"));
const AttendanceRecordPage = lazy(() =>
  import("../pages/AdminPages/AttendanceRecordPage")
);
const RegisterEmployeePage = lazy(() =>
  import("../pages/AdminPages/RegisterEmployeePage")
);
const AuditLogPage = lazy(() => import("../pages/AdminPages/AuditLogPage"));
const DashboardPage = lazy(() => import("../pages/AdminPages/DashboardPage"));
const HolidayManagementPage = lazy(() =>
  import("../pages/AdminPages/HolidayManagementPage")
);
const LeaveEntitlementPage = lazy(() =>
  import("../pages/AdminPages/LeaveEntitlementPage")
);
const LeaveRequestPage = lazy(() =>
  import("../pages/AdminPages/LeaveRequestPage")
);
const ShiftManagementPage = lazy(() =>
  import("../pages/AdminPages/ShiftManagementPage")
);
const UserManagementPage = lazy(() =>
  import("../pages/AdminPages/UserManagementPage")
);
const WorkPolicyManagementPage = lazy(() =>
  import("../pages/AdminPages/WorkPolicyManagementPage")
);
const GoToHomePage = lazy(() => import("../pages/GoToHomePage"));

const AdminRouter = createBrowserRouter([
  {
    path: "admin",
    Component: AdminLayout,
    children: [
      {
        index: true,
        Component: DashboardPage,
      },
      {
        path: "dashboard",
        Component: DashboardPage,
      },
      {
        path: "register",
        Component: RegisterEmployeePage,
      },
      {
        path: "users",
        Component: UserManagementPage,
      },
      {
        path: "attendances",
        Component: AttendanceRecordPage,
      },
      {
        path: "leave-requests",
        Component: LeaveRequestPage,
      },
      {
        path: "leave-entitlements",
        Component: LeaveEntitlementPage,
      },
      {
        path: "work-policies",
        Component: WorkPolicyManagementPage,
      },
      {
        path: "shifts",
        Component: ShiftManagementPage,
      },
      {
        path: "holidays",
        Component: HolidayManagementPage,
      },
      {
        path: "audit-logs",
        Component: AuditLogPage,
      },
    ],
  },
  {
    path: "*",
    Component: GoToHomePage,
  },
]);

export default AdminRouter;
