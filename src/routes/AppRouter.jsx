import { RouterProvider } from "react-router";
import { Suspense } from "react";
import AdminRouter from "./AdminRouter";
import EmployeeRouter from "./EmployeeRouter";
import PublicRouter from "./PublicRouter";
import useUserStore from "../stores/useUserStore";

function AppRouter() {
  const user = useUserStore((state) => state.user);
  const userRole = user?.role || "PUBLIC"; // This should be dynamically set based on user authentication
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
      <RouterProvider key={user?.id} router={finalRouter} />
    </Suspense>
  );
}

export default AppRouter;
