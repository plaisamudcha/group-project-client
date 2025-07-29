import employeeApi from "@/src/api/employeeApi";
import { useState } from "react";

// สมมติว่า path นี้ถูกต้อง และ ErrorMessage อยู่ในไฟล์เดียวกัน
import { 
    Card, CardHeader, CardTitle, CardDescription, CardContent, 
    Button, Input, Textarea, Select, Label, Alert, 
    AlertTitle, AlertDescription, ErrorMessage,
} from "@/src/components/SianUi"; 

import { Send, Loader2, CheckCircle } from "lucide-react";

// ลบฟังก์ชันที่ซ้อนกันออก และทำงานใน MyLeaveRequest โดยตรง
function MyLeaveRequest() { 
  const [status, setStatus] = useState({ loading: false, error: null, success: false });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: null, success: false });
    const formData = new FormData(e.target);
    const leaveData = Object.fromEntries(formData.entries());

    try {
      await employeeApi.postLeaveRequest(leaveData);
      setStatus({ loading: false, error: null, success: true });
      e.target.reset();
      setTimeout(() => setStatus({ loading: false, error: null, success: false }), 4000);
    } catch (error) {
      setStatus({ loading: false, error: error.response?.data?.message || error.message, success: false });
    }
  };

  // คอมโพเนนต์ต้อง return JSX ออกมา
  return (
    <Card className="w-full max-w-2xl animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Send className="mr-3 text-primary" />ฟอร์มยื่นคำขอลา
        </CardTitle>
        <CardDescription>กรอกรายละเอียดด้านล่างเพื่อยื่นคำขอลา</CardDescription>
      </CardHeader>
      <CardContent>
        {status.success && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">ส่งคำขอสำเร็จ!</AlertTitle>
            <AlertDescription className="text-green-700">ระบบได้ส่งใบลาของคุณเพื่อรอการอนุมัติแล้ว</AlertDescription>
          </Alert>
        )}
        {status.error && <ErrorMessage message={status.error} />}
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="leaveType">ประเภทการลา</Label>
            <Select id="leaveType" name="leaveType">
              <option>วันลาพักร้อน</option>
              <option>วันลากิจ</option>
              <option>วันลาป่วย</option>
            </Select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">วันที่เริ่มลา</Label>
              <Input type="date" id="startDate" name="startDate" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">วันที่สิ้นสุด</Label>
              <Input type="date" id="endDate" name="endDate" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason">เหตุผลการลา</Label>
            <Textarea id="reason" name="reason" placeholder="ระบุเหตุผลการลาของคุณ..." required />
          </div>
          <Button type="submit" className="w-full" disabled={status.loading}>
            {status.loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> กำลังส่ง...</> : <><Send className="mr-2 h-4 w-4" /> ยื่นใบลา</>}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}; // สิ้นสุดฟังก์ชัน MyLeaveRequest

export default MyLeaveRequest;