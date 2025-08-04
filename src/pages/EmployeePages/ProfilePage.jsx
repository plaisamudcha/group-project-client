import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge as UIBadge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useUserStore from "../../stores/useUserStore";
import employeeApi from "../../api/employeeApi";
import { useEffect, useState } from "react";
import {
  Building,
  Users,
  Badge,
  User,
  Mail,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Briefcase,
  Award,
  Shield,
} from "lucide-react";

function ProfilePage() {
  const user = useUserStore((state) => state.user);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      setLoading(true);
      employeeApi
        .getMyProfile(user.id)
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex justify-center items-center">
        <Card className="w-96 p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูลโปรไฟล์...</p>
        </Card>
      </div>
    );
  }
  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex justify-center items-center">
        <Card className="w-96 p-8 text-center">
          <p className="text-red-600">ไม่พบข้อมูลพนักงาน</p>
        </Card>
      </div>
    );
  }
  let workShift = "-";
  if (profile.shift) {
    workShift = `${profile.shift.name} (${profile.shift.inTime} - ${profile.shift.outTime})`;
  } else if (profile.workPolicy) {
    workShift = `${profile.workPolicy.name} (${profile.workPolicy.startTime} - ${profile.workPolicy.endTime})`;
  }
  console.log("user", user);
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-6">
      <div className="w-full max-w-7xl mx-auto">
        <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm pt-0">
          <CardHeader className="text-center pb-8 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-lg py-4">
            <div className="flex items-center justify-center mb-4">
              <User className="h-8 w-8 mr-3" />
              <CardTitle className="text-3xl font-bold">
                ข้อมูลส่วนตัว
              </CardTitle>
            </div>
            <CardDescription className="text-purple-100 text-lg">
              จัดการและตรวจสอบข้อมูลส่วนตัวของคุณ
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* ส่วนซ้าย - ข้อมูลโปรไฟล์และสถิติ */}
              <div className="lg:col-span-1 space-y-6">
                {/* โปรไฟล์การ์ด */}
                <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-indigo-50">
                  <CardContent className="p-6 text-center">
                    <div className="relative mb-6">
                      <Avatar className="w-24 h-24 mx-auto border-4 border-white shadow-lg">
                        <AvatarImage
                          src="https://cdn-icons-png.flaticon.com/512/3176/3176167.png"
                          alt="Profile"
                        />
                        <AvatarFallback className="bg-purple-100 text-purple-600 text-2xl font-bold">
                          {user?.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <UIBadge className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-green-500 hover:bg-green-600">
                        <Shield className="w-3 h-3 mr-1" />
                        เข้าใช้งานได้
                      </UIBadge>
                    </div>

                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {user?.name || "ไม่ระบุชื่อ"}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      รหัสพนักงาน: {profile.userId || "-"}
                    </p>

                    <div className="space-y-3">
                      <div className="flex items-center justify-center gap-2 text-gray-600">
                        <Building className="w-4 h-4" />
                        <span className="text-sm">
                          {profile.branch || "สำนักงานใหญ่"}
                        </span>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-gray-600">
                        <Users className="w-4 h-4" />
                        <span className="text-sm">
                          {user.department || "ไม่ระบุแผนก"}
                        </span>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-gray-600">
                        <Briefcase className="w-4 h-4" />
                        <span className="text-sm">
                          {user?.role || "ไม่ระบุตำแหน่ง"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* สถิติการทำงาน */}
                <Card className="border-0 shadow-lg">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center">
                      <Award className="w-5 h-5 mr-2 text-purple-600" />
                      ข้อมูลการทำงาน
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg text-center">
                        <div className="text-lg font-bold">
                          {profile.user?.workStartDate
                            ? new Date(
                                profile.user.workStartDate
                              ).toLocaleDateString("th-TH")
                            : "-"}
                        </div>
                        <div className="text-sm text-blue-100">วันเริ่มงาน</div>
                      </div>

                      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg text-center">
                        <div className="text-lg font-bold">
                          {workShift.split("(")[0].trim() || "-"}
                        </div>
                        <div className="text-sm text-green-100">กะการทำงาน</div>
                      </div>

                      <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg text-center">
                        <div className="text-lg font-bold">
                          {workShift.includes("(")
                            ? workShift.split("(")[1]?.replace(")", "") || "-"
                            : "-"}
                        </div>
                        <div className="text-sm text-purple-100">เวลาทำงาน</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* ส่วนขวา - ฟอร์มข้อมูลรายละเอียด */}
              <div className="lg:col-span-2">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center">
                      <User className="w-6 h-6 mr-2 text-purple-600" />
                      ข้อมูลพื้นฐาน
                    </CardTitle>
                    <CardDescription>
                      ข้อมูลส่วนตัวและรายละเอียดการทำงาน
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center">
                          <Badge className="w-4 h-4 mr-2" />
                          รหัสพนักงาน
                        </label>
                        <Input
                          className="bg-gray-50 border-gray-200 focus:border-purple-400"
                          value={profile.userId || "-"}
                          readOnly
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center">
                          <User className="w-4 h-4 mr-2" />
                          คำนำหน้า
                        </label>
                        <Input
                          className="bg-gray-50 border-gray-200 focus:border-purple-400"
                          value={profile.title || "-"}
                          readOnly
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center">
                          <User className="w-4 h-4 mr-2" />
                          ชื่อ-นามสกุล
                        </label>
                        <Input
                          className="bg-gray-50 border-gray-200 focus:border-purple-400"
                          value={user?.name || "-"}
                          readOnly
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center">
                          <User className="w-4 h-4 mr-2" />
                          ชื่อเล่น
                        </label>
                        <Input
                          className="bg-gray-50 border-gray-200 focus:border-purple-400"
                          value={profile.user?.nickname || "-"}
                          readOnly
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center">
                          <Mail className="w-4 h-4 mr-2" />
                          อีเมล
                        </label>
                        <Input
                          className="bg-gray-50 border-gray-200 focus:border-purple-400"
                          value={user?.email || "-"}
                          readOnly
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          วันเริ่มทำงาน
                        </label>
                        <Input
                          className="bg-gray-50 border-gray-200 focus:border-purple-400"
                          value={
                            profile.user?.workStartDate
                              ? new Date(
                                  profile.user.workStartDate
                                ).toLocaleDateString("th-TH")
                              : "-"
                          }
                          readOnly
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          สาขา
                        </label>
                        <Input
                          className="bg-gray-50 border-gray-200 focus:border-purple-400"
                          value={profile.branch || "-"}
                          readOnly
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center">
                          <Building className="w-4 h-4 mr-2" />
                          แผนก
                        </label>
                        <Input
                          className="bg-gray-50 border-gray-200 focus:border-purple-400"
                          value={user.department || "-"}
                          readOnly
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center">
                          <Briefcase className="w-4 h-4 mr-2" />
                          ตำแหน่ง
                        </label>
                        <Input
                          className="bg-gray-50 border-gray-200 focus:border-purple-400"
                          value={user?.role || "-"}
                          readOnly
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          กะงาน
                        </label>
                        <Input
                          className="bg-gray-50 border-gray-200 focus:border-purple-400"
                          value={workShift || "-"}
                          readOnly
                        />
                      </div>
                    </div>

                    {/* ส่วนข้อมูลเพิ่มเติม */}
                    <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                      <h4 className="text-lg font-semibold text-purple-800 mb-4 flex items-center">
                        <Shield className="w-5 h-5 mr-2" />
                        สถานะบัญชี
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <UIBadge className="bg-green-100 text-green-800 mb-2">
                            <Shield className="w-3 h-3 mr-1" />
                            เข้าใช้งานได้
                          </UIBadge>
                          <p className="text-sm text-gray-600">
                            สถานะการใช้งาน
                          </p>
                        </div>
                        <div className="text-center">
                          <UIBadge className="bg-blue-100 text-blue-800 mb-2">
                            <User className="w-3 h-3 mr-1" />
                            พนักงาน
                          </UIBadge>
                          <p className="text-sm text-gray-600">ประเภทผู้ใช้</p>
                        </div>
                        <div className="text-center">
                          <UIBadge className="bg-purple-100 text-purple-800 mb-2">
                            <Building className="w-3 h-3 mr-1" />
                            ภายใน
                          </UIBadge>
                          <p className="text-sm text-gray-600">ประเภทการจ้าง</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ProfilePage;
