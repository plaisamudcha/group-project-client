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
} from "lucide-react";
import { useEffect, useState } from "react";
import employeeApi from "@/src/api/employeeApi";
import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

function MyLeaveRequestPage() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await employeeApi.getLeaveRequests();
      setRequests(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "ไม่สามารถโหลดข้อมูลได้");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStatusBadge = (status) => {
    const variants = {
      Approved: "default",
      Pending: "secondary",
      Rejected: "destructive",
    };
    const icons = {
      Approved: <CheckCircle className="mr-1 h-3 w-3" />,
      Pending: <Clock className="mr-1 h-3 w-3" />,
      Rejected: <XCircle className="mr-1 h-3 w-3" />,
    };
    const colors = {
      Approved:
        "bg-green-100 text-green-800 border-green-200 hover:bg-green-200",
      Pending:
        "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200",
      Rejected: "bg-red-100 text-red-800 border-red-200 hover:bg-red-200",
    };

    return (
      <Badge
        variant={variants[status] || "outline"}
        className={`${colors[status]} transition-colors duration-200`}
      >
        {icons[status]}
        {status === "Approved"
          ? "อนุมัติ"
          : status === "Pending"
          ? "รอพิจารณา"
          : "ไม่อนุมัติ"}
      </Badge>
    );
  };

  const getLeaveTypeColor = (leaveType) => {
    const colors = {
      ลาป่วย: "bg-red-50 text-red-700 border-red-200",
      ลาพักผ่อน: "bg-blue-50 text-blue-700 border-blue-200",
      ลากิจ: "bg-green-50 text-green-700 border-green-200",
      ลาคลอด: "bg-pink-50 text-pink-700 border-pink-200",
      ลาพิเศษ: "bg-purple-50 text-purple-700 border-purple-200",
    };
    return colors[leaveType] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto p-6">
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
    );
  }

  if (error)
    return (
      <div className="w-full max-w-7xl mx-auto p-6">
        <Alert variant="destructive" className="border-red-200 shadow-lg">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>เกิดข้อผิดพลาด!</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );

  // คอมโพเนนต์ต้อง return JSX ออกมา
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
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
          </CardHeader>

          <CardContent className="p-8">
            {requests.length > 0 ? (
              <div className="space-y-6">
                {/* สถิติโดยรวม */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm">อนุมัติแล้ว</p>
                        <p className="text-2xl font-bold">
                          {
                            requests.filter((r) => r.status === "Approved")
                              .length
                          }
                        </p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-200" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-yellow-100 text-sm">รอพิจารณา</p>
                        <p className="text-2xl font-bold">
                          {
                            requests.filter((r) => r.status === "Pending")
                              .length
                          }
                        </p>
                      </div>
                      <Clock className="h-8 w-8 text-yellow-200" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-red-100 text-sm">ไม่อนุมัติ</p>
                        <p className="text-2xl font-bold">
                          {
                            requests.filter((r) => r.status === "Rejected")
                              .length
                          }
                        </p>
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
                          สถานะ
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700 text-center">
                          การดำเนินการ
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requests.map((req) => (
                        <TableRow
                          key={req.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <TableCell className="font-medium">
                            <Badge
                              variant="outline"
                              className={`${getLeaveTypeColor(
                                req.leaveType
                              )} border`}
                            >
                              {req.leaveType}
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
                              {calculateDuration(req.startDate, req.endDate)}{" "}
                              วัน
                            </span>
                          </TableCell>
                          <TableCell>{getStatusBadge(req.status)}</TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-600 hover:text-gray-800"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              ดูรายละเอียด
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
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
                <Button className="mt-6 bg-green-600 hover:bg-green-700">
                  <FileText className="h-4 w-4 mr-2" />
                  ยื่นใบลาใหม่
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} // สิ้นสุดฟังก์ชัน MyLeaveRequest

export default MyLeaveRequestPage;
