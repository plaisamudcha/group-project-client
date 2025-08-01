import dayjs from "dayjs";
import { AttendanceTable } from "@/src/components/attendance-table";
import { useEffect, useState } from "react";

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
  position = "-"
}) {
  // หา "วันแรกที่มี attendance"
  const attendanceDates = attendances.map(att => att.date);
  const firstWorkDate = attendanceDates.length > 0
    ? attendanceDates.reduce((min, curr) => (curr < min ? curr : min))
    : `${year}-${String(month + 1).padStart(2, "0")}-01`;

  // วันที่เริ่ม = firstWorkDate, สิ้นสุด = สิ้นเดือน
  const startDay = dayjs(firstWorkDate);
  const endDay = dayjs(`${year}-${month + 1}-01`).endOf("month");
  const days = [];
  for (let d = startDay; !d.isAfter(endDay, "day"); d = d.add(1, "day")) {
    days.push(d.format("YYYY-MM-DD"));
  }

  // map เดิม
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

    let summary = "";
    if (holidayName) summary = holidayName;
    else if (isWeekend) summary = "วันหยุด";
    else if (!att) summary = "ขาดงาน";
    else if (att.isAbsent) summary = "ขาดงาน";
    else if (att.isLate) summary = "มาสาย";
    else summary = "ปกติ";

    const workDiff = att
      ? `${att.totalHours < 8 ? "-" : ""}${Math.abs(8 - att.totalHours).toFixed(2)}`
      : "-08:00";

    return {
      name: userName,
      department,
      position,
      date: displayDate,
      checkin_plan: "08:00",
      checkin_actual: att?.clockIn || "",
      checkin_note: att?.isLate ? `มาสาย ${att.lateMinutes} นาที` : "",
      checkout_plan: "17:00",
      checkout_actual: att?.clockOut || "",
      checkout_note: "",
      work_plan: "08:00",
      work_actual: att ? att.totalHours.toFixed(2) : "00:00",
      work_diff: att ? workDiff : "-08:00",
      summary,
    };
  });
}



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


// --- mock ข้อมูล attendance และ holiday ---
const attendances = [
  {
    id: 2,
    userId: 8,
    date: "2025-07-30",
    clockIn: "08:22",
    clockOut: "17:30",
    isLate: false,
    lateMinutes: 0,
    isAbsent: false,
    totalHours: 9.08,
    overtimeHours: 0,
    status: "COMPLETED",
    workPolicyId: 1,
    shiftId: null
  },
  {
    id: 3,
    userId: 8,
    date: "2025-07-29",
    clockIn: "08:25",
    clockOut: "17:35",
    isLate: false,
    lateMinutes: 0,
    isAbsent: false,
    totalHours: 9.1,
    overtimeHours: 5,
    status: "COMPLETED",
    workPolicyId: 1,
    shiftId: null
  },
  {
    id: 4,
    userId: 8,
    date: "2025-07-28",
    clockIn: "08:27",
    clockOut: "17:30",
    isLate: false,
    lateMinutes: 0,
    isAbsent: false,
    totalHours: 9.03,
    overtimeHours: 0,
    status: "COMPLETED",
    workPolicyId: 1,
    shiftId: null
  },
  {
    id: 5,
    userId: 8,
    date: "2025-07-25",
    clockIn: "08:29",
    clockOut: "17:30",
    isLate: false,
    lateMinutes: 0,
    isAbsent: false,
    totalHours: 9.01,
    overtimeHours: 0,
    status: "COMPLETED",
    workPolicyId: 1,
    shiftId: null
  },
  {
    id: 6,
    userId: 8,
    date: "2025-07-24",
    clockIn: "08:21",
    clockOut: "17:30",
    isLate: false,
    lateMinutes: 0,
    isAbsent: false,
    totalHours: 9.09,
    overtimeHours: 0,
    status: "COMPLETED",
    workPolicyId: 1,
    shiftId: null
  },
  {
    id: 7,
    userId: 8,
    date: "2025-07-23",
    clockIn: "08:22",
    clockOut: "17:30",
    isLate: false,
    lateMinutes: 0,
    isAbsent: false,
    totalHours: 9.08,
    overtimeHours: 0,
    status: "COMPLETED",
    workPolicyId: 1,
    shiftId: null
  },
  {
    id: 8,
    userId: 8,
    date: "2025-07-22",
    clockIn: "08:35",
    clockOut: "17:30",
    isLate: true,
    lateMinutes: 5,
    isAbsent: false,
    totalHours: 8.55,
    overtimeHours: 0,
    status: "COMPLETED",
    workPolicyId: 1,
    shiftId: null
  }
];

const holidays = [
  { date: "2025-07-20", name: "วันอาสาฬหบูชา" },
  { date: "2025-07-21", name: "วันเข้าพรรษา" }
];

// --- Gen ข้อมูล row ---
const data = buildAttendanceRows({
  attendances,
  holidays,
  year: 2025,
  month: 6, // กรกฎาคม = 6 (0-based)
  userName: "Persis",
  department: "-",
  position: "-"
});

// --- หน้าหลัก ---
function AttendancePage() {
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const data = buildAttendanceRows({
    attendances,
    holidays,
    year: selectedYear,
    month: selectedMonth,
    userName: "Persis",
    department: "-",
    position: "-"
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
