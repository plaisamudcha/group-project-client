import { Outlet } from "react-router";

function EmployeeLayout() {
  return (
    <div>
      <div className=" bg-amber-100">Navbar</div>
      <Outlet />
    </div>
  );
}
export default EmployeeLayout;
