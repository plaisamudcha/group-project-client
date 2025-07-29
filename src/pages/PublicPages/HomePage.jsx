import { Link } from "react-router";

function HomePage() {
  return (
    <>
      <div className="relative z-10 backdrop-blur-md bg-white/20 border border-white/30 rounded-2xl shadow-xl p-10 text-center text-white max-w-md w-full mx-4">
        <h1 className="mb-4 text-4xl md:text-5xl font-extrabold drop-shadow-md text-black">
          ยินดีต้อนรับ
        </h1>
        <p className="mb-6 text-lg md:text-xl text-black">
          ระบบบันทึกเวลาเข้างาน
          <br />
          <span className="text-sm opacity-80">Time Attendance System</span>
        </p>
        <Link
          to="/login"
          className="inline-block px-6 py-3 bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-600 hover:to-indigo-700 text-white font-semibold rounded-full shadow-md transition duration-300"
        >
          เข้าสู่ระบบ
        </Link>
      </div>
    </>
  );
}
export default HomePage;
