import { createBrowserRouter } from "react-router";
import { lazy } from "react";

const EmployeeLayout = lazy(() => import("../layouts/EmployeeLayout"));
const AttendancePage = lazy(() =>
  import("../pages/EmployeePages/AttendancePage")
);
const DashboardPage = lazy(() =>
  import("../pages/EmployeePages/DashboardPage")
);
const ProfilePage = lazy(() => import("../pages/EmployeePages/ProfilePage"));
const RequestLeavePage = lazy(() =>
  import("../pages/EmployeePages/RequestLeavePage")
);
const LeaveEntitlementPage = lazy(() =>
  import("../pages/EmployeePages/LeaveEntitlementPage")
);
const MyLeaveRequestPage = lazy(() =>
  import("../pages/EmployeePages/MyLeaveRequestPage")
);
const CompanyHolidayPage = lazy(() =>
  import("../pages/EmployeePages/CompanyHolidayPage")
);
const GoToHomePage = lazy(() => import("../pages/GoToHomePage"));

const EmployeeRouter = createBrowserRouter([
  {
    path: "/",
    Component: EmployeeLayout,
    children: [
      {
        index: true,
        Component: DashboardPage,
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
        path: "entitlement",
        Component: LeaveEntitlementPage,
      },
      {
        path: "holidays",
        Component: CompanyHolidayPage,
      },
      {
        path: "*",
        Component: GoToHomePage,
      },
    ],
  },
]);

export default EmployeeRouter;
