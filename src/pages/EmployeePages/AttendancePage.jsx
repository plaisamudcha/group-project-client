import dayjs from "dayjs";
import { AttendanceTable } from "@/src/components/attendance-table";
import { useEffect, useState } from "react";
import employeeApi from "@/src/api/employeeApi";
import { useNavigate } from "react-router";
import useUserStore from "@/src/stores/useUserStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  User,
  Building,
  MapPin,
  TrendingUp,
  Download,
  Filter,
} from "lucide-react";

// --- ฟังก์ชันแปลงชั่วโมงทศนิยมเป็นชั่วโมง:นาที ---
// เช่น 8.5 → "8:30", 9.25 → "9:15"
function toHourMinute(decimalHour) {
  if (typeof decimalHour !== "number" || isNaN(decimalHour) || decimalHour <= 0)
    return "0:00";
  const hour = Math.floor(decimalHour);
  const min = Math.round((decimalHour - hour) * 60);
  return `${hour}:${min.toString().padStart(2, "0")}`;
}
function statusToSummary(status, att) {
  switch (status) {
    case "PENDING":
      return "รอประมวลผล";
    case "ABSENT":
      return "ขาดงาน";
    case "ON_LEAVE":
      return "ลา";
    case "COMPLETED":
      if (att?.isLate) return "มาสาย";
      return "ปกติ";
    case "INCOMPLETED":
      return "ยังไม่ครบวัน";
    default:
      return "-";
  }
}
// --- ฟังก์ชันคำนวณส่วนต่างชั่วโมงทำงาน ---
// เช่น "08:30" - "17:30" → "-9.00",
function calcHourDiff(start, end) {
  if (!start || !end) return "-";
  // start, end รูปแบบ "08:30", "17:30"
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let diff = eh * 60 + em - (sh * 60 + sm); // นาที
  if (diff < 0) diff += 24 * 60; // ข้ามวัน (ไม่น่าเจอ)
  return (diff / 60).toFixed(2);
}
// --- ฟังก์ชันรวม Attendance + Holiday + Row เรียกใช้เริ่มตั้งแต่วันแรกที่เข้าทำงาน ---
function buildAttendanceRows({
  attendances,
  holidays,
  year,
  month,
  userName = "",
  department = "-",
  position = "-",
  checkinPlan = "-",
  checkoutPlan = "-",
  workPlanHour = "-",
}) {
  const attendanceDates = attendances.map((att) => att.date);
  const monthStart = dayjs(`${year}-${String(month + 1).padStart(2, "0")}-01`);
  const monthEnd = monthStart.endOf("month");
  const today = dayjs();

  // หา firstWorkDate ตาม logic เดิม
  const firstWorkDate =
    attendanceDates.length > 0
      ? attendanceDates.reduce((min, curr) => (curr < min ? curr : min))
      : null;

  // ข้ามเดือนที่ยังไม่เริ่มงาน
  if (firstWorkDate && dayjs(firstWorkDate).isAfter(monthEnd)) return [];
  let startDay = monthStart;
  if (firstWorkDate && dayjs(firstWorkDate).isAfter(monthStart)) {
    startDay = dayjs(firstWorkDate);
  }

  // *** set endDay ให้เป็น min(monthEnd, today)
  let endDay = monthEnd;
  if (
    today.isBefore(monthEnd, "day") &&
    today.isAfter(monthStart.subtract(1, "day"))
  ) {
    endDay = today;
  }

  // gen days เฉพาะที่ <= endDay
  const days = [];
  for (let d = startDay; !d.isAfter(endDay, "day"); d = d.add(1, "day")) {
    days.push(d.format("YYYY-MM-DD"));
  }

  const attMap = {};
  attendances.forEach((att) => (attMap[att.date] = att));
  const holidayMap = {};
  holidays.forEach((h) => (holidayMap[h.date] = h.name));

  return days.map((date) => {
    const d = dayjs(date);
    const weekday = d.format("dd");
    const displayDate = d.format("DD/MM/YY") + " " + weekday;
    const isWeekend = [0, 6].includes(d.day());
    const holidayName = holidayMap[date];
    const att = attMap[date];
    const hasClockIn = att?.clockIn && att.clockIn !== "";
    const hasClockOut = att?.clockOut && att.clockOut !== "";

    // กำหนด summary
    let summary = "";
    if (holidayName) summary = holidayName;
    else if (isWeekend) summary = "วันหยุด";
    else if (!att) summary = "ขาดงาน";
    else summary = statusToSummary(att.status, att);

    let workDiff = "-";
    let workActual = "0:00";

    if (
      att &&
      !att.isAbsent &&
      hasClockIn &&
      hasClockOut &&
      workPlanHour !== "-" &&
      !isNaN(Number(att.totalHours)) &&
      !isNaN(Number(workPlanHour))
    ) {
      // กรณีมีเวลาเข้า-ออกครบ (และไม่ขาดงาน)
      const diff = parseFloat(att.totalHours) - parseFloat(workPlanHour);
      workDiff = diff > 0 ? toHourMinute(diff) : "0:00";
      workActual = toHourMinute(att.totalHours);
    } else if (
      att &&
      !att.isAbsent &&
      (hasClockIn || hasClockOut) &&
      !isNaN(Number(att.totalHours))
    ) {
      // กรณีมี clockin หรือ clockout ฝั่งเดียว (ถือว่ายังไม่จบวัน/Incomplete)
      workActual = toHourMinute(att.totalHours);
      workDiff = "-";
    }
    // ถ้าขาดงาน หรือไม่มี attendance, workDiff = "-" แล้วตามค่า default

    return {
      name: userName,
      department,
      position,
      date: displayDate,
      checkin_plan: checkinPlan,
      checkin_actual: att?.clockIn || "",
      checkin_note: att?.isLate ? `มาสาย ${att.lateMinutes} นาที` : "",
      checkout_plan: checkoutPlan,
      checkout_actual: att?.clockOut || "",
      checkout_note: "",
      work_plan: workPlanHour,
      work_actual: workActual,
      work_diff: workDiff,
      summary,
    };
  });
} // ------- [Comment] แก้ไข: ปิด function buildAttendanceRows ตรงนี้ (mock data ต้องอยู่นอก function นี้)

// ------- [Comment] แก้ไข: ส่วนนี้ ย้ายออกมาอยู่นอก buildAttendanceRows -----

// --- กำหนดเดือนและปีปัจจุบัน ---
const months = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];
const currentMonth = dayjs().month(); // 0-11
const currentYear = dayjs().year();
const years = [];
for (let y = currentYear - 5; y <= currentYear + 2; y++) {
  years.push(y);
}

// --- หน้าหลัก ---
function AttendancePage() {
  const user = useUserStore((state) => state.user);
  const [profile, setProfile] = useState(null);

  const userId = user?.id;
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const accessToken = useUserStore((state) => state.accessToken);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [holidays, setHolidays] = useState([]);

  async function fetchAllholiday() {
    const res = await employeeApi.fetchAllholiday(
      selectedMonth + 1,
      selectedYear
    );
    setHolidays(res.data.holiday);
    return res.data.holiday || [];
  }

  useEffect(() => {
    fetchAllholiday();

    if (user?.id) {
      employeeApi
        .getMyProfile(user.id)
        .then((res) => setProfile(res.data.employeeProfile || res.data))
        .catch(() => setProfile(null));
    }
    if (!user || !accessToken) {
      navigate("/login");
    }
    if (!userId) return;
    setLoading(true);
    employeeApi
      .getAttendance(userId, selectedMonth + 1, selectedYear)
      .then((res) => {
        setAttendances(res.data.attendances || []);
      })
      .catch((err) => {
        console.error("Error fetching attendance:", err);
        setAttendances([]);
      })
      .finally(() => setLoading(false));
  }, [selectedMonth, selectedYear, user, accessToken, navigate, user?.id]);

  let checkinPlan = "-";
  let checkoutPlan = "-";
  let workPlanHour = "-";
  if (profile) {
    if (profile.shift) {
      checkinPlan = profile.shift.inTime;
      checkoutPlan = profile.shift.outTime;
    } else if (profile.workPolicy) {
      checkinPlan = profile.workPolicy.startTime;
      checkoutPlan = profile.workPolicy.endTime;
    }
    workPlanHour = calcHourDiff(checkinPlan, checkoutPlan);
  }

  // สร้างข้อมูลสำหรับตาราง
  // ใช้ข้อมูลจาก attendance response ถ้ามี ไม่งั้นใช้จาก user store
  const userFromAttendance =
    attendances.length > 0 ? attendances[0].user : null;
  const displayName = userFromAttendance
    ? `${userFromAttendance.firstName} ${userFromAttendance.lastName}`
    : user
    ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.name || ""
    : "";

  const data = buildAttendanceRows({
    attendances,
    holidays,
    year: selectedYear,
    month: selectedMonth,
    userName: displayName,
    department: user?.department || "-",
    position: user?.position || user?.role || "-",
    checkinPlan,
    checkoutPlan,
    workPlanHour,
  });

  // คำนวณสถิติการทำงาน
  const calculateStats = () => {
    const workDays = data.filter(
      (row) =>
        !row.summary.includes("วันหยุด") &&
        !row.summary.includes("วันลา") &&
        row.summary !== "ขาดงาน"
    );

    const lateDays = data.filter((row) => row.summary === "มาสาย").length;
    const absentDays = data.filter((row) => row.summary === "ขาดงาน").length;
    const normalDays = workDays.filter((row) => row.summary === "ปกติ").length;
    const incompleteDays = data.filter(
      (row) => row.summary === "ยังไม่ครบวัน"
    ).length;

    // คำนวณเวลาทำงานรวม
    const totalWorkHours = data.reduce((sum, row) => {
      if (row.work_actual && row.work_actual !== "0:00") {
        const [hours, minutes] = row.work_actual.split(":").map(Number);
        return sum + hours + minutes / 60;
      }
      return sum;
    }, 0);

    return {
      totalDays: data.length,
      workDays: workDays.length,
      normalDays,
      lateDays,
      absentDays,
      incompleteDays,
      totalWorkHours: totalWorkHours.toFixed(1),
      attendanceRate:
        workDays.length > 0
          ? (((normalDays + lateDays) / workDays.length) * 100).toFixed(1)
          : 0,
    };
  };

  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 p-6">
      <div className="w-full max-w-7xl mx-auto">
        <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm pt-0">
          <CardHeader className="text-center pb-8 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-t-lg py-4">
            <div className="flex items-center justify-center mb-4">
              <Clock className="h-8 w-8 mr-3" />
              <CardTitle className="text-3xl font-bold">
                ตารางบันทึกเวลาทำงาน
              </CardTitle>
            </div>
            <CardDescription className="text-teal-100 text-lg">
              ติดตามและจัดการเวลาทำงานของคุณ พร้อมสถิติการเข้างาน
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8">
            {/* ข้อมูลพนักงาน */}
            <div className="mb-8 p-6 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg border border-teal-200">
              <h3 className="text-lg font-semibold text-teal-800 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2" />
                ข้อมูลพนักงาน
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3">
                  <Badge
                    variant="outline"
                    className="bg-white text-teal-700 border-teal-300"
                  >
                    <User className="h-4 w-4 mr-1" />
                    {userFromAttendance
                      ? `${userFromAttendance.firstName} ${userFromAttendance.lastName}`
                      : user?.firstName && user?.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user?.name || "ไม่ระบุชื่อ"}
                  </Badge>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge
                    variant="outline"
                    className="bg-white text-teal-700 border-teal-300"
                  >
                    <Building className="h-4 w-4 mr-1" />
                    {user?.department || "ไม่ระบุแผนก"}
                  </Badge>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge
                    variant="outline"
                    className="bg-white text-teal-700 border-teal-300"
                  >
                    <MapPin className="h-4 w-4 mr-1" />
                    {user?.position || user?.role || "ไม่ระบุตำแหน่ง"}
                  </Badge>
                </div>
              </div>

              {/* เวลาทำงาน */}
              {profile && (
                <div className="mt-4 pt-4 border-t border-teal-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-teal-600">
                        เวลาเข้างาน:
                      </span>
                      <Badge className="bg-teal-100 text-teal-800">
                        {checkinPlan}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-teal-600">เวลาออกงาน:</span>
                      <Badge className="bg-teal-100 text-teal-800">
                        {checkoutPlan}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-teal-600">
                        ชั่วโมงทำงาน:
                      </span>
                      <Badge className="bg-teal-100 text-teal-800">
                        {workPlanHour} ชม.
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* สถิติการทำงาน */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-teal-600" />
                สถิติการทำงานประจำเดือน
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold">{stats.totalDays}</div>
                  <div className="text-sm text-blue-100">วันทั้งหมด</div>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold">{stats.normalDays}</div>
                  <div className="text-sm text-green-100">วันปกติ</div>
                </div>

                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold">{stats.lateDays}</div>
                  <div className="text-sm text-yellow-100">วันมาสาย</div>
                </div>

                <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold">{stats.absentDays}</div>
                  <div className="text-sm text-red-100">วันขาดงาน</div>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold">
                    {stats.totalWorkHours}
                  </div>
                  <div className="text-sm text-purple-100">ชม.ทำงาน</div>
                </div>

                <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold">
                    {stats.attendanceRate}%
                  </div>
                  <div className="text-sm text-teal-100">อัตราเข้างาน</div>
                </div>
              </div>
            </div>

            {/* ตัวกรองและเครื่องมือ */}
            <div className="mb-8 p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                  <div className="flex items-center gap-2">
                    <Filter className="h-5 w-5 text-gray-600" />
                    <span className="font-medium text-gray-700">
                      กรองข้อมูล:
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-teal-600" />
                    <span className="text-sm text-gray-600">เดือน:</span>
                    <Select
                      value={selectedMonth.toString()}
                      onValueChange={(v) => setSelectedMonth(Number(v))}
                    >
                      <SelectTrigger className="w-[140px] border-teal-200 focus:border-teal-400">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((m, i) => (
                          <SelectItem key={i} value={i.toString()}>
                            {m}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-teal-600" />
                    <span className="text-sm text-gray-600">ปี:</span>
                    <Select
                      value={selectedYear.toString()}
                      onValueChange={(v) => setSelectedYear(Number(v))}
                    >
                      <SelectTrigger className="w-[100px] border-teal-200 focus:border-teal-400">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((y) => (
                          <SelectItem key={y} value={y.toString()}>
                            {y + 543}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="border-teal-300 text-teal-700 hover:bg-teal-50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  ส่งออกรายงาน
                </Button>
              </div>
            </div>

            {/* ตารางข้อมูล */}
            <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm bg-white">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
                </div>
              ) : (
                <AttendanceTable data={data} />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AttendancePage;
