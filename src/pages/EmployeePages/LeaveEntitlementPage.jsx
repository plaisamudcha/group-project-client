import employeeApi from "@/src/api/employeeApi";
import { Card, CardHeader, CardTitle, ErrorMessage, LoadingSpinner, Progress } from "@/src/components/SianUi";
import { useEffect, useState } from "react";

function LeaveEntitlementPage() {
   const [entitlements, setEntitlements] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await employeeApi.getLeaveEntitlements();
            setEntitlements(response.data);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const renderContent = () => {
        if (isLoading) return <LoadingSpinner />;
        if (error) return <ErrorMessage message={error} onRetry={fetchData} />;
        if (!entitlements || entitlements.length === 0) return <p className="text-center text-muted-foreground p-8">ไม่พบข้อมูลสิทธิ์วันลา</p>;
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {entitlements.map((item, index) => {
                    const remaining = item.total - item.used;
                    const percentage = item.total > 0 ? (remaining / item.total) * 100 : 0;
                    return (
                        <Card key={index}>
                            <CardHeader><CardTitle className="text-base">{item.type}</CardTitle></CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold text-card-foreground">{remaining}<span className="text-base font-normal text-muted-foreground"> / {item.total} วัน</span></p>
                                <Progress value={percentage} className="mt-2 h-1.5" />
                                <p className="text-xs text-muted-foreground mt-2">ใช้ไปแล้ว {item.used} วัน</p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        );
    };
  return (
     <Card className="w-full max-w-4xl animate-fade-in">
            <CardHeader><CardTitle className="flex items-center text-xl"><Home className="mr-3 text-primary" />สิทธิ์วันลาคงเหลือ</CardTitle><CardDescription>สรุปสิทธิ์วันลาคงเหลือประจำปีของคุณ</CardDescription></CardHeader>
            <CardContent>{renderContent()}</CardContent>
        </Card>
  )
}
export default LeaveEntitlementPage;
