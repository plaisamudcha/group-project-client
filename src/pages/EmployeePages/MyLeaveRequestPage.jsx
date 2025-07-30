import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Clock, XCircle, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import employeeApi from "@/src/api/employeeApi";


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

    useEffect(() => { fetchData(); }, []);

    const getStatusBadge = (status) => {
        const variants = {
            Approved: "success",
            Pending: "default",
            Rejected: "destructive",
        };
        const icons = {
            Approved: <CheckCircle className="mr-1 h-3 w-3" />,
            Pending: <Clock className="mr-1 h-3 w-3" />,
            Rejected: <XCircle className="mr-1 h-3 w-3" />,
        };
        return <Badge variant={variants[status] || "outline"}>{icons[status]}{status}</Badge>;
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/3 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </CardContent>
            </Card>
        );
    }
    
    if (error) return <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertTitle>เกิดข้อผิดพลาด!</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>;


  // คอมโพเนนต์ต้อง return JSX ออกมา
  return (
        <Card className="animate-fade-in">
            <CardHeader>
                <CardTitle className="flex items-center"><FileText className="mr-2 h-5 w-5" />ประวัติการลา</CardTitle>
                <CardDescription>ตรวจสอบสถานะใบลาที่เคยยื่นทั้งหมด</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ประเภท</TableHead>
                            <TableHead>วันที่เริ่ม</TableHead>
                            <TableHead>วันที่สิ้นสุด</TableHead>
                            <TableHead className="text-right">สถานะ</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {requests.length > 0 ? requests.map((req) => (
                            <TableRow key={req.id}>
                                <TableCell className="font-medium">{req.type}</TableCell>
                                <TableCell>{new Date(req.startDate).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' })}</TableCell>
                                <TableCell>{new Date(req.endDate).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' })}</TableCell>
                                <TableCell className="text-right">{getStatusBadge(req.status)}</TableCell>
                            </TableRow>
                        )) : (
                            <TableRow><TableCell colSpan="4" className="text-center h-24">ไม่พบข้อมูลใบลา</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}; // สิ้นสุดฟังก์ชัน MyLeaveRequest

export default MyLeaveRequestPage;