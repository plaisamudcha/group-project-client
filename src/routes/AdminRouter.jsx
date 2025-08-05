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
const EmployeeLayout = lazy(() => import("../layouts/EmployeeLayout"));
const AttendancePage = lazy(() =>
  import("../pages/EmployeePages/AttendancePage")
);
const EmployeeDashboardPage = lazy(() =>
  import("../pages/EmployeePages/DashboardPage")
);
const ProfilePage = lazy(() => import("../pages/EmployeePages/ProfilePage"));
const RequestLeavePage = lazy(() =>
  import("../pages/EmployeePages/RequestLeavePage")
);
const MyLeaveRequestPage = lazy(() =>
  import("../pages/EmployeePages/MyLeaveRequestPage")
);
const CompanyHolidayPage = lazy(() =>
  import("../pages/EmployeePages/CompanyHolidayPage")
);

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
        path: "users-management",
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
  }, {
    path: "employee",
    Component: EmployeeLayout,
    children: [
      {
        index: true,
        Component: EmployeeDashboardPage,
      },
      {
        path: "profile",
        Component: ProfilePage,
      },
      {
        path: "attendance",
        Component: AttendancePage,
      },
      {
        path: "request-leave",
        Component: RequestLeavePage,
      },
      {
        path: "leave-requests",
        Component: MyLeaveRequestPage,
      },
      {
        path: "holidays",
        Component: CompanyHolidayPage,
      },
    ],
  },
  {
    path: "*",
    Component: GoToHomePage,
  },
]);

export default AdminRouter;
