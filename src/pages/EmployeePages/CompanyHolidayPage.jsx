import employeeApi from "@/src/api/employeeApi";
import { CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";


function CompanyHolidayPage() {
    const [holidays, setHolidays] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await employeeApi.getHolidays();
            setHolidays(response.data.sort((a, b) => new Date(a.date) - new Date(b.date)));
        } catch (err) {
            setError(err.response?.data?.message || "ไม่สามารถโหลดข้อมูลได้");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    if (isLoading) {
        return (
             <Card className="w-full max-w-2xl mx-auto">
                <CardHeader>
                    <Skeleton className="h-6 w-1/3 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                </CardContent>
            </Card>
        );
    }
    
    if (error) return <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertTitle>เกิดข้อผิดพลาด!</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>;

       return (
        <Card className="w-full max-w-2xl mx-auto animate-fade-in">
            <CardHeader>
                <CardTitle>วันหยุดบริษัท</CardTitle>
                <CardDescription>รายการวันหยุดประจำปี</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {holidays.length > 0 ? holidays.map((holiday, index) => (
                        <div key={index} className="flex items-center justify-between rounded-md border p-4">
                            <div>
                                <p className="font-medium">{holiday.name}</p>
                                <p className="text-sm text-muted-foreground">
                                    {new Date(holiday.date).toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                            </div>
                            <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                        </div>
                    )) : (
                        <p className="text-center text-muted-foreground pt-4">ไม่พบข้อมูลวันหยุด</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
export default CompanyHolidayPage;
