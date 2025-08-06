import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Users,
  Calendar,
  TrendingUp,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  User,
  FileText,
} from "lucide-react";
import admintoApi from "../../api/adminApi";

const COLORS = ["#4CAF50", "#2196F3", "#FF9800", "#F44336"];

export default function DashboardPage() {
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch data from multiple APIs in parallel
        const [usersResponse, leavesResponse, attendanceResponse] =
          await Promise.all([
            admintoApi.getAllUser(),
            admintoApi.getAllLeaveRequst(),
            admintoApi.getAllAttendance(),
          ]);

        // Handle different response structures for users
        let users = [];
        if (usersResponse.data) {
          if (Array.isArray(usersResponse.data)) {
            users = usersResponse.data;
          } else if (
            usersResponse.data.users &&
            Array.isArray(usersResponse.data.users)
          ) {
            users = usersResponse.data.users;
          } else if (
            usersResponse.data.data &&
            Array.isArray(usersResponse.data.data)
          ) {
            users = usersResponse.data.data;
          }
        }

        // Handle different response structures for leaves
        let leaves = [];
        if (leavesResponse.data) {
          if (Array.isArray(leavesResponse.data)) {
            leaves = leavesResponse.data;
          } else if (
            leavesResponse.data.leaves &&
            Array.isArray(leavesResponse.data.leaves)
          ) {
            leaves = leavesResponse.data.leaves;
          } else if (
            leavesResponse.data.data &&
            Array.isArray(leavesResponse.data.data)
          ) {
            leaves = leavesResponse.data.data;
          }
        }

        console.log("Users Response Debug:", {
          usersResponse: usersResponse,
          usersData: usersResponse.data,
          usersLength: users.length,
          usersStructure: typeof usersResponse.data,
          isUsersArray: Array.isArray(users),
        });

        // Handle different response structures for attendances
        let attendances = [];
        if (attendanceResponse.data) {
          if (Array.isArray(attendanceResponse.data)) {
            attendances = attendanceResponse.data;
          } else if (
            attendanceResponse.data.attendances &&
            Array.isArray(attendanceResponse.data.attendances)
          ) {
            attendances = attendanceResponse.data.attendances;
          } else if (
            attendanceResponse.data.data &&
            Array.isArray(attendanceResponse.data.data)
          ) {
            attendances = attendanceResponse.data.data;
          }
        }

        console.log("API Response Debug:", {
          usersCount: users.length,
          leavesCount: leaves.length,
          attendancesCount: attendances.length,
          usersStructure: usersResponse.data,
          leavesStructure: leavesResponse.data,
          attendanceStructure: attendanceResponse.data,
        });

        // Calculate employee count - ensure we have the correct users array
        const employeeCount = Array.isArray(users) ? users.length : 0;

        console.log("Employee Count Calculation:", {
          employeeCount,
          usersIsArray: Array.isArray(users),
          usersLength: users.length,
        });

        // Get today's date
        const today = new Date().toISOString().split("T")[0];

        // Calculate today's attendance status
        const todayAttendances = Array.isArray(attendances)
          ? attendances.filter((att) => att.date === today)
          : [];
        const attendedToday = todayAttendances.filter(
          (att) => !att.isAbsent && (att.clockIn || att.clockOut)
        ).length;
        const absentToday = todayAttendances.filter(
          (att) => att.isAbsent
        ).length;

        // Get today's leaves
        const todayLeaves = Array.isArray(leaves)
          ? leaves.filter((leave) => {
              const leaveStart = new Date(leave.startDate);
              const leaveEnd = new Date(leave.endDate);
              const todayDate = new Date(today);
              return (
                todayDate >= leaveStart &&
                todayDate <= leaveEnd &&
                leave.status === "APPROVED"
              );
            })
          : [];

        const leavesToday = todayLeaves.length;

        // Calculate leave requests by status
        const approvedLeaves = Array.isArray(leaves)
          ? leaves.filter((leave) => leave.status === "APPROVED").length
          : 0;
        const pendingLeaves = Array.isArray(leaves)
          ? leaves.filter((leave) => leave.status === "PENDING").length
          : 0;
        const rejectedLeaves = Array.isArray(leaves)
          ? leaves.filter((leave) => leave.status === "REJECTED").length
          : 0;

        const stats = {
          employeeCount: employeeCount, // ใช้ค่าที่คำนวณแล้ว
          todayStatus: [
            { label: "มา", count: attendedToday },
            { label: "ลา", count: leavesToday },
            { label: "ขาด", count: absentToday },
          ],
          leaveRequests: [
            { label: "อนุมัติ", count: approvedLeaves },
            { label: "รออนุมัติ", count: pendingLeaves },
            { label: "ไม่อนุมัติ", count: rejectedLeaves },
          ],
          todayLeaves: todayLeaves.map((leave) => ({
            name:
              leave.user?.name ||
              (leave.user?.firstName && leave.user?.lastName
                ? `${leave.user.firstName} ${leave.user.lastName}`
                : "ไม่ระบุชื่อ"),
            leaveType:
              leave.leaveType?.name || leave.leaveType || "ไม่ระบุประเภท",
            startDate: leave.startDate,
            endDate: leave.endDate,
          })),
        };

        setStats(stats);
      } catch (error) {
        console.error("Dashboard data fetch error:", error);
        setError("ไม่สามารถโหลดข้อมูลแดชบอร์ดได้ กรุณาลองใหม่อีกครั้ง");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="w-full max-w-7xl mx-auto">
          <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="border shadow-lg">
                    <CardHeader>
                      <Skeleton className="h-6 w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-16 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 flex items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>เกิดข้อผิดพลาด</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="w-full max-w-7xl mx-auto">
        <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm pt-0">
          <CardHeader className="text-center pb-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-t-lg relative overflow-hidden py-4">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-indigo-500/20 to-purple-500/20"></div>
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>

            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-center justify-center mb-4">
                <Activity className="h-8 w-8 mr-3 drop-shadow-lg" />
                <CardTitle className="text-3xl font-bold drop-shadow-lg">
                  แดชบอร์ดผู้ดูแลระบบ
                </CardTitle>
              </div>
              <CardDescription className="text-blue-100 text-lg drop-shadow-sm">
                ภาพรวมการดำเนินงานและข้อมูลสำคัญของระบบ
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="p-8 space-y-8">
            {/* สถิติหลัก */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <TrendingUp className="h-6 w-6 mr-2 text-blue-600" />
                สถิติภาพรวม
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* จำนวนพนักงานทั้งหมด */}
                <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                  <CardContent className="p-6 text-center">
                    <div className="flex items-center justify-center mb-3">
                      <Users className="h-8 w-8" />
                    </div>
                    <div className="text-3xl font-bold mb-2">
                      {stats.employeeCount}
                    </div>
                    <div className="text-blue-100 text-sm">พนักงานทั้งหมด</div>
                    <div className="text-xs text-blue-200 mt-2">
                      ข้อมูลล่าสุด {new Date().toLocaleDateString("th-TH")}
                    </div>
                  </CardContent>
                </Card>

                {/* พนักงานที่มาวันนี้ */}
                <Card className="border-0 shadow-lg bg-gradient-to-r from-green-500 to-green-600 text-white">
                  <CardContent className="p-6 text-center">
                    <div className="flex items-center justify-center mb-3">
                      <CheckCircle className="h-8 w-8" />
                    </div>
                    <div className="text-3xl font-bold mb-2">
                      {stats?.todayStatus?.find((s) => s.label === "มา")
                        ?.count || 0}
                    </div>
                    <div className="text-green-100 text-sm">เข้างานวันนี้</div>
                    <div className="text-xs text-green-200 mt-2">
                      {new Date().toLocaleDateString("th-TH")}
                    </div>
                  </CardContent>
                </Card>

                {/* พนักงานที่ลาวันนี้ */}
                <Card className="border-0 shadow-lg bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
                  <CardContent className="p-6 text-center">
                    <div className="flex items-center justify-center mb-3">
                      <Calendar className="h-8 w-8" />
                    </div>
                    <div className="text-3xl font-bold mb-2">
                      {stats?.todayLeaves?.length || 0}
                    </div>
                    <div className="text-yellow-100 text-sm">ลาวันนี้</div>
                    <div className="text-xs text-yellow-200 mt-2">
                      รวมทุกประเภท
                    </div>
                  </CardContent>
                </Card>

                {/* ใบลารออนุมัติ */}
                <Card className="border-0 shadow-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                  <CardContent className="p-6 text-center">
                    <div className="flex items-center justify-center mb-3">
                      <FileText className="h-8 w-8" />
                    </div>
                    <div className="text-3xl font-bold mb-2">
                      {stats?.leaveRequests?.find(
                        (r) => r.label === "รออนุมัติ"
                      )?.count || 0}
                    </div>
                    <div className="text-orange-100 text-sm">รออนุมัติ</div>
                    <div className="text-xs text-orange-200 mt-2">
                      ต้องดำเนินการ
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* แผนภูมิและข้อมูลรายละเอียด */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* แผนภูมิ: สถานะเข้างานวันนี้ */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
                  <CardTitle className="text-lg flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-blue-600" />
                    สถานะเข้างานวันนี้
                  </CardTitle>
                  <CardDescription>
                    ข้อมูลสรุปพนักงานที่มาทำงาน ลา และขาดงานในวันนี้
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stats?.todayStatus}>
                      <XAxis dataKey="label" />
                      <YAxis />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <Legend />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {stats?.todayStatus.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* แผนภูมิ: ใบลาในระบบ */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg">
                  <CardTitle className="text-lg flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-purple-600" />
                    ข้อมูลรวมใบลา
                  </CardTitle>
                  <CardDescription>
                    ใบลาทั้งหมดในระบบ แบ่งตามสถานะการอนุมัติ
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stats?.leaveRequests}>
                      <XAxis dataKey="label" />
                      <YAxis />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <Legend />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {stats?.leaveRequests.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* รายชื่อพนักงานที่ลาวันนี้ */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-t-lg">
                <CardTitle className="text-lg flex items-center">
                  <User className="h-5 w-5 mr-2 text-teal-600" />
                  รายชื่อพนักงานที่ลาวันนี้
                </CardTitle>
                <CardDescription>
                  รายการและรายละเอียดพนักงานที่ลาในวันนี้
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {stats?.todayLeaves?.length > 0 ? (
                  <div className="space-y-4">
                    {stats.todayLeaves.map((emp, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                            {emp.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">
                              {emp.name}
                            </p>
                            <p className="text-sm text-gray-600 flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {emp.startDate === emp.endDate
                                ? new Date(emp.startDate).toLocaleDateString(
                                    "th-TH",
                                    {
                                      weekday: "long",
                                      day: "2-digit",
                                      month: "long",
                                    }
                                  )
                                : `${new Date(emp.startDate).toLocaleDateString(
                                    "th-TH"
                                  )} - ${new Date(
                                    emp.endDate
                                  ).toLocaleDateString("th-TH")}`}
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                          {emp.leaveType}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">ไม่มีพนักงานลาวันนี้</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
