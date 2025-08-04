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
import { Badge } from "@/components/ui/badge";
// --- 👇👇👇 1. เพิ่ม import สำหรับ RadioGroup ---
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import {
  CheckCircle,
  Send,
  Loader2,
  AlertTriangle,
  CalendarIcon,
  Clock,
  FileText,
  Users,
  Calendar as CalendarLucide,
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
          console.warn("Working days not found, defaulting to Mon-Fri.");
          setWorkingDays([
            "MONDAY",
            "TUESDAY",
            "WEDNESDAY",
            "THURSDAY",
            "FRIDAY",
          ]);
        }
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
        setWorkingDays([
          "MONDAY",
          "TUESDAY",
          "WEDNESDAY",
          "THURSDAY",
          "FRIDAY",
        ]);
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
    console.log(leaveData);

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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-6">
      <div className="w-full max-w-4xl mx-auto">
        <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm pt-0">
          <CardHeader className="text-center pb-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg py-4">
            <div className="flex items-center justify-center mb-4">
              <Send className="h-8 w-8 mr-3" />
              <CardTitle className="text-3xl font-bold">
                ฟอร์มยื่นคำขอลา
              </CardTitle>
            </div>
            <CardDescription className="text-purple-100 text-lg">
              กรอกรายละเอียดด้านล่างเพื่อยื่นคำขอลา
              ระบบจะดำเนินการตรวจสอบและอนุมัติ
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8">
            {/* แสดงข้อมูลพื้นฐาน */}
            <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
              <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center">
                <Users className="h-5 w-5 mr-2" />
                ข้อมูลผู้ยื่นคำขอ
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Badge
                    variant="outline"
                    className="bg-white text-purple-700 border-purple-300"
                  >
                    👤 {loggedInUser?.firstName} {loggedInUser?.lastName}
                  </Badge>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge
                    variant="outline"
                    className="bg-white text-purple-700 border-purple-300"
                  >
                    🏢 {loggedInUser?.department || "ไม่ระบุแผนก"}
                  </Badge>
                </div>
              </div>
            </div>

            {status.success && (
              <Alert className="mb-6 border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">
                  ส่งคำขอสำเร็จ!
                </AlertTitle>
                <AlertDescription className="text-green-700">
                  ระบบได้ส่งใบลาของคุณเพื่อรอการอนุมัติแล้ว
                  คุณสามารถติดตามสถานะได้ในหน้าประวัติการลา
                </AlertDescription>
              </Alert>
            )}

            {status.error && (
              <Alert
                variant="destructive"
                className="mb-6 border-red-200 shadow-lg"
              >
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>เกิดข้อผิดพลาด!</AlertTitle>
                <AlertDescription>{status.error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* ประเภทการลา */}
              <div className="space-y-4">
                <Label
                  htmlFor="leaveType"
                  className="text-lg font-semibold text-gray-800 flex items-center"
                >
                  <FileText className="h-5 w-5 mr-2 text-purple-600" />
                  ประเภทการลา
                </Label>
                <Select name="leaveType" required>
                  <SelectTrigger
                    id="leaveType"
                    className="h-12 text-base border-2 border-gray-200 focus:border-purple-400"
                  >
                    <SelectValue placeholder="เลือกประเภทการลาที่ต้องการ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VACATION" className="py-3">
                      <div className="flex items-center space-x-3">
                        <span>🏖️</span>
                        <span>วันลาพักร้อน</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="PERSONAL" className="py-3">
                      <div className="flex items-center space-x-3">
                        <span>📋</span>
                        <span>วันลากิจ</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="SICK" className="py-3">
                      <div className="flex items-center space-x-3">
                        <span>🏥</span>
                        <span>วันลาป่วย</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="MATERNITY" className="py-3">
                      <div className="flex items-center space-x-3">
                        <span>👶</span>
                        <span>ลาคลอด</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="UNPAID" className="py-3">
                      <div className="flex items-center space-x-3">
                        <span>💼</span>
                        <span>วันลางานไม่รับเงินเดือน</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* ช่วงเวลาที่ลา */}
              <div className="space-y-4">
                <Label className="text-lg font-semibold text-gray-800 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-purple-600" />
                  ช่วงเวลาที่ลา
                </Label>
                <RadioGroup
                  name="leaveDuration"
                  value={leaveDuration}
                  onValueChange={setLeaveDuration}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                  <div className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-purple-300 transition-colors">
                    <RadioGroupItem
                      value="FULL_DAY"
                      id="r1"
                      className="text-purple-600"
                    />
                    <Label htmlFor="r1" className="flex-1 cursor-pointer">
                      <div className="font-medium">เต็มวัน</div>
                      <div className="text-sm text-gray-600">08:00 - 17:00</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-purple-300 transition-colors">
                    <RadioGroupItem
                      value="HALF_DAY_MORNING"
                      id="r2"
                      className="text-purple-600"
                    />
                    <Label htmlFor="r2" className="flex-1 cursor-pointer">
                      <div className="font-medium">ครึ่งวัน (เช้า)</div>
                      <div className="text-sm text-gray-600">08:00 - 12:00</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-purple-300 transition-colors">
                    <RadioGroupItem
                      value="HALF_DAY_AFTERNOON"
                      id="r3"
                      className="text-purple-600"
                    />
                    <Label htmlFor="r3" className="flex-1 cursor-pointer">
                      <div className="font-medium">ครึ่งวัน (บ่าย)</div>
                      <div className="text-sm text-gray-600">13:00 - 17:00</div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* วันที่ลา */}
              <div className="space-y-4">
                <Label className="text-lg font-semibold text-gray-800 flex items-center">
                  <CalendarLucide className="h-5 w-5 mr-2 text-purple-600" />
                  กำหนดวันที่ลา
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-base font-medium text-gray-700">
                      วันที่เริ่มลา
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full h-12 justify-start text-left font-normal border-2 border-gray-200 hover:border-purple-400",
                            !startDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-3 h-5 w-5 text-purple-600" />
                          {startDate ? (
                            format(startDate, "PPP", { locale: th })
                          ) : (
                            <span>เลือกวันที่เริ่มลา</span>
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

                  <div className="space-y-3">
                    <Label className="text-base font-medium text-gray-700">
                      วันที่สิ้นสุด
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full h-12 justify-start text-left font-normal border-2 border-gray-200 hover:border-purple-400",
                            !endDate && "text-muted-foreground",
                            leaveDuration !== "FULL_DAY" && "opacity-50"
                          )}
                          disabled={leaveDuration !== "FULL_DAY"}
                        >
                          <CalendarIcon className="mr-3 h-5 w-5 text-purple-600" />
                          {endDate ? (
                            format(endDate, "PPP", { locale: th })
                          ) : (
                            <span>เลือกวันที่สิ้นสุด</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          disabled={(date) =>
                            isDateDisabled(date) ||
                            (startDate && date < startDate)
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {leaveDuration !== "FULL_DAY" && (
                      <p className="text-sm text-gray-500">
                        * วันที่สิ้นสุดจะตั้งอัตโนมัติเมื่อเลือกลาครึ่งวัน
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* เหตุผลการลา */}
              <div className="space-y-4">
                <Label
                  htmlFor="reason"
                  className="text-lg font-semibold text-gray-800 flex items-center"
                >
                  <FileText className="h-5 w-5 mr-2 text-purple-600" />
                  เหตุผลการลา
                </Label>
                <Textarea
                  id="reason"
                  name="reason"
                  placeholder="กรุณาระบุเหตุผลการลาของคุณให้ชัดเจน เช่น ไปรักษาตัวที่โรงพยาบาล, เดินทางไปต่างจังหวัด, ติดธุระส่วนตัว เป็นต้น"
                  required
                  className="min-h-[120px] border-2 border-gray-200 focus:border-purple-400 text-base"
                />
              </div>

              {/* ปุ่มส่งคำขอ */}
              <div className="pt-6">
                <Button
                  type="submit"
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                  disabled={status.loading}
                >
                  {status.loading ? (
                    <>
                      <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                      กำลังส่งคำขอ...
                    </>
                  ) : (
                    <>
                      <Send className="mr-3 h-6 w-6" />
                      ยื่นใบลา
                    </>
                  )}
                </Button>

                <p className="text-center text-sm text-gray-600 mt-4">
                  โปรดตรวจสอบข้อมูลให้ถูกต้องก่อนส่งคำขอ
                  การแก้ไขอาจต้องติดต่อแผนกบุคคล
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
export default RequestLeavePage;
