import { Navigate } from "react-router";
import useUserStore from "../stores/useUserStore.js";

function GotoHomePage({}) {
  const user = useUserStore((state) => state.user);
  const userRole = user?.role ; 
  const finalPath =
    userRole === "HR"
      ? '/admin'
      : userRole === "EMPLOYEE"
      ? '/employee'
      : '/';
  return <Navigate to={finalPath} replace />;
}

export default GotoHomePage;
