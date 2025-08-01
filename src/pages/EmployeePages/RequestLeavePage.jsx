import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Calendar } from "@/components/ui/calendar";
// --- 👇👇👇 1. เพิ่ม import สำหรับ RadioGroup ---
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import {
  CheckCircle,
  Send,
  Loader2,
  AlertTriangle,
  CalendarIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { th } from "date-fns/locale";

import employeeApi from "@/src/api/employeeApi";
import useUserStore from "@/src/stores/useUserStore";
import { cn } from "@/lib/utils";

function RequestLeavePage() {
  const [status, setStatus] = useState({
    loading: false,
    error: null,
    success: false,
  });

  const [holidays, setHolidays] = useState([]);
  const [workingDays, setWorkingDays] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // --- 👇👇� 2. เพิ่ม State สำหรับจัดการช่วงเวลาที่ลา (เต็มวัน/ครึ่งวัน) ---
  const [leaveDuration, setLeaveDuration] = useState("FULL_DAY");

  const loggedInUser = useUserStore((state) => state.user);

  // --- 🌟 แก้ไข: รวม useEffect ที่ซ้ำกันให้เหลืออันเดียว ---
  useEffect(() => {
    if (!loggedInUser?.id) return;

    const fetchData = async () => {
      try {
        const [holidayRes, profileRes] = await Promise.all([
          employeeApi.getHolidays(),
          employeeApi.getMyProfile(loggedInUser.id),
        ]);

        const holidayDates = holidayRes.data.holiday.map(
          (h) => new Date(h.date)
        );
        setHolidays(holidayDates);

        if (profileRes.data.workPolicy?.workingDays) {
          setWorkingDays(profileRes.data.workPolicy.workingDays);
        } else {
          console.warn(
            "Working days not found, defaulting to Mon-Fri."
          );
          setWorkingDays(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"]);
        }
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
        setWorkingDays(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"]);
      }
    };

    fetchData();
  }, [loggedInUser]);

  // --- 👇👇👇 3. เพิ่ม useEffect เพื่อจัดการ Logic การลาครึ่งวัน ---
  // เมื่อเลือก "ลาครึ่งวัน" ให้ตั้งค่า endDate เป็นวันเดียวกับ startDate อัตโนมัติ
  useEffect(() => {
    if (leaveDuration !== "FULL_DAY" && startDate) {
      setEndDate(startDate);
    }
  }, [startDate, leaveDuration]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: null, success: false });

    const formData = new FormData(e.target);
    // --- 👇👇👇 4. เพิ่ม leaveDuration เข้าไปในข้อมูลที่จะส่งไป API ---
    const leaveData = {
      leaveType: formData.get("leaveType"),
      reason: formData.get("reason"),
      startDate: startDate ? format(startDate, "yyyy-MM-dd") : null,
      endDate: endDate ? format(endDate, "yyyy-MM-dd") : null,
      userId: loggedInUser.id,
      leaveSession: leaveDuration, // ส่งข้อมูลช่วงเวลาที่ลาไปด้วย
    };
    console.log(leaveData)

    if (!leaveData.startDate || !leaveData.endDate) {
      setStatus({
        loading: false,
        error: "กรุณาเลือกวันที่เริ่มและสิ้นสุดการลา",
        success: false,
      });
      return;
    }

    try {
      await employeeApi.postLeaveRequest(leaveData);
      setStatus({ loading: false, error: null, success: true });
      e.target.reset(); // รีเซ็ตฟอร์ม
      setStartDate(null);
      setEndDate(null);
      setLeaveDuration("FULL_DAY"); // รีเซ็ตตัวเลือกกลับเป็นเต็มวัน
      setTimeout(
        () => setStatus({ loading: false, error: null, success: false }),
        5000
      );
    } catch (error) {
      setStatus({
        loading: false,
        error: error.response?.data?.message || "เกิดข้อผิดพลาดในการส่งคำขอ",
        success: false,
      });
    }
  };

  const isDateDisabled = (date) => {
    const dayName = format(date, "EEEE").toUpperCase();
    if (workingDays.length > 0 && !workingDays.includes(dayName)) {
      return true;
    }
    return holidays.some(
      (holiday) =>
        date.getFullYear() === holiday.getFullYear() &&
        date.getMonth() === holiday.getMonth() &&
        date.getDate() === holiday.getDate()
    );
  };

  return (
    <Card className="w-full max-w-2xl mx-auto animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Send className="mr-3 text-primary" />
          ฟอร์มยื่นคำขอลา
        </CardTitle>
        <CardDescription>กรอกรายละเอียดด้านล่างเพื่อยื่นคำขอลา</CardDescription>
      </CardHeader>
      <CardContent>
        {status.success && (
          <Alert variant="success" className="mb-4">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>ส่งคำขอสำเร็จ!</AlertTitle>
            <AlertDescription>
              ระบบได้ส่งใบลาของคุณเพื่อรอการอนุมัติแล้ว
            </AlertDescription>
          </Alert>
        )}
        {status.error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>เกิดข้อผิดพลาด!</AlertTitle>
            <AlertDescription>{status.error}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="leaveType">ประเภทการลา</Label>
            <Select name="leaveType" required>
              <SelectTrigger id="leaveType">
                <SelectValue placeholder="เลือกประเภทการลา" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VACATION">วันลาพักร้อน</SelectItem>
                <SelectItem value="PERSONAL">วันลากิจ</SelectItem>
                <SelectItem value="SICK">วันลาป่วย</SelectItem>
                <SelectItem value="MATERNITY">ลาคลอด</SelectItem>
                <SelectItem value="UNPAID">วันลางานไม่รับเงินเดือน</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* --- 👇👇👇 5. เพิ่ม UI สำหรับเลือกช่วงเวลาที่ลา --- */}
          <div className="space-y-2">
            <Label>ช่วงเวลาที่ลา</Label>
            <RadioGroup
              name="leaveDuration"
              value={leaveDuration}
              onValueChange={setLeaveDuration}
              className="flex flex-wrap gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="FULL_DAY" id="r1" />
                <Label htmlFor="r1">เต็มวัน</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="HALF_DAY_MORNING" id="r2" />
                <Label htmlFor="r2">ครึ่งวัน (เช้า)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="HALF_DAY_AFTERNOON" id="r3" />
                <Label htmlFor="r3">ครึ่งวัน (บ่าย)</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>วันที่เริ่มลา</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? (
                      format(startDate, "PPP", { locale: th })
                    ) : (
                      <span>เลือกวันที่</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    disabled={isDateDisabled}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>วันที่สิ้นสุด</Label>
              <Popover>
                <PopoverTrigger asChild>
                  {/* --- 👇👇👇 6. ปิดการใช้งานปุ่ม endDate เมื่อเป็นการลาครึ่งวัน --- */}
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                    disabled={leaveDuration !== "FULL_DAY"}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? (
                      format(endDate, "PPP", { locale: th })
                    ) : (
                      <span>เลือกวันที่</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    disabled={(date) =>
                      isDateDisabled(date) || (startDate && date < startDate)
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason">เหตุผลการลา</Label>
            <Textarea
              id="reason"
              name="reason"
              placeholder="ระบุเหตุผลการลาของคุณ..."
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={status.loading}>
            {status.loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            {status.loading ? "กำลังส่ง..." : "ยื่นใบลา"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
export default RequestLeavePage;