import employeeApi from "@/src/api/employeeApi";
import { useEffect, useState } from "react";
import {
    Card, CardHeader, CardTitle, CardDescription, CardContent,
    ErrorMessage,
    LoadingSpinner,
    TableCell,
    TableHead,
    TableRow,
    Table,
} from "@/src/components/SianUi";
import {  CheckCircle, Clock } from "lucide-react";

function RequestLeavePage() {
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
      setError(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved': return <Badge variant="approved"><CheckCircle size={14} className="mr-1" />อนุมัติ</Badge>;
      case 'Pending': return <Badge variant="pending"><Clock size={14} className="mr-1" />รออนุมัติ</Badge>;
      case 'Rejected': return <Badge variant="rejected"><XCircle size={14} className="mr-1" />ไม่อนุมัติ</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };
  
  const renderContent = () => {
    if (isLoading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} onRetry={fetchData} />;
    if (!requests || requests.length === 0) return <p className="text-center text-muted-foreground p-8">ไม่พบข้อมูลใบลา</p>;
    return (
        <Table>
          <TableHeader><TableRow><TableHead>รหัสใบลา</TableHead><TableHead>ประเภท</TableHead><TableHead>วันที่เริ่ม</TableHead><TableHead>วันที่สิ้นสุด</TableHead><TableHead>สถานะ</TableHead></TableRow></TableHeader>
          <TableBody>{requests.map((req) => (<TableRow key={req.id}><TableCell className="font-medium">{req.id}</TableCell><TableCell>{req.type}</TableCell><TableCell>{req.startDate}</TableCell><TableCell>{req.endDate}</TableCell><TableCell>{getStatusBadge(req.status)}</TableCell></TableRow>))}</TableBody>
        </Table>
    );
  };

  return (
    <Card className="w-full max-w-4xl animate-fade-in">
      <CardHeader><CardTitle className="flex items-center text-xl"><FileText className="mr-3 text-primary" />ใบลาของฉัน</CardTitle><CardDescription>ตรวจสอบสถานะใบลาที่เคยยื่นทั้งหมด</CardDescription></CardHeader>
      <CardContent>{renderContent()}</CardContent>
    </Card>
  );
};
export default RequestLeavePage;
