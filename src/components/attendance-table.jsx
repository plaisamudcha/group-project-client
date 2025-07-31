import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function AttendanceTable({ data }) {
  return (
    <div className="overflow-x-auto w-full">
      <Table className="min-w-[900px]">
        <TableHeader>
          {/* หัวตารางชั้นบน (หมวดหมู่) */}
          <TableRow>
            <TableHead rowSpan={2} className="text-center bg-gray-50 border border-gray-300">ชื่อ</TableHead>
            <TableHead rowSpan={2} className="text-center bg-gray-50 border border-gray-300">แผนก</TableHead>
            <TableHead rowSpan={2} className="text-center bg-gray-50 border border-gray-300">ตำแหน่ง</TableHead>
            <TableHead rowSpan={2} className="text-center bg-gray-50 border border-gray-300">วันที่</TableHead>

            <TableHead colSpan={3} className="text-center bg-blue-100 border border-gray-300">เข้างาน</TableHead>
            <TableHead colSpan={3} className="text-center bg-green-100 border border-gray-300">ออกงาน</TableHead>
            <TableHead colSpan={3} className="text-center bg-purple-100 border border-gray-300">ระยะเวลาการทำงาน</TableHead>
            <TableHead rowSpan={2} className="text-center bg-gray-50 border border-gray-300">ภาพรวม</TableHead>
          </TableRow>
          {/* หัวตารางชั้นล่าง (field ย่อย) */}
          <TableRow>
            <TableHead className="text-center bg-blue-50 border border-gray-300">กำหนด</TableHead>
            <TableHead className="text-center bg-blue-50 border border-gray-300">เข้าจริง</TableHead>
            <TableHead className="text-center bg-blue-50 border border-gray-300">หมายเหตุ</TableHead>
            <TableHead className="text-center bg-green-50 border border-gray-300">กำหนด</TableHead>
            <TableHead className="text-center bg-green-50 border border-gray-300">ออกจริง</TableHead>
            <TableHead className="text-center bg-green-50 border border-gray-300">หมายเหตุ</TableHead>
            <TableHead className="text-center bg-purple-50 border border-gray-300">กำหนด</TableHead>
            <TableHead className="text-center bg-purple-50 border border-gray-300">เวลาจริง</TableHead>
            <TableHead className="text-center bg-purple-50 border border-gray-300">ส่วนต่าง</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, idx) => (
            // <TableRow key={idx} className={
            //   row.summary === "ขาดงาน"
            //     ? "bg-red-50"
            //     : row.summary === "วันหยุด" || row.summary.includes("อาสาฬหบูชา") || row.summary.includes("เข้าพรรษา")
            //       ? "bg-yellow-50"
            //       : row.summary === "มาสาย"
            //         ? "bg-orange-50"
            //         : row.summary === "ปกติ"
            //           ? "bg-green-50"
            //           : ""
            // }>
            //hover color gray-100
            <TableRow key={idx} className={"hover:bg-gray-100 transition-colors duration-200"}>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.department}</TableCell>
              <TableCell>{row.position}</TableCell>
              <TableCell>{row.date}</TableCell>
              {/* เข้างาน */}
              <TableCell>{row.checkin_plan}</TableCell>
              <TableCell>{row.checkin_actual}</TableCell>
              <TableCell>{row.checkin_note}</TableCell>
              {/* ออกงาน */}
              <TableCell>{row.checkout_plan}</TableCell>
              <TableCell>{row.checkout_actual}</TableCell>
              <TableCell>{row.checkout_note}</TableCell>
              {/* ระยะเวลา */}
              <TableCell>{row.work_plan}</TableCell>
              <TableCell>{row.work_actual}</TableCell>
              <TableCell>{row.work_diff}</TableCell>
              {/* ภาพรวม */}
              <TableCell>
                <span
                  className={
                    row.summary === "ขาดงาน"
                      ? "inline-block px-2 py-1 rounded bg-red-200 text-red-700 text-xs"
                      : row.summary === "วันหยุด" || row.summary.includes("อาสาฬหบูชา") || row.summary.includes("เข้าพรรษา")
                        ? "inline-block px-2 py-1 rounded bg-yellow-200 text-yellow-800 text-xs"
                        : row.summary === "มาสาย"
                          ? "inline-block px-2 py-1 rounded bg-orange-200 text-orange-800 text-xs"
                          : row.summary === "ปกติ"
                            ? "inline-block px-2 py-1 rounded bg-green-200 text-green-700 text-xs "
                            : ""
                  }
                >
                  {row.summary}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table >
    </div >
  );
}
