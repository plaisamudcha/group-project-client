import { useEffect, useState } from "react";
// import employeeApi from "@/src/api/employeeApi";

import { Input } from "@/components/ui/input";
import useUserStore from "../../stores/useUserStore";
import employeeApi from "../../api/employeeApi";  
function ProfilePage() {

  const user = useUserStore((state) => state.user);
  // const accessToken = useUserStore((state) => state.accessToken);
  // const [profile, setProfile] = useState(null);



  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }
  // console.log('employeeApi', employeeApi)
  // console.log('profile', profile)

  // useEffect(() => {
  //   if (!user) return;
  //   employeeApi
  //     .get(`/${user.id}`)
  //     .then((res) => {
  //       console.log("API Response:", res); 

  //       setProfile(res.data.profile);
  //     })
  //     .catch((err) => {
  //       setProfile(null);
  //       console.error("Get profile failed", err);
  //     });
  // }, [user]);

//   useEffect(() => {
//     if (!user || !accessToken) return;

//     employeeApi.get(`${user.id}`, {
//       headers: { Authorization: `Bearer ${accessToken}` }
//     })
//       .then(res => {
//         console.log("profile res", res);
//         setProfile(res.data.profile);
//       })
//       .catch(err => {
//         console.log("Get profile failed ", err);
//       });
//   }, [user, accessToken]);

// if (!profile) {
//   return <div>ไม่พบข้อมูล profile</div>;
// }
  
return (
  <div className="flex justify-center bg-[#f6f7fb] min-h-screen py-6">
    <div className="w-[950px] rounded-xl shadow-md bg-white px-8 py-8">
      {/* หัวข้อใหญ่ ข้อมูลพนักงาน */}
      <div className="flex flex-col items-center mb-8">
        <span className="text-xl font-bold text-[#30384d] mb-2">
          ข้อมูลพนักงาน
        </span>
      </div>

      <div className="flex gap-10">
        {/* avatar box */}
        <div className="flex flex-col items-center bg-[#f9fafb] rounded-xl shadow border p-7 w-[330px]">

          {/* รูปโปรไฟล์ */}
          <div className="relative ">
            <img
              src="/avatar_placeholder.png"
              alt="Profile"
              className="w-28 h-28 rounded-full border"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600">รหัสพนักงาน</label>
            <Input value={user.id || ""} readOnly />
          </div>
          <div className="mt-2 font-bold text-primary text-lg">
            นาย สมชาย หมายครอง
          </div>
          <div className="text-gray-500 text-sm">สำนักงานใหญ่</div>
          {/* สถานะ */}
          <div className="mt-4">
            <button className="bg-primary text-white px-4 py-1 rounded-full text-sm">
              เข้าใช้งานได้
            </button>
          </div>
        </div>

        {/* ขวา: ฟอร์ม */}
        <div className="w-2/3 p-8 bg-accent">
          <div className="mb-6">
            <span className="text-lg font-bold text-[#30384d]">ข้อมูลพื้นฐาน</span>
            <div className="border-b-2 border-gray-200 mt-2" />
          </div>

          {/* ฟอร์มข้อมูล*/}
          <form className="flex flex-col gap-4 ">
            <div>
              <label className="block text-sm text-gray-600">รหัสพนักงาน</label>
              <Input
                className="input input-bordered w-full bg-gray-50"
                value="000001"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600">คำนำหน้า</label>
              <Input
                className="input input-bordered w-full bg-gray-50"
                value="นาย"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600">ชื่อ-นามสกุล</label>
              <Input
                className="input input-bordered w-full bg-gray-50"
                value={user.name || ""}
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600">ชื่อเล่น</label>
              <Input
                className="input input-bordered w-full bg-gray-50"
                value={user.nickname || ""}
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600">อีเมล</label>
              <Input
                className="input input-bordered w-full bg-gray-50"
                value={user.email || ""}
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600">วันเริ่มทำงาน</label>
              <Input
                className="input input-bordered w-full bg-gray-50"
                value="07/01/2020"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600">สาขา</label>
              <Input
                className="input input-bordered w-full bg-gray-50"
                value="สำนักงานใหญ่"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600">แผนก</label>
              <Input
                className="input input-bordered w-full bg-gray-50"
                value="IT Support"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600">ตำแหน่ง</label>
              <Input
                className="input input-bordered w-full bg-gray-50"
                value={user.role || ""}
                readOnly
              />
            </div>
            {/* <div>กะงาน: {profile.workPolicy.name} ({profile.workPolicy.startTime}-{profile.workPolicy.endTime})</div> */}
            {/* <div>
                <label className="block text-sm text-gray-600">กะงาน</label>
                <Input
                  className="input input-bordered w-full bg-gray-50"
                  value={
                    profile.shift
                      ? `กะพิเศษ: ${profile.shift.name} (${profile.shift.inTime} - ${profile.shift.outTime})`
                      : `กะปกติ: ${profile.workPolicy.name} (${profile.workPolicy.startTime} - ${profile.workPolicy.endTime})`
                  }
                  readOnly
                />
              </div> */}

            {/* <div>
                กะงาน:{" "}
                {profile?.workPolicy
                  ? `${profile.workPolicy.name} (${profile.workPolicy.startTime} - ${profile.workPolicy.endTime})`
                  : "ไม่ระบุ"}
              </div> */}

          </form>
        </div>
      </div>
    </div>
  </div>
);
}

export default ProfilePage;