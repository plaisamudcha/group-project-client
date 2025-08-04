import dayjs from "dayjs";
import { AttendanceTable } from "@/src/components/attendance-table";
import { useEffect, useState } from "react";
import employeeApi from "@/src/api/employeeApi";
import { useNavigate } from "react-router";
import useUserStore from "@/src/stores/useUserStore";
import fetchAllholiday from "@/src/api/employeeApi";

// --- ฟังก์ชันแปลงชั่วโมงทศนิยมเป็นชั่วโมง:นาที ---
// เช่น 8.5 → "8:30", 9.25 → "9:15"
function toHourMinute(decimalHour) {
  if (typeof decimalHour !== "number" || isNaN(decimalHour) || decimalHour <= 0) return "0:00";
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
  let diff = (eh * 60 + em) - (sh * 60 + sm); // นาที
  if (diff < 0) diff += 24 * 60; // ข้ามวัน (ไม่น่าเจอ)
  return (diff / 60).toFixed(2);
}
// --- ฟังก์ชันสร้างวันที่ในเดือน ---
function generateDaysOfMonth(year, month) {
  const days = [];
  const daysInMonth = dayjs(`${year}-${month + 1}-01`).daysInMonth();
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(dayjs(`${year}-${month + 1}-${d}`).format("YYYY-MM-DD"));
  }
  return days;
}

// --- ฟังก์ชันรวม Attendance + Holiday + Row  เรียกใช้เริ่มตั้งแต่วันที่ 1 ของเดือน ---
// function buildAttendanceRows({
//   attendances,
//   holidays,
//   year,
//   month,
//   userName = "",
//   department = "-",
//   position = "-",
// }) {
//   const days = generateDaysOfMonth(year, month);

//   // Attendance map
//   const attMap = {};
//   attendances.forEach(att => attMap[att.date] = att);

//   // Holiday map
//   const holidayMap = {};
//   holidays.forEach(h => holidayMap[h.date] = h.name);

//   return days.map(date => {
//     const d = dayjs(date);
//     const weekday = d.format("dd"); // เช่น 'จ.' (Mon), 'อ.' (Tue)
//     const displayDate = d.format("DD/MM/YY") + " " + weekday;

//     const isWeekend = [0, 6].includes(d.day());
//     const holidayName = holidayMap[date];

//     const att = attMap[date];

//     let summary = "";
//     if (holidayName) summary = holidayName;
//     else if (isWeekend) summary = "วันหยุด";
//     else if (!att) summary = "ขาดงาน";
//     else if (att.isAbsent) summary = "ขาดงาน";
//     else if (att.isLate) summary = "มาสาย";
//     else summary = "ปกติ";

//     // เวลาทำงาน
//     const workPlan = "08:00";
//     const workDiff = att
//       ? `${att.totalHours < 8 ? "-" : ""}${Math.abs(8 - att.totalHours).toFixed(2)}`
//       : "-08:00";

//     return {
//       name: userName,
//       department,
//       position,
//       date: displayDate,
//       checkin_plan: "08:00",
//       checkin_actual: att?.clockIn || "",
//       checkin_note: att?.isLate ? `มาสาย ${att.lateMinutes} นาที` : "",
//       checkout_plan: "17:00",
//       checkout_actual: att?.clockOut || "",
//       checkout_note: "",
//       work_plan: "08:00",
//       work_actual: att ? att.totalHours.toFixed(2) : "00:00",
//       work_diff: att ? workDiff : "-08:00",
//       summary,
//     };
//   });
// }

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
  const attendanceDates = attendances.map(att => att.date);
  const monthStart = dayjs(`${year}-${String(month + 1).padStart(2, "0")}-01`);
  const monthEnd = monthStart.endOf("month");
  const today = dayjs();

  // หา firstWorkDate ตาม logic เดิม
  const firstWorkDate = attendanceDates.length > 0
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
  if (today.isBefore(monthEnd, "day") && today.isAfter(monthStart.subtract(1, "day"))) {
    endDay = today;
  }

  // gen days เฉพาะที่ <= endDay
  const days = [];
  for (let d = startDay; !d.isAfter(endDay, "day"); d = d.add(1, "day")) {
    days.push(d.format("YYYY-MM-DD"));
  }

  const attMap = {};
  attendances.forEach(att => attMap[att.date] = att);
  const holidayMap = {};
  holidays.forEach(h => holidayMap[h.date] = h.name);

  return days.map(date => {
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

    if (att && !att.isAbsent && hasClockIn && hasClockOut && workPlanHour !== "-" && !isNaN(Number(att.totalHours)) && !isNaN(Number(workPlanHour))) {
      // กรณีมีเวลาเข้า-ออกครบ (และไม่ขาดงาน)
      const diff = parseFloat(att.totalHours) - parseFloat(workPlanHour);
      workDiff = diff > 0 ? toHourMinute(diff) : "0:00";
      workActual = toHourMinute(att.totalHours);
    } else if (att && !att.isAbsent && (hasClockIn || hasClockOut) && !isNaN(Number(att.totalHours))) {
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
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
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
    const res = await employeeApi.fetchAllholiday(selectedMonth + 1, selectedYear); 
    setHolidays(res.data.holiday);
    return res.data.holiday || [];
  }


  useEffect(() => {
    fetchAllholiday()

    if (user?.id) {
      employeeApi.getMyProfile(user.id)
        .then(res => setProfile(res.data.employeeProfile || res.data))
        .catch(() => setProfile(null));
    }
    if (!user || !accessToken) {
      navigate("/login");
    }
    if (!userId) return;
    setLoading(true);
    employeeApi.getAttendance(userId, selectedMonth + 1, selectedYear)
      .then(res => {
        setAttendances(res.data.attendances || []);
      })
      .catch(err => {
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
  // --- Gen ข้อมูล row ---
  const data = buildAttendanceRows({
    attendances,
    holidays: holidays || [],
    year: selectedYear,
    month: selectedMonth,
    userName: user?.name || "-",
    department: user?.department || "-",
    position: user?.role || "-",
    checkinPlan,
    checkoutPlan,
    workPlanHour,
  });

  return (
    <div className="w-full px-2 sm:px-8 py-4 sm:py-8">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-6 flex flex-col gap-4">
          <span className="text-xl font-bold text-[#30384d]">
            ตารางบันทึกเวลาทำงาน (Attendance)
          </span>
          <div className="flex gap-2 items-center">
            <span>เลือกเดือน</span>
            <select
              className="border rounded px-2 py-1"
              value={selectedMonth}
              onChange={e => setSelectedMonth(Number(e.target.value))}
            >
              {months.map((m, i) => (
                <option key={i} value={i}>{m}</option>
              ))}
            </select>
            <span>ปี</span>
            <select
              className="border rounded px-2 py-1"
              value={selectedYear}
              onChange={e => setSelectedYear(Number(e.target.value))}
            >
              {years.map((y) => (
                <option key={y} value={y}>{y + 543}</option>
              ))}
            </select>
          </div>
        </div>
        <AttendanceTable data={data} />
      </div>
    </div>
  );
}

export default AttendancePage;
