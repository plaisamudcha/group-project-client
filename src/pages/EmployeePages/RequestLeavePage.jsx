import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Send, Loader2, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import employeeApi from "@/src/api/employeeApi";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import useUserStore from "@/src/stores/useUserStore";

function RequestLeavePage() {
    const [status, setStatus] = useState({ loading: false, error: null, success: false });
    const [holidays, setHolidays] = useState([]);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    {/* --- 👇👇👇 ไฮไลท์: 1. เพิ่ม State สำหรับเก็บวันทำงานของ User --- */}
    const [workingDays, setWorkingDays] = useState([]);

    const loggedInUser = useUserStore((state) => state.user);

    {/* --- 👇👇👇 ไฮไลท์: 2. ใช้ useEffect เพื่อดึงข้อมูลวันหยุด และ "วันทำงาน" ของ User --- */}
    useEffect(() => {
        const fetchData = async () => {
            try {
                // ดึงข้อมูล 2 อย่างพร้อมกันเพื่อประสิทธิภาพ
                const [holidayRes, profileRes] = await Promise.all([
                    employeeApi.getHolidays(),
                    employeeApi.getMyProfile(loggedInUser.id) // ใช้ id จาก store
                ]);

                // ตั้งค่าวันหยุดบริษัท
                const holidayDates = holidayRes.data.holiday.map(h => new Date(h.date));
                setHolidays(holidayDates);

                // ตั้งค่่าวันทำงานจาก profile ที่ดึงมาล่าสุด
                if (profileRes.data.workPolicy?.workingDays) {
                    setWorkingDays(profileRes.data.workPolicy.workingDays);
                } else {
                    // กรณีไม่พบ workingDays ใน profile ให้ใช้ค่าเริ่มต้นเป็น จ-ศ
                    console.warn("Working days not found in user profile, defaulting to Mon-Fri.");
                    setWorkingDays(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"]);
                }
            } catch (error) {
                console.error("Failed to fetch initial data:", error);
                // ตั้งค่าวันทำงานเริ่มต้นหาก API ล้มเหลว
                setWorkingDays(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"]);
            }
        };
        if(loggedInUser) fetchData();
    }, [loggedInUser]);
   useEffect(() => {
        const fetchData = async () => {
            if (!loggedInUser) return; // ถ้ายังไม่มีข้อมูล user ให้หยุดรอ

            try {
                // ดึงข้อมูล 2 อย่างพร้อมกัน
                const [holidayRes, profileRes] = await Promise.all([
                    employeeApi.getHolidays(),
                    employeeApi.getMyProfile(loggedInUser.id) // ใช้ id จาก store
                ]);

                // ตั้งค่าวันหยุด
                const holidayDates = holidayRes.data.holiday.map(h => new Date(h.date));
                setHolidays(holidayDates);

                // ตั้งค่่าวันทำงานจาก profile ที่ดึงมา
                if (profileRes.data.workPolicy?.workingDays) {
                    setWorkingDays(profileRes.data.workPolicy.workingDays);
                } else {
                    setWorkingDays(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"]);
                }
            } catch (error) {
                console.error("Failed to fetch initial data:", error);
                setWorkingDays(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"]);
            }
        };
        
        fetchData();
    }, [loggedInUser]); // ให้ useEffect ทำงานใหม่เมื่อข้อมูล user ใน store พร้อมใช้งาน
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ loading: true, error: null, success: false });
        
        const formData = new FormData(e.target);
        const leaveData = {
            leaveType: formData.get('leaveType'),
            reason: formData.get('reason'),
            startDate: startDate ? format(startDate, 'yyyy-MM-dd') : null,
            endDate: endDate ? format(endDate, 'yyyy-MM-dd') : null,
        };

        if (!leaveData.startDate || !leaveData.endDate) {
             setStatus({ loading: false, error: "กรุณาเลือกวันที่เริ่มและสิ้นสุดการลา", success: false });
             return;
        }

        try {
            await employeeApi.postLeaveRequest(leaveData);
            setStatus({ loading: false, error: null, success: true });
            e.target.reset();
            setStartDate(null);
            setEndDate(null);
            setTimeout(() => setStatus({ loading: false, error: null, success: false }), 5000);
        } catch (error) {
            setStatus({ loading: false, error: error.response?.data?.message || "เกิดข้อผิดพลาดในการส่งคำขอ", success: false });
        }
    };
    
    {/* --- 👇👇👇 ไฮไลท์: 3. อัปเดต Logic การปิดใช้งานวันที่ในปฏิทิน --- */}
    const isDateDisabled = (date) => {
        // แปลงวัน (0=Sun, 1=Mon,...) เป็นชื่อวันแบบตัวพิมพ์ใหญ่
        const dayName = format(date, 'EEEE').toUpperCase();

        // ปิดการใช้งานถ้า "ไม่ใช่วันทำงาน"
        if (workingDays.length > 0 && !workingDays.includes(dayName)) {
            return true;
        }

        // ปิดการใช้งาน "วันหยุดบริษัท"
        return holidays.some(holiday => 
            date.getFullYear() === holiday.getFullYear() &&
            date.getMonth() === holiday.getMonth() &&
            date.getDate() === holiday.getDate()
        );
    };

    return (
        <Card className="w-full max-w-2xl mx-auto animate-fade-in">
             <CardHeader>
                <CardTitle className="flex items-center text-xl"><Send className="mr-3 text-primary" />ฟอร์มยื่นคำขอลา</CardTitle>
                <CardDescription>กรอกรายละเอียดด้านล่างเพื่อยื่นคำขอลา</CardDescription>
            </CardHeader>
            <CardContent>
                {status.success && (
                    <Alert variant="success" className="mb-4">
                        <CheckCircle className="h-4 w-4" /><AlertTitle>ส่งคำขอสำเร็จ!</AlertTitle><AlertDescription>ระบบได้ส่งใบลาของคุณเพื่อรอการอนุมัติแล้ว</AlertDescription>
                    </Alert>
                )}
                {status.error && (
                    <Alert variant="destructive" className="mb-4">
                         <AlertTriangle className="h-4 w-4" /><AlertTitle>เกิดข้อผิดพลาด!</AlertTitle><AlertDescription>{status.error}</AlertDescription>
                    </Alert>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="leaveType">ประเภทการลา</Label>
                        <Select name="leaveType" required>
                            <option value="VACATION">วันลาพักร้อน</option>
                            <option value="PERSONAL">วันลากิจ</option>
                            <option value="SICK">วันลาป่วย</option>
                            <option value="MATERNITY">ลาคลอด</option>
                            <option value="UNPAID">ลางานโดยไม่รับค่าจ้าง</option>
                        </Select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>วันที่เริ่มลา</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {startDate ? format(startDate, "PPP", { locale: th }) : <span>เลือกวันที่</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent>
                                    <Calendar mode="single" selected={startDate} onSelect={setStartDate} disabled={isDateDisabled} initialFocus />
                                </PopoverContent>
                            </Popover>
                        </div>
                         <div className="space-y-2">
                            <Label>วันที่สิ้นสุด</Label>
                             <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}>
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {endDate ? format(endDate, "PPP", { locale: th }) : <span>เลือกวันที่</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent>
                                    <Calendar mode="single" selected={endDate} onSelect={setEndDate} disabled={isDateDisabled} initialFocus />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="reason">เหตุผลการลา</Label>
                        <Textarea id="reason" name="reason" placeholder="ระบุเหตุผลการลาของคุณ..." required />
                    </div>
                    <Button type="submit" className="w-full" disabled={status.loading}>
                        {status.loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                        {status.loading ? 'กำลังส่ง...' : 'ยื่นใบลา'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};
export default RequestLeavePage;
