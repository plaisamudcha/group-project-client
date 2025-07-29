import { Outlet } from "react-router";

function PublicLayout() {
  return (
    <section
      className="relative min-h-screen bg-cover bg-center flex items-center justify-center"
      style={{
        backgroundImage:
          "url('https://i.pinimg.com/736x/01/fb/a3/01fba3da34283bfbb626ad5372902d79.jpg')", // Time Attendance / clock image
      }}
    >
      {/* กล่องข้อความขุ่น มีเงา */}
      <Outlet />
    </section>
  );
}

export default PublicLayout;
