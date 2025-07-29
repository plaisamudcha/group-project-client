import employeeApi from "@/src/api/employeeApi";
import { Card, CardHeader, CardTitle, ErrorMessage, LoadingSpinner } from "@/src/components/SianUi";
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
            setHolidays(response.data);
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
        if (!holidays || holidays.length === 0) return <p className="text-center text-muted-foreground p-8">ไม่พบข้อมูลวันหยุดบริษัท</p>;
        return (
             <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {holidays.map((holiday, index) => (
                    <div key={index} className="flex items-center justify-between bg-accent/50 p-3 rounded-md">
                        <div><p className="font-semibold text-sm text-accent-foreground">{holiday.name}</p><p className="text-xs text-muted-foreground">{new Date(holiday.date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</p></div>
                        <CalendarIcon className="text-muted-foreground" size={20}/>
                    </div>
                ))}
            </div>
        );
    };
  return (
      <Card className="w-full max-w-4xl animate-fade-in">
          <CardHeader><CardTitle className="flex items-center text-xl"><CalendarIcon className="mr-3 text-primary" />วันหยุดบริษัท</CardTitle><CardDescription>ตรวจสอบวันหยุดบริษัททั้งหมด</CardDescription></CardHeader>
          <CardContent>{renderContent()}</CardContent>
      </Card>
  );
}
export default CompanyHolidayPage;
