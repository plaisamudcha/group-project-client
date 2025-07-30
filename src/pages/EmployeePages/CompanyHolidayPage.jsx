import { Card, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import employeeApi from "@/src/api/employeeApi";
import { AlertTriangle, CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { CardContent } from "@/components/ui/card";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { AlertDescription } from "@/components/ui/alert";
import { CardDescription } from "@/components/ui/card";
import { CardTitle } from "@/components/ui/card";


function CompanyHolidayPage() {
    const [groupedHolidays, setGroupedHolidays] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await employeeApi.getHolidays();
            const sortedHolidays = response.data.holiday.sort((a, b) => new Date(a.date) - new Date(b.date));
            
            const holidaysByMonth = sortedHolidays.reduce((acc, holiday) => {
                const month = new Date(holiday.date).toLocaleString('th-TH', { month: 'long', year: 'numeric' });
                if (!acc[month]) {
                    acc[month] = [];
                }
                acc[month].push(holiday);
                return acc;
            }, {});

            setGroupedHolidays(holidaysByMonth);

        } catch (err) {
            setError(err.response?.data?.message || "ไม่สามารถโหลดข้อมูลได้");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    if (isLoading) {
        return (
             <Card className="w-full">
                <CardHeader>
                    <Skeleton className="h-8 w-1/3 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </CardContent>
            </Card>
        );
    }
    
    if (error) return <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertTitle>เกิดข้อผิดพลาด!</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>;

    return (
       <Card className=" max-w-5xl mx-auto animate-fade-in">
            <CardHeader><CardTitle>วันหยุดบริษัท</CardTitle><CardDescription>รายการวันหยุดประจำปี</CardDescription></CardHeader>
            <CardContent>
                <div className="space-y-8">
                    {Object.keys(groupedHolidays).length > 0 ? Object.entries(groupedHolidays).map(([month, holidaysInMonth]) => (
                        <div key={month}>
                            <h3 className="text-xl font-semibold text-primary mb-4 pb-2 border-b">{month}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {holidaysInMonth.map((holiday, index) => (
                                    <div key={index} className="flex items-start space-x-4 rounded-lg border bg-card text-card-foreground p-4 hover:bg-accent hover:text-accent-foreground transition-colors">
                                        <div className="flex flex-col items-center justify-center">
                                            <span className="text-2xl font-bold text-primary">{new Date(holiday.date).getDate()}</span>
                                            <span className="text-xs text-muted-foreground">{new Date(holiday.date).toLocaleString('th-TH', { month: 'short' })}</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold">{holiday.name}</p>
                                            <p className="text-sm text-muted-foreground">{new Date(holiday.date).toLocaleString('th-TH', { weekday: 'long' })}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )) : <p className="text-center text-muted-foreground pt-4">ไม่พบข้อมูลวันหยุด</p>}
                </div>
            </CardContent>
        </Card>
    );
}
export default CompanyHolidayPage;
