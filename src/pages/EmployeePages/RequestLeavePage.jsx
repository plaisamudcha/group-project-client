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

function RequestLeavePage() {
    const [status, setStatus] = useState({ loading: false, error: null, success: false });
    // <--- ไฮไลท์: 2. เพิ่ม State สำหรับเก็บข้อมูลวันหยุด และวันที่ที่ผู้ใช้เลือก
    const [holidays, setHolidays] = useState([]);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    // <--- ไฮไลท์: 3. เพิ่ม useEffect เพื่อดึงข้อมูลวันหยุดมาใช้ในปฏิทิน
    useEffect(() => {
        const fetchHolidays = async () => {
            try {
                const response = await employeeApi.getHolidays();
                const holidayDates = response.data.holiday.map(h => new Date(h.date));
                setHolidays(holidayDates);
            } catch (error) {
                console.error("Failed to fetch holidays:", error);
            }
        };
        fetchHolidays();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ loading: true, error: null, success: false });
        
        const formData = new FormData(e.target);
        // <--- ไฮไลท์: 4. เปลี่ยนวิธีดึงข้อมูลวันที่ มาจาก State แทน Form โดยตรง
        const leaveData = {
            leaveType: formData.get('leaveType'),
            reason: formData.get('reason'),
            startDate: startDate ? format(startDate, 'yyyy-MM-dd') : null,
            endDate: endDate ? format(endDate, 'yyyy-MM-dd') : null,
        };

        try {
            await employeeApi.postLeaveRequest(leaveData);
            setStatus({ loading: false, error: null, success: true });
            e.target.reset();
            setStartDate(null);
            setEndDate(null);
            setTimeout(() => setStatus({ loading: false, error: null, success: false }), 4000);
        } catch (error) {
            setStatus({ loading: false, error: error.response?.data?.message || "เกิดข้อผิดพลาดในการส่งคำขอ", success: false });
        }
    };

    // <--- ไฮไลท์: 5. สร้างฟังก์ชันสำหรับตรวจสอบและปิดการใช้งานวันที่ (วันหยุดและเสาร์-อาทิตย์)
    const isDateDisabled = (date) => {
        const day = date.getDay();
        // ปิดการใช้งานวันเสาร์-อาทิตย์ (Saturday=6, Sunday=0)
        if (day === 0 || day === 6) {
            return true;
        }
        // ปิดการใช้งานวันหยุดบริษัท
        return holidays.some(holiday => 
            date.getFullYear() === holiday.getFullYear() &&
            date.getMonth() === holiday.getMonth() &&
            date.getDate() === holiday.getDate()
        );
    };

    return (
        <Card className="w-150 max-w-2xl mx-auto animate-fade-in">
            <CardHeader>
                <CardTitle>ยื่นคำขอลา</CardTitle>
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
                            <SelectTrigger id="leaveType"><SelectValue placeholder="เลือกประเภทการลา" /></SelectTrigger>
                            <SelectContent>
                                {/* <--- ไฮไลท์: แก้ไขค่า value ให้ตรงกับที่ Backend ต้องการ --- */}
                                <SelectItem value="VACATION">วันลาพักร้อน</SelectItem>
                                <SelectItem value="PERSONAL">วันลากิจ</SelectItem>
                                <SelectItem value="SICK">วันลาป่วย</SelectItem>
                            </SelectContent>
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
                                <PopoverContent className="w-auto p-0">
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
                                <PopoverContent className="w-auto p-0">
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
