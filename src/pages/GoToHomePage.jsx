import { Navigate } from "react-router";

function GotoHomePage() {
  return <Navigate to="/admin" replace />;
}

export default GotoHomePage;
