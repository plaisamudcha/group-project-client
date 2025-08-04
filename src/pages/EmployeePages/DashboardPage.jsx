import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
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
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  PlusCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import employeeApi from "@/src/api/employeeApi";
import { Link } from "react-router";
import { translateLeaveType } from "@/lib/translateLeaveType";

export function DashboardPage() {
  const [dashboardData, setDashboardData] = useState({
    entitlements: [],
    requests: [],
    holidays: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [entitlementsRes, requestsRes, holidaysRes] = await Promise.all([
          employeeApi.getLeaveEntitlements(),
          employeeApi.getLeaveRequests(),
          employeeApi.getHolidays(),
        ]);

        setDashboardData({
          entitlements:
            entitlementsRes.data.entitlements || entitlementsRes.data,
          requests: (requestsRes.data.leavedata || requestsRes.data).slice(
            0,
            3
          ),
          holidays: (holidaysRes.data.holiday || holidaysRes.data)
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .filter((h) => new Date(h.date) >= new Date())
            .slice(0, 4),
        });
      } catch (err) {
        setError(
          err.response?.data?.message || "ไม่สามารถโหลดข้อมูลแดชบอร์ดได้"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusBadge = (status) => {
    const variants = {
      APPROVED: "success",
      PENDING: "default",
      REJECTED: "destructive",
    };
    const icons = {
      APPROVED: <CheckCircle className="mr-1 h-3 w-3" />,
      PENDING: <Clock className="mr-1 h-3 w-3" />,
      REJECTED: <XCircle className="mr-1 h-3 w-3" />,
    };
    return (
      <Badge variant={variants[status] || "outline"}>
        {icons[status]}
        {status}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-2/4" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-2 w-full" />
                <Skeleton className="h-4 w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-72 w-full" />
          <Skeleton className="h-72 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-screen-md mx-auto">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>เกิดข้อผิดพลาด!</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6 space-y-6 animate-fade-in">
      {/* Section: Leave Summary */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4">ภาพรวมวันลา</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {dashboardData.entitlements.map((item, index) => {
            const total = item.entitledDays;
            const used = item.usedDays || 0; // ✅ ใช้จาก backend
            const remaining = total - used;
            const percentage = total > 0 ? (used / total) * 100 : 0;

            return (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-base font-medium">
                    {translateLeaveType(item.leaveType)?.th || item.leaveType}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    {remaining}
                    <span className="text-lg font-normal text-muted-foreground">
                      {" "}
                      / {total} วัน
                    </span>
                  </p>
                  <Progress value={percentage} className="mt-3" />
                  <p className="text-xs text-muted-foreground mt-2">
                    ใช้ไปแล้ว {used} วัน
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Section: Latest Requests + Holidays */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Leave Requests */}
        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>ประวัติการลาล่าสุด</CardTitle>
              <CardDescription>แสดงรายการใบลาล่าสุด 3 รายการ</CardDescription>
            </div>
            <Button asChild>
              <Link to="/employee/request-leave">
                <PlusCircle className="mr-2 h-4 w-4" />
                ยื่นใบลา
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ประเภท</TableHead>
                  <TableHead>วันที่</TableHead>
                  <TableHead className="text-right">สถานะ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboardData.requests.length > 0 ? (
                  dashboardData.requests.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell className="font-medium">
                        {translateLeaveType(req.leaveType)?.th || req.leaveType}
                      </TableCell>
                      <TableCell>
                        {new Date(req.startDate).toLocaleDateString("th-TH", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        {getStatusBadge(req.status)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center h-24">
                      ไม่พบข้อมูลใบลา
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/employee/leave-requests">ดูประวัติทั้งหมด</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Upcoming Holidays */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>วันหยุดที่ใกล้จะถึง</CardTitle>
            <CardDescription>แสดงรายการวันหยุดที่กำลังจะมาถึง</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashboardData.holidays.length > 0 ? (
              dashboardData.holidays.map((holiday, index) => (
                <div key={index} className="flex items-center">
                  <div className="flex flex-col items-center justify-center bg-muted text-muted-foreground rounded-md h-12 w-12 mr-4">
                    <span className="text-xs font-bold">
                      {new Date(holiday.date).toLocaleString("th-TH", {
                        month: "short",
                      })}
                    </span>
                    <span className="text-lg font-bold">
                      {new Date(holiday.date).getDate()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">{holiday.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(holiday.date).toLocaleDateString("th-TH", {
                        weekday: "long",
                      })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-sm text-muted-foreground py-4">
                ไม่มีวันหยุดที่ใกล้จะถึง
              </p>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/employee/holidays">ดูวันหยุดทั้งหมด</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default DashboardPage;
