import { Input } from "@/components/ui/input";
import useUserStore from "../../stores/useUserStore";
import employeeApi from "../../api/employeeApi";
import { useEffect, useState } from "react";
import { Building, Users, Badge } from "lucide-react";


function ProfilePage() {
  const user = useUserStore((state) => state.user);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    if (user?.id) {
      setLoading(true);
      employeeApi
        .getProfile(user.id)
        .then((res) => {
          console.log("Profile API response:", res.data);
          setProfile(res.data.employeeProfile || res.data);
        })
        .catch((err) => {
          console.error("Profile fetch error:", err);
          setProfile(null);
        })
        .finally(() => setLoading(false));
    }
  }, [user?.id]);
  if (!user || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }
  if (!profile) {
    return (
      <div className="flex justify-center items-center h-screen">
        ไม่พบข้อมูลพนักงาน
      </div>
    );
  }
  let workShift = "-";
  if (profile.shift) {
    workShift = `${profile.shift.name} (${profile.shift.inTime} - ${profile.shift.outTime})`;
  } else if (profile.workPolicy) {
    workShift = `${profile.workPolicy.name} (${profile.workPolicy.startTime} - ${profile.workPolicy.endTime})`;
  }
  return (
    <div className="flex justify-center bg-[#f6f7fb] min-h-screen py-6">
      <div className="w-[950px] rounded-xl shadow-md bg-white px-8 py-8">
        {/* หัวข้อใหญ่ ข้อมูลพนักงาน */}
        <div className="flex flex-col items-center mb-4">
          <span className="text-xl font-bold text-[#30384d] mb-2 ">
            ข้อมูลพนักงาน
          </span>
        </div>

        <div className="flex gap-10">
          {/* avatar box */}
          <div className="flex flex-col items-center bg-[#f9fafb] rounded-xl shadow border p-7 h-fit w-[330px]">

            {/* รูปโปรไฟล์ */}
            <div className="relative ">
              <img
                src="https://cdn-icons-png.flaticon.com/512/3176/3176167.png"
                alt="Profile"
                className="w-28 h-28 rounded-full border"
              />
            </div>
            <div className="flex flex-col items-center bg-[#f9fafb] rounded-xl p-7 w-[330px]">
              {/* รวมรหัส+ชื่อช่องเดียว */}
              <div className="flex flex-col items-center gap-2 mb-2">
                <span className="font-bold text-primary text-lg">
                  {`${profile.userId || "-"} : ${profile.user?.name || ""}`}
                </span>
              </div>

              {/* สถานที่ทำงาน */}
              <div className="flex items-center gap-2 mb-1 text-gray-600">
                <Building className="w-4 h-4" />
                <span>{profile.branch || "สำนักงานใหญ่"}</span>
              </div>

              {/* แผนก */}
              <div className="flex items-center gap-2 mb-1 text-gray-600">
                <Users className="w-4 h-4" />
                <span>{profile.department || "-"}</span>
              </div>

              {/* ตำแหน่ง */}
              <div className="flex items-center gap-2 mb-1 text-gray-600">
                <Badge className="w-4 h-4" />
                <span>{profile.user?.role || "-"}</span>
              </div>

              {/* สถานะการเข้าใช้งาน */}
              <div className="mt-4">
                <button className="bg-primary text-white px-4 py-1 rounded-full text-sm">
                  เข้าใช้งานได้
                </button>
              </div>
            </div>
          </div>
          {/* ขวา: ฟอร์ม */}
          <div className="w-2/3 p-8 bg-[#f9fafb] rounded-xl shadow border">
            <div className="mb-6">
              <span className="text-lg font-bold text-[#30384d] ">ข้อมูลพื้นฐาน</span>
              <div className="border-b-2 border-gray-200 mt-2" />
            </div>

            {/* ฟอร์มข้อมูล*/}
            <form className="flex flex-col gap-4 ">
              <div>
                <label className="block text-sm text-gray-600">รหัสพนักงาน</label>
                <Input
                  className="input input-bordered w-full bg-gray-50"
                  value={profile.userId || "-"} readOnly />
              </div>
              <div>
                <label className="block text-sm text-gray-600">คำนำหน้า</label>
                <Input
                  className="input input-bordered w-full bg-gray-50"
                  value={profile.title || "-"} readOnly />
              </div>
              <div>
                <label className="block text-sm text-gray-600">ชื่อ-นามสกุล</label>
                <Input
                  className="input input-bordered w-full bg-gray-50"
                  value={profile.user?.name || "-"} readOnly
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600">ชื่อเล่น</label>
                <Input
                  className="input input-bordered w-full bg-gray-50"
                  value={profile.user?.nickname || "-"}
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600">อีเมล</label>
                <Input
                  className="input input-bordered w-full bg-gray-50"
                  value={profile.user?.email || "-"} readOnly
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600">วันเริ่มทำงาน</label>
                <Input
                  className="input input-bordered w-full bg-gray-50"
                  value={profile.user?.workStartDate || "-"}
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600">สาขา</label>
                <Input
                  className="input input-bordered w-full bg-gray-50"
                  value={profile.branch || "-"} readOnly
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600">แผนก</label>
                <Input
                  className="input input-bordered w-full bg-gray-50"
                  value={profile.department || "-"} readOnly
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600">ตำแหน่ง</label>
                <Input
                  className="input input-bordered w-full bg-gray-50"
                  value={profile.user?.role || "-"}
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600">กะงาน</label>
                <Input
                  className="input input-bordered w-full bg-gray-50"
                  value={workShift || "-"}
                  readOnly
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

      export default ProfilePage;