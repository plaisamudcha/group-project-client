import { RouterProvider } from "react-router";
import { Suspense } from "react";
import AdminRouter from "./AdminRouter";
import EmployeeRouter from "./EmployeeRouter";
import PublicRouter from "./PublicRouter";
import useUserStore from "../stores/useUserStore";
import { jwtDecode } from "jwt-decode";

function AppRouter() {
  const accessToken = useUserStore((state) => state.accessToken);
  const decode = accessToken? jwtDecode(accessToken) : null; 
  const userRole = decode?.role; 
  const finalRouter =
    userRole === "HR"
      ? AdminRouter
      : userRole === "EMPLOYEE"
      ? EmployeeRouter
      : PublicRouter;
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center h-screen">
          <p className="text-2xl font-bold">Loading...</p>
          <progress className="progress w-56" />
        </div>
      }
    >
      <RouterProvider key={userRole} router={finalRouter} />
    </Suspense>
  );
}

export default AppRouter;
