import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, Send, Loader2 } from "lucide-react";
import { useState } from "react";
import employeeApi from "@/src/api/employeeApi";

function RequestLeavePage() {
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
            setStatus({ loading: false, error: error.response?.data?.message || "เกิดข้อผิดพลาดในการส่งคำขอ", success: false });
        }
    };

  return (
        <Card className="w-full max-w-2xl mx-auto animate-fade-in">
            <CardHeader>
                <CardTitle>ยื่นคำขอลา</CardTitle>
                <CardDescription>กรอกรายละเอียดด้านล่างเพื่อยื่นคำขอลา</CardDescription>
            </CardHeader>
            <CardContent>
                {status.success && (
                    <Alert variant="success" className="mb-4">
                        <CheckCircle className="h-4 w-4" />
                        <AlertTitle>ส่งคำขอสำเร็จ!</AlertTitle>
                        <AlertDescription>ระบบได้ส่งใบลาของคุณเพื่อรอการอนุมัติแล้ว</AlertDescription>
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
                                <SelectItem value="Annual Leave">วันลาพักร้อน</SelectItem>
                                <SelectItem value="Business Leave">วันลากิจ</SelectItem>
                                <SelectItem value="Sick Leave">วันลาป่วย</SelectItem>
                            </SelectContent>
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
                        {status.loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                        {status.loading ? 'กำลังส่ง...' : 'ยื่นใบลา'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};
export default RequestLeavePage;
