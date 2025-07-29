import { Navigate } from "react-router";
import useUserStore from "../stores/useUserStore.js";
import { jwtDecode } from "jwt-decode";

function GotoHomePage({}) {
  const accessToken = useUserStore((state) => state.accessToken);
  const decode = accessToken? jwtDecode(accessToken) : null; 
  const userRole = decode?.role; 
  const finalPath =
    userRole === "HR"
      ? '/admin'
      : userRole === "EMPLOYEE"
      ? '/employee'
      : '/';
  return <Navigate to={finalPath} replace />;
}

export default GotoHomePage;
