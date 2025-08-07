import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  XCircle,
  FileText,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Eye,
  RefreshCw,
  Loader2,
  User,
  CalendarDays,
  MessageSquare,
  History,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import employeeApi from "@/src/api/employeeApi";
import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { translateLeaveType } from "@/lib/translateLeaveType";
import { Separator } from "@/components/ui/separator";

function MyLeaveRequestPage() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const fetchData = async (showRefreshLoader = false) => {
    if (showRefreshLoader) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);
    
    try {
      const response = await employeeApi.getLeaveRequests();
      
      // ตรวจสอบ structure ของ response
      let leaveData = [];
      if (response.data) {
        // อาจจะอยู่ใน response.data.leavedata หรือ response.data โดยตรง
        if (Array.isArray(response.data)) {
          leaveData = response.data;
        } else if (response.data.leavedata && Array.isArray(response.data.leavedata)) {
          leaveData = response.data.leavedata;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          leaveData = response.data.data;
        } else if (response.data.requests && Array.isArray(response.data.requests)) {
          leaveData = response.data.requests;
        }
      }
      
      // Sort by createdAt desc (ใบลาล่าสุดขึ้นก่อน)
      leaveData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      setRequests(leaveData);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error fetching leave requests:", err);
      setError(err.response?.data?.message || "ไม่สามารถโหลดข้อมูลได้");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Auto refresh ทุก 30 วินาที
    const interval = setInterval(() => {
      fetchData(true);
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status) => {
    // แปลง status ให้เป็น format ที่ถูกต้อง
    const normalizedStatus = status?.toUpperCase();
    
    const variants = {
      APPROVED: "default",
      PENDING: "secondary",
      REJECTED: "destructive",
    };
    
    const icons = {
      APPROVED: <CheckCircle className="mr-1 h-3 w-3" />,
      PENDING: <Clock className="mr-1 h-3 w-3" />,
      REJECTED: <XCircle className="mr-1 h-3 w-3" />,
    };
    
    const colors = {
      APPROVED: "bg-green-100 text-green-800 border-green-200 hover:bg-green-200",
      PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200",
      REJECTED: "bg-red-100 text-red-800 border-red-200 hover:bg-red-200",
    };
    
    const labels = {
      APPROVED: "อนุมัติ",
      PENDING: "รอพิจารณา",
      REJECTED: "ไม่อนุมัติ",
    };

    return (
      <Badge
        variant={variants[normalizedStatus] || "outline"}
        className={`${colors[normalizedStatus] || "bg-gray-100 text-gray-800"} transition-colors duration-200`}
      >
        {icons[normalizedStatus]}
        {labels[normalizedStatus] || status}
      </Badge>
    );
  };

  const getLeaveTypeColor = (leaveType) => {
    const normalizedType = leaveType?.toUpperCase();
    
    const colors = {
      SICK: "bg-red-50 text-red-700 border-red-200",
      VACATION: "bg-blue-50 text-blue-700 border-blue-200",
      PERSONAL: "bg-green-50 text-green-700 border-green-200",
      MATERNITY: "bg-pink-50 text-pink-700 border-pink-200",
      UNPAID: "bg-purple-50 text-purple-700 border-purple-200",
    };
    
    return colors[normalizedType] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  const calculateDuration = (startDate, endDate, leaveDays) => {
    // ถ้ามี leaveDays จาก backend ให้ใช้เลย
    if (leaveDays !== undefined && leaveDays !== null) {
      return leaveDays;
    }
    
    // ไม่งั้นคำนวณเอง
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const handleRefresh = () => {
    fetchData(true);
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setIsDetailModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsDetailModalOpen(false);
    setSelectedRequest(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
        <div className="w-full max-w-7xl mx-auto">
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center">
              <Skeleton className="h-10 w-1/3 mx-auto mb-2" />
              <Skeleton className="h-4 w-1/2 mx-auto" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
        <div className="w-full max-w-7xl mx-auto">
          <Alert variant="destructive" className="border-red-200 shadow-lg">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>เกิดข้อผิดพลาด!</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
            <Button 
              onClick={handleRefresh} 
              className="mt-4"
              variant="outline"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              ลองใหม่
            </Button>
          </Alert>
        </div>
      </div>
    );
  }

  // กรองและนับสถานะ
  const approvedCount = requests.filter(r => r.status?.toUpperCase() === "APPROVED").length;
  const pendingCount = requests.filter(r => r.status?.toUpperCase() === "PENDING").length;
  const rejectedCount = requests.filter(r => r.status?.toUpperCase() === "REJECTED").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
      {/* Modal สำหรับแสดงรายละเอียด */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center text-xl">
              <FileText className="h-5 w-5 mr-2 text-green-600" />
              รายละเอียดใบลา #{selectedRequest?.id}
            </DialogTitle>
            <DialogDescription>
              ข้อมูลรายละเอียดของใบลาที่ยื่นเมื่อ {selectedRequest && new Date(selectedRequest.createdAt).toLocaleDateString("th-TH", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4 py-4">
              {/* สถานะ */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-600">สถานะปัจจุบัน</span>
                {getStatusBadge(selectedRequest.status)}
              </div>

              <Separator />

              {/* ข้อมูลการลา */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <FileText className="h-4 w-4 text-gray-500 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">ประเภทการลา</p>
                      <p className="font-semibold">
                        {translateLeaveType(selectedRequest.leaveType)?.th || selectedRequest.leaveType}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <CalendarDays className="h-4 w-4 text-gray-500 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">วันที่ลา</p>
                      <p className="font-semibold">
                        {new Date(selectedRequest.startDate).toLocaleDateString("th-TH", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                        {" - "}
                        {new Date(selectedRequest.endDate).toLocaleDateString("th-TH", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Clock className="h-4 w-4 text-gray-500 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">จำนวนวันลา</p>
                      <p className="font-semibold">
                        {selectedRequest.leaveDays} วัน
                        {selectedRequest.leaveSession && selectedRequest.leaveSession !== "FULL_DAY" && 
                          ` (${selectedRequest.leaveSession === "MORNING" ? "ครึ่งวันเช้า" : "ครึ่งวันบ่าย"})`
                        }
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <User className="h-4 w-4 text-gray-500 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">รหัสผู้ยื่น</p>
                      <p className="font-semibold">EMP{selectedRequest.userId.toString().padStart(4, '0')}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Calendar className="h-4 w-4 text-gray-500 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">วันที่ยื่นใบลา</p>
                      <p className="font-semibold">
                        {new Date(selectedRequest.createdAt).toLocaleDateString("th-TH", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>

                  {selectedRequest.updateAt && (
                    <div className="flex items-start space-x-3">
                      <History className="h-4 w-4 text-gray-500 mt-1" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">อัพเดตล่าสุด</p>
                        <p className="font-semibold">
                          {new Date(selectedRequest.updateAt).toLocaleDateString("th-TH", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* เหตุผลการลา */}
              <div className="space-y-2">
                <div className="flex items-start space-x-3">
                  <MessageSquare className="h-4 w-4 text-gray-500 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-2">เหตุผลการลา</p>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-800 whitespace-pre-wrap">
                        {selectedRequest.reason || "ไม่ได้ระบุเหตุผล"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Adjustments ถ้ามี */}
              {selectedRequest.adjustments && selectedRequest.adjustments.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600">ประวัติการปรับปรุง</p>
                    <div className="space-y-2">
                      {selectedRequest.adjustments.map((adj, index) => (
                        <div key={index} className="p-2 bg-yellow-50 rounded text-sm">
                          {adj}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          <DialogFooter>
            <Button onClick={handleCloseModal}>
              ปิด
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="w-full max-w-7xl mx-auto">
        <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm pt-0">
          <CardHeader className="text-center pb-8 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg py-4">
            <div className="flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 mr-3" />
              <CardTitle className="text-3xl font-bold">ประวัติการลา</CardTitle>
            </div>
            <CardDescription className="text-green-100 text-lg">
              ตรวจสอบสถานะใบลาที่เคยยื่นทั้งหมด พร้อมรายละเอียดการอนุมัติ
            </CardDescription>
            {lastUpdated && (
              <p className="text-green-200 text-sm mt-2">
                อัพเดตล่าสุด: {lastUpdated.toLocaleTimeString("th-TH")}
              </p>
            )}
          </CardHeader>

          <CardContent className="p-8">
            {/* ปุ่ม Refresh */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800">
                รายการใบลาทั้งหมด ({requests.length} รายการ)
              </h3>
              <Button 
                onClick={handleRefresh}
                disabled={isRefreshing}
                variant="outline"
                size="sm"
                className="hover:bg-green-50"
              >
                {isRefreshing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    กำลังโหลด...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    รีเฟรช
                  </>
                )}
              </Button>
            </div>

            {requests.length > 0 ? (
              <div className="space-y-6">
                {/* สถิติโดยรวม */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm">อนุมัติแล้ว</p>
                        <p className="text-2xl font-bold">{approvedCount}</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-200" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-yellow-100 text-sm">รอพิจารณา</p>
                        <p className="text-2xl font-bold">{pendingCount}</p>
                      </div>
                      <Clock className="h-8 w-8 text-yellow-200" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-red-100 text-sm">ไม่อนุมัติ</p>
                        <p className="text-2xl font-bold">{rejectedCount}</p>
                      </div>
                      <XCircle className="h-8 w-8 text-red-200" />
                    </div>
                  </div>
                </div>

                {/* ตารางข้อมูล */}
                <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="font-semibold text-gray-700">
                          #
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700">
                          วันที่ยื่น
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700">
                          ประเภทการลา
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700">
                          วันที่เริ่ม
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700">
                          วันที่สิ้นสุด
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700">
                          จำนวนวัน
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700">
                          เหตุผล
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700">
                          สถานะ
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700 text-center">
                          การดำเนินการ
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requests.map((req, index) => {
                        return (
                          <TableRow
                            key={req.id || index}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <TableCell className="text-gray-500">
                              {index + 1}
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-gray-600">
                                {new Date(req.createdAt).toLocaleDateString(
                                  "th-TH",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  }
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">
                              <Badge
                                variant="outline"
                                className={`${getLeaveTypeColor(
                                  req.leaveType
                                )} border`}
                              >
                                {translateLeaveType(req.leaveType)?.th || req.leaveType}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                                {new Date(req.startDate).toLocaleDateString(
                                  "th-TH",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  }
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                                {new Date(req.endDate).toLocaleDateString(
                                  "th-TH",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  }
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                                {calculateDuration(req.startDate, req.endDate, req.leaveDays)}{" "}
                                {req.leaveSession === "MORNING" ? "(เช้า)" : 
                                 req.leaveSession === "AFTERNOON" ? "(บ่าย)" : 
                                 req.leaveDays === 0.5 ? "(ครึ่ง)" : ""} วัน
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-gray-600 max-w-xs truncate block" title={req.reason}>
                                {req.reason || "-"}
                              </span>
                            </TableCell>
                            <TableCell>{getStatusBadge(req.status)}</TableCell>
                            <TableCell className="text-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-600 hover:text-gray-800"
                                title={`ดูรายละเอียดใบลา #${req.id}`}
                                onClick={() => handleViewDetails(req)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                ดูรายละเอียด
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-xl text-gray-500 font-medium">
                  ยังไม่มีประวัติการลา
                </p>
                <p className="text-gray-400 mt-2">
                  เมื่อคุณยื่นใบลา ประวัติจะแสดงที่นี่
                </p>
                <Button 
                  className="mt-6 bg-green-600 hover:bg-green-700"
                  asChild
                >
                  <Link to="/employee/request-leave">
                    <FileText className="h-4 w-4 mr-2" />
                    ยื่นใบลาใหม่
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default MyLeaveRequestPage;