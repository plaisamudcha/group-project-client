import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  PlusCircle,
  Calendar,
  User,
  TrendingUp,
  LogIn,
  LogOut,
  MapPin,
  Timer,
  Users,
  Building,
  Home,
} from "lucide-react";
import { useEffect, useState } from "react";
import employeeApi from "@/src/api/employeeApi";
import { Link } from "react-router";
import { translateLeaveType } from "@/lib/translateLeaveType";
import useUserStore from "@/src/stores/useUserStore";

export function DashboardPage() {
  const user = useUserStore((state) => state.user);
  const [dashboardData, setDashboardData] = useState({
    entitlements: [],
    requests: [],
    holidays: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [entitlementsRes, requestsRes, holidaysRes] = await Promise.all([
          employeeApi.getLeaveEntitlements(),
          employeeApi.getLeaveRequests(),
          employeeApi.getHolidays(),
        ]);

        setDashboardData({
          entitlements:
            entitlementsRes.data.entitlements || entitlementsRes.data,
          requests: (requestsRes.data.leavedata || requestsRes.data).slice(
            0,
            3
          ),
          holidays: (holidaysRes.data.holiday || holidaysRes.data)
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .filter((h) => new Date(h.date) >= new Date())
            .slice(0, 4),
        });

        // โหลดข้อมูลการเข้างานวันนี้
        if (user?.id) {
          const today = new Date();
          const currentMonth = today.getMonth() + 1;
          const currentYear = today.getFullYear();

          try {
            const attendanceRes = await employeeApi.getAttendance(
              user.id,
              currentMonth,
              currentYear
            );
            const todayAttendance = attendanceRes.data.attendances?.find(
              (att) => {
                const attDate = new Date(att.date);
                return attDate.toDateString() === today.toDateString();
              }
            );
            setAttendance(todayAttendance || null);
          } catch (attErr) {
            console.warn("ไม่สามารถโหลดข้อมูลการเข้างานได้:", attErr);
          }
        }
      } catch (err) {
        setError(
          err.response?.data?.message || "ไม่สามารถโหลดข้อมูลแดชบอร์ดได้"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.id]);

  const handleCheckIn = async () => {
    setIsCheckingIn(true);
    try {
      await employeeApi.clockIn();
      // รีเฟรชข้อมูลการเข้างาน
      const today = new Date();
      const currentMonth = today.getMonth() + 1;
      const currentYear = today.getFullYear();
      const attendanceRes = await employeeApi.getAttendance(
        user.id,
        currentMonth,
        currentYear
      );
      const todayAttendance = attendanceRes.data.attendances?.find((att) => {
        const attDate = new Date(att.date);
        return attDate.toDateString() === today.toDateString();
      });
      setAttendance(todayAttendance || null);

      // แสดงข้อความสำเร็จ
      alert("บันทึกเวลาเข้างานสำเร็จ!");
    } catch (err) {
      console.error("Check-in failed:", err);
      alert(
        "ไม่สามารถบันทึกเวลาเข้างานได้: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    setIsCheckingOut(true);
    try {
      await employeeApi.clockOut();
      // รีเฟรชข้อมูลการเข้างาน
      const today = new Date();
      const currentMonth = today.getMonth() + 1;
      const currentYear = today.getFullYear();
      const attendanceRes = await employeeApi.getAttendance(
        user.id,
        currentMonth,
        currentYear
      );
      const todayAttendance = attendanceRes.data.attendances?.find((att) => {
        const attDate = new Date(att.date);
        return attDate.toDateString() === today.toDateString();
      });
      setAttendance(todayAttendance || null);

      // แสดงข้อความสำเร็จ
      alert("บันทึกเวลาออกงานสำเร็จ!");
    } catch (err) {
      console.error("Check-out failed:", err);
      alert(
        "ไม่สามารถบันทึกเวลาออกงานได้: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setIsCheckingOut(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      APPROVED: "default",
      PENDING: "secondary",
      REJECTED: "destructive",
    };
    const icons = {
      APPROVED: <CheckCircle className="mr-1 h-3 w-3" />,
      PENDING: <Clock className="mr-1 h-3 w-3" />,
      REJECTED: <XCircle className="mr-1 h-3 w-3" />,
    };
    const colors = {
      APPROVED: "bg-green-100 text-green-800 border-green-200",
      PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
      REJECTED: "bg-red-100 text-red-800 border-red-200",
    };

    const statusText = {
      APPROVED: "อนุมัติ",
      PENDING: "รอพิจารณา",
      REJECTED: "ไม่อนุมัติ",
    };

    return (
      <Badge variant={variants[status] || "outline"} className={colors[status]}>
        {icons[status]}
        {statusText[status] || status}
      </Badge>
    );
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString("th-TH", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 p-6">
        <div className="w-full max-w-7xl mx-auto">
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center">
              <Skeleton className="h-10 w-1/3 mx-auto mb-2" />
              <Skeleton className="h-4 w-1/2 mx-auto" />
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-40 w-full" />
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="h-72 w-full" />
                <Skeleton className="h-72 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 p-6">
        <div className="w-full max-w-7xl mx-auto">
          <Alert variant="destructive" className="border-red-200 shadow-lg">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>เกิดข้อผิดพลาด!</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 p-6">
      <div className="w-full max-w-7xl mx-auto">
        <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-8 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-t-lg">
            <div className="flex items-center justify-center mb-4">
              <Home className="h-8 w-8 mr-3" />
              <CardTitle className="text-3xl font-bold">แดชบอร์ด</CardTitle>
            </div>
            <CardDescription className="text-indigo-100 text-lg">
              ยินดีต้อนรับ {user?.firstName} {user?.lastName} -
              ภาพรวมการทำงานและการลาของคุณ
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8">
            {/* ข้อมูลพนักงานและเวลา */}
            <div className="mb-8 p-6 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ข้อมูลพนักงาน */}
                <div>
                  <h3 className="text-lg font-semibold text-indigo-800 mb-4 flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    ข้อมูลพนักงาน
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <Badge
                        variant="outline"
                        className="bg-white text-indigo-700 border-indigo-300"
                      >
                        <Users className="h-4 w-4 mr-1" />
                        {user?.department || "ไม่ระบุแผนก"}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge
                        variant="outline"
                        className="bg-white text-indigo-700 border-indigo-300"
                      >
                        <Building className="h-4 w-4 mr-1" />
                        {user?.position || user?.role || "ไม่ระบุตำแหน่ง"}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* เวลาปัจจุบันและการเข้างาน */}
                <div>
                  <h3 className="text-lg font-semibold text-indigo-800 mb-4 flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    เวลาปัจจุบัน
                  </h3>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-700">
                      {getCurrentTime()}
                    </div>
                    <div className="text-sm text-indigo-600">
                      {getCurrentDate()}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ปุ่ม Check-in/Check-out */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                <Timer className="h-5 w-5 mr-2 text-indigo-600" />
                บันทึกเวลาทำงาน
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Check-in Card */}
                <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
                  <CardContent className="p-6 text-center">
                    <LogIn className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-green-800 mb-2">
                      เข้างาน
                    </h4>
                    {attendance?.clockIn ? (
                      <div>
                        <p className="text-green-600 mb-2">เข้างานแล้วเมื่อ</p>
                        <Badge className="bg-green-100 text-green-800 text-lg px-4 py-2">
                          {attendance.clockIn}
                        </Badge>
                      </div>
                    ) : (
                      <>
                        <p className="text-gray-600 mb-4">บันทึกเวลาเข้างาน</p>
                        <Button
                          onClick={handleCheckIn}
                          disabled={isCheckingIn}
                          className="w-full bg-green-600 hover:bg-green-700 text-white"
                        >
                          {isCheckingIn ? (
                            <>
                              <Clock className="h-4 w-4 mr-2 animate-spin" />
                              กำลังบันทึก...
                            </>
                          ) : (
                            <>
                              <LogIn className="h-4 w-4 mr-2" />
                              เข้างาน
                            </>
                          )}
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Check-out Card */}
                <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-pink-50">
                  <CardContent className="p-6 text-center">
                    <LogOut className="h-12 w-12 text-red-600 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-red-800 mb-2">
                      ออกงาน
                    </h4>
                    {attendance?.clockOut ? (
                      <div>
                        <p className="text-red-600 mb-2">ออกงานแล้วเมื่อ</p>
                        <Badge className="bg-red-100 text-red-800 text-lg px-4 py-2">
                          {attendance.clockOut}
                        </Badge>
                      </div>
                    ) : (
                      <>
                        <p className="text-gray-600 mb-4">บันทึกเวลาออกงาน</p>
                        <Button
                          onClick={handleCheckOut}
                          disabled={isCheckingOut || !attendance?.clockIn}
                          className="w-full bg-red-600 hover:bg-red-700 text-white disabled:bg-gray-300"
                        >
                          {isCheckingOut ? (
                            <>
                              <Clock className="h-4 w-4 mr-2 animate-spin" />
                              กำลังบันทึก...
                            </>
                          ) : (
                            <>
                              <LogOut className="h-4 w-4 mr-2" />
                              ออกงาน
                            </>
                          )}
                        </Button>
                        {!attendance?.clockIn && (
                          <p className="text-xs text-gray-500 mt-2">
                            ต้องเข้างานก่อนจึงจะออกงานได้
                          </p>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* สถานะการทำงานวันนี้ */}
              {attendance && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    สถานะการทำงานวันนี้
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-sm text-blue-600">เวลาเข้า</p>
                      <p className="font-bold text-blue-800">
                        {attendance.clockIn || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-600">เวลาออก</p>
                      <p className="font-bold text-blue-800">
                        {attendance.clockOut || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-600">ชั่วโมงทำงาน</p>
                      <p className="font-bold text-blue-800">
                        {attendance.totalHours?.toFixed(2) || "0"} ชม.
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-600">สถานะ</p>
                      <Badge
                        className={`${
                          attendance.isLate
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {attendance.isLate
                          ? `มาสาย ${attendance.lateMinutes} นาที`
                          : "ปกติ"}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ภาพรวมวันลา */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold tracking-tight mb-6 flex items-center">
                <Calendar className="h-6 w-6 mr-2 text-indigo-600" />
                ภาพรวมวันลา
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {dashboardData.entitlements.map((item, index) => {
                  const total = item.entitledDays;
                  const used = item.usedDays || 0;
                  const remaining = total - used;
                  const percentage = total > 0 ? (used / total) * 100 : 0;

                  return (
                    <Card
                      key={index}
                      className="hover:shadow-lg transition-shadow border-l-4 border-l-indigo-500"
                    >
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium text-gray-800">
                          {translateLeaveType(item.leaveType)?.th ||
                            item.leaveType}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold text-indigo-600">
                          {remaining}
                          <span className="text-lg font-normal text-gray-500">
                            {" "}
                            / {total} วัน
                          </span>
                        </p>
                        <Progress value={percentage} className="mt-3 h-2" />
                        <p className="text-xs text-gray-500 mt-2">
                          ใช้ไปแล้ว {used} วัน ({percentage.toFixed(1)}%)
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* ประวัติการลาและวันหยุด */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Leave Requests */}
              <Card className="border-l-4 border-l-green-500 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <PlusCircle className="h-5 w-5 mr-2 text-green-600" />
                      ประวัติการลาล่าสุด
                    </CardTitle>
                    <CardDescription>
                      แสดงรายการใบลาล่าสุด 3 รายการ
                    </CardDescription>
                  </div>
                  <Button asChild className="bg-green-600 hover:bg-green-700">
                    <Link to="/employee/request-leave">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      ยื่นใบลา
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ประเภท</TableHead>
                        <TableHead>วันที่</TableHead>
                        <TableHead className="text-right">สถานะ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dashboardData.requests.length > 0 ? (
                        dashboardData.requests.map((req) => (
                          <TableRow key={req.id} className="hover:bg-gray-50">
                            <TableCell className="font-medium">
                              {translateLeaveType(req.leaveType)?.th ||
                                req.leaveType}
                            </TableCell>
                            <TableCell>
                              {new Date(req.startDate).toLocaleDateString(
                                "th-TH",
                                {
                                  day: "2-digit",
                                  month: "short",
                                }
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {getStatusBadge(req.status)}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={3}
                            className="text-center h-24 text-gray-500"
                          >
                            ไม่พบข้อมูลใบลา
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full border-green-200 text-green-700 hover:bg-green-50"
                    asChild
                  >
                    <Link to="/employee/leave-requests">ดูประวัติทั้งหมด</Link>
                  </Button>
                </CardFooter>
              </Card>

              {/* Upcoming Holidays */}
              <Card className="border-l-4 border-l-blue-500 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                    วันหยุดที่ใกล้จะถึง
                  </CardTitle>
                  <CardDescription>
                    แสดงรายการวันหยุดที่กำลังจะมาถึง
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {dashboardData.holidays.length > 0 ? (
                    dashboardData.holidays.map((holiday, index) => (
                      <div
                        key={index}
                        className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <div className="flex flex-col items-center justify-center bg-blue-200 text-blue-800 rounded-lg h-14 w-14 mr-4">
                          <span className="text-xs font-medium">
                            {new Date(holiday.date).toLocaleString("th-TH", {
                              month: "short",
                            })}
                          </span>
                          <span className="text-xl font-bold">
                            {new Date(holiday.date).getDate()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-blue-900">
                            {holiday.name}
                          </p>
                          <p className="text-sm text-blue-700">
                            {new Date(holiday.date).toLocaleDateString(
                              "th-TH",
                              {
                                weekday: "long",
                              }
                            )}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">ไม่มีวันหยุดที่ใกล้จะถึง</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
                    asChild
                  >
                    <Link to="/employee/holidays">ดูวันหยุดทั้งหมด</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default DashboardPage;
