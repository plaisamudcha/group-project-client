import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle, ListFilter, Eye } from "lucide-react";
import { toast } from 'react-toastify';

// Mock API - ในสถานการณ์จริงจะมาจากการเรียก API
const admintoApi = {
  // จำลองการดึงข้อมูลคำขอลาทั้งหมด
  getAllLeaveRequests: async (year) => {
    console.log(`Fetching requests for year: ${year}`);
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          data: {
            requests: [
              { id: 1, employeeName: 'สมชาย ใจดี', leaveType: 'SICK', startDate: '2024-07-15', endDate: '2024-07-15', days: 1, reason: 'มีไข้และปวดหัว', status: 'PENDING', createdAt: '2024-07-14T10:00:00Z' },
              { id: 2, employeeName: 'สมหญิง จริงใจ', leaveType: 'PERSONAL', startDate: '2024-07-20', endDate: '2024-07-22', days: 3, reason: 'ไปทำธุระส่วนตัวต่างจังหวัดกับครอบครัวเนื่องจากเป็นเรื่องเร่งด่วน', status: 'PENDING', createdAt: '2024-07-12T14:30:00Z' },
              { id: 3, employeeName: 'มานะ บากบั่น', leaveType: 'VACATION', startDate: '2024-08-01', endDate: '2024-08-05', days: 5, reason: 'พักผ่อนประจำปี', status: 'APPROVED', createdAt: '2024-06-20T11:00:00Z' },
              { id: 4, employeeName: 'ปิติ ยินดี', leaveType: 'SICK', startDate: '2024-07-10', endDate: '2024-07-10', days: 1, reason: 'อาหารเป็นพิษ', status: 'REJECTED', createdAt: '2024-07-10T09:00:00Z', remark: 'เอกสารไม่ครบถ้วน' },
              { id: 5, employeeName: 'สมชาย ใจดี', leaveType: 'PERSONAL', startDate: '2024-08-10', endDate: '2024-08-10', days: 1, reason: 'ติดต่อราชการ', status: 'APPROVED', createdAt: '2024-07-01T16:00:00Z' },
              { id: 6, employeeName: 'สมหญิง จริงใจ', leaveType: 'VACATION', startDate: '2023-12-25', endDate: '2023-12-29', days: 5, reason: 'เที่ยวปีใหม่', status: 'APPROVED', createdAt: '2023-11-15T10:00:00Z' },
            ]
          }
        });
      }, 1000);
    });
  },
  // จำลองการอัปเดตสถานะใบลา
  updateLeaveStatus: async (requestId, status, remark) => {
    console.log(`Updating request ${requestId} to ${status} with remark: ${remark}`);
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ success: true, message: `อัปเดตสถานะสำเร็จ` });
      }, 500);
    });
  }
};

// การกำหนดประเภทการลา
const LEAVE_TYPES = {
  VACATION: 'ลาพักร้อน',
  PERSONAL: 'ลากิจ',
  SICK: 'ลาป่วย',
  MATERNITY: 'ลาคลอด',
  UNPAID: 'ลาโดยไม่รับค่าจ้าง',
};

const STATUS_OPTIONS = {
  PENDING: 'รอดำเนินการ',
  APPROVED: 'อนุมัติ',
  REJECTED: 'ปฏิเสธ',
};

const currentYear = dayjs().year();
const availableYears = [currentYear - 1, currentYear, currentYear + 1];

function LeaveManagementPage() {
  const [allRequests, setAllRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedYear, setSelectedYear] = useState(String(currentYear));
  const [selectedStatus, setSelectedStatus] = useState("PENDING"); // Default filter

  const [actionTarget, setActionTarget] = useState(null); // { request, action: 'APPROVE' | 'REJECT' }
  const [viewingRequest, setViewingRequest] = useState(null); // State for details dialog

  const loadLeaveRequests = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await admintoApi.getAllLeaveRequests(selectedYear);
      const yearFilteredData = response.data.requests.filter(req => dayjs(req.startDate).year() === parseInt(selectedYear));
      setAllRequests(yearFilteredData);
    } catch (error) {
      console.error("ไม่สามารถดึงข้อมูลใบลาได้:", error);
      setError("เกิดข้อผิดพลาดในการดึงข้อมูล กรุณาลองใหม่อีกครั้ง");
      setAllRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLeaveRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear]);

  useEffect(() => {
    let requests = [...allRequests];
    if (selectedStatus !== "ALL") {
      requests = requests.filter(r => r.status === selectedStatus);
    }
    setFilteredRequests(requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  }, [allRequests, selectedStatus]);

  const handleActionClick = (request, action) => {
    setActionTarget({ request, action });
  };

  const handleConfirmAction = async () => {
    if (!actionTarget) return;

    const { request, action } = actionTarget;
    const newStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';

    try {
      await admintoApi.updateLeaveStatus(request.id, newStatus);
      toast.success(`ดำเนินการ ${newStatus === 'APPROVED' ? 'อนุมัติ' : 'ปฏิเสธ'} ใบลาสำเร็จ`);
      setActionTarget(null);
      loadLeaveRequests(); // Reload data
    } catch (err) {
      console.error("เกิดข้อผิดพลาดในการอัปเดตสถานะ:", err);
      toast.error("ไม่สามารถอัปเดตสถานะได้: " + (err.response?.data?.message || err.message));
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-red-500">
        <XCircle className="h-10 w-10 mb-4" />
        <h2 className="text-xl font-semibold">{error}</h2>
      </div>
    );
  }

  return (
    <div className="p-4 md:px-24">
      <header className="my-8">
        <h1 className="text-3xl font-bold text-gray-800">LeaveRequest Management</h1>
        <p className="text-muted-foreground">ตรวจสอบและดำเนินการคำขอลาของพนักงาน</p>
      </header>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
            <SelectContent>
              {availableYears.map(year => (
                <SelectItem key={year} value={String(year)}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant={selectedStatus === 'PENDING' ? 'default' : 'outline'} onClick={() => setSelectedStatus('PENDING')}>รอดำเนินการ</Button>
          <Button variant={selectedStatus === 'APPROVED' ? 'default' : 'outline'} onClick={() => setSelectedStatus('APPROVED')}>อนุมัติ</Button>
          <Button variant={selectedStatus === 'REJECTED' ? 'default' : 'outline'} onClick={() => setSelectedStatus('REJECTED')}>ปฏิเสธ</Button>
          <Button variant={selectedStatus === 'ALL' ? 'default' : 'outline'} onClick={() => setSelectedStatus('ALL')}><ListFilter className="mr-2 h-4 w-4" />ทั้งหมด</Button>
        </div>
      </div>

      <div className="border rounded-lg overflow-x-auto bg-white shadow-sm">
        <Table className="table-fixed w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">พนักงาน</TableHead>
              <TableHead className="w-[120px] text-center">ประเภทการลา</TableHead>
              <TableHead className="w-[200px] text-center">ช่วงวันที่ลา</TableHead>
              <TableHead className="w-[100px] text-center">จำนวนวัน</TableHead>
              <TableHead className="w-[150px] text-center">สถานะ</TableHead>
              <TableHead className="w-[220px] text-center">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.length > 0 ? (
              filteredRequests.map((req) => (
                <TableRow key={req.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="font-medium text-gray-800 truncate" title={req.employeeName}>{req.employeeName}</div>
                    <div className="text-sm text-muted-foreground">ยื่นเมื่อ: {dayjs(req.createdAt).format('DD/MM/YYYY')}</div>
                  </TableCell>
                  <TableCell className="text-center">{LEAVE_TYPES[req.leaveType]}</TableCell>
                  <TableCell className="text-center">{dayjs(req.startDate).format('DD MMM YYYY')} - {dayjs(req.endDate).format('DD MMM YYYY')}</TableCell>
                  <TableCell className="text-center">{req.days}</TableCell>
                  <TableCell className="text-center">
                    <Badge
                      className={
                        req.status === 'APPROVED' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                          req.status === 'REJECTED' ? 'bg-red-100 text-red-800 hover:bg-red-200' :
                            'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                      }
                    >
                      {STATUS_OPTIONS[req.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button size="sm" variant="ghost" onClick={() => setViewingRequest(req)}>
                      <Eye className="mr-1 h-4 w-4" /> ดู
                    </Button>
                    {req.status === 'PENDING' && (
                      <>
                        <Button size="sm" variant="ghost" className="text-green-600 hover:text-green-700" onClick={() => handleActionClick(req, 'APPROVE')}>
                          <CheckCircle2 className="mr-1 h-4 w-4" /> อนุมัติ
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700" onClick={() => handleActionClick(req, 'REJECT')}>
                          <XCircle className="mr-1 h-4 w-4" /> ปฏิเสธ
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={6} className="h-24 text-center text-muted-foreground">ไม่พบคำขอลาตามเงื่อนไขที่เลือก</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Details Dialog - Conditionally render the entire Dialog */}
      {viewingRequest && (
        <Dialog open={true} onOpenChange={() => setViewingRequest(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>รายละเอียดใบลา</DialogTitle>
              <DialogDescription>
                คำขอลาของ {viewingRequest.employeeName}
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-5 py-4">
              <div className="flex justify-between items-baseline">
                <span className="font-semibold text-muted-foreground">พนักงาน</span>
                <span className="text-right">{viewingRequest.employeeName}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="font-semibold text-muted-foreground">ประเภท</span>
                <span className="text-right">{LEAVE_TYPES[viewingRequest.leaveType]}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="font-semibold text-muted-foreground">วันที่ลา</span>
                <span className="text-right">{dayjs(viewingRequest.startDate).format('DD MMM YYYY')} - {dayjs(viewingRequest.endDate).format('DD MMM YYYY')}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="font-semibold text-muted-foreground">จำนวน</span>
                <span className="text-right">{viewingRequest.days} วัน</span>
              </div>
              <div className="flex flex-col items-start space-y-1">
                <span className="font-semibold text-muted-foreground">เหตุผล</span>
                <p className="w-full text-left p-2 bg-slate-50 rounded-md border mt-2">{viewingRequest.reason}</p>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="font-semibold text-muted-foreground">สถานะ</span>
                <Badge
                  className={
                    viewingRequest.status === 'APPROVED' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                      viewingRequest.status === 'REJECTED' ? 'bg-red-100 text-red-800 hover:bg-red-200' :
                        'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                  }
                >
                  {STATUS_OPTIONS[viewingRequest.status]}
                </Badge>
              </div>
              {viewingRequest.remark && (
                <div className="flex flex-col items-start space-y-1">
                  <span className="font-semibold text-muted-foreground">หมายเหตุจากผู้จัดการ</span>
                  <p className="w-full text-left p-2 bg-red-50 text-red-700 rounded-md border border-red-200">{viewingRequest.remark}</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">ปิด</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}


      {/* Action Confirmation Dialog */}
      <AlertDialog open={!!actionTarget} onOpenChange={() => setActionTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการ{actionTarget?.action === 'APPROVE' ? 'อนุมัติ' : 'ปฏิเสธ'}ใบลา</AlertDialogTitle>
            <AlertDialogDescription>
              คุณต้องการ{actionTarget?.action === 'APPROVE' ? 'อนุมัติ' : 'ปฏิเสธ'}คำขอลางานของ <strong>{actionTarget?.request?.employeeName}</strong> ใช่หรือไม่?
              <div className="mt-2 text-sm text-muted-foreground border p-2 rounded-md">
                <div><strong>ประเภท:</strong> {LEAVE_TYPES[actionTarget?.request?.leaveType]}</div>
                <div><strong>วันที่:</strong> {dayjs(actionTarget?.request?.startDate).format('DD/MM/YY')} - {dayjs(actionTarget?.request?.endDate).format('DD/MM/YY')} ({actionTarget?.request?.days} วัน)</div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAction}
              className={actionTarget?.action === 'REJECT' ? "bg-destructive hover:bg-destructive/90" : ""}
            >
              ยืนยัน
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default LeaveManagementPage;
