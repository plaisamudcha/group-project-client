import {
  Card,
  CardHeader,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import employeeApi from "@/src/api/employeeApi";
import { AlertTriangle, CalendarIcon, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

function CompanyHolidayPage() {
  const [groupedHolidays, setGroupedHolidays] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await employeeApi.getHolidays();
      const sortedHolidays = response.data.holiday.sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );

      const holidaysByMonth = sortedHolidays.reduce((acc, holiday) => {
        const month = new Date(holiday.date).toLocaleString("th-TH", {
          month: "long",
          year: "numeric",
        });
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

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6">
        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center">
            <Skeleton className="h-10 w-1/3 mx-auto mb-2" />
            <Skeleton className="h-4 w-1/2 mx-auto" />
          </CardHeader>
          <CardContent className="space-y-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-8 w-1/4" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, j) => (
                    <Skeleton key={j} className="h-20 w-full" />
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error)
    return (
      <div className="w-full max-w-6xl mx-auto p-6">
        <Alert variant="destructive" className="border-red-200 shadow-lg">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>เกิดข้อผิดพลาด!</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="w-full max-w-6xl mx-auto">
        <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <div className="flex items-center justify-center mb-4">
              <Calendar className="h-8 w-8 mr-3" />
              <CardTitle className="text-3xl font-bold">
                วันหยุดบริษัท
              </CardTitle>
            </div>
            <CardDescription className="text-blue-100 text-lg">
              รายการวันหยุดประจำปี สำหรับพนักงานทุกคน
            </CardDescription>
          </CardHeader>

          <div className="max-h-[70vh] overflow-y-auto">
            <CardContent className="p-8">
              <div className="space-y-12">
                {Object.keys(groupedHolidays).length > 0 ? (
                  Object.entries(groupedHolidays).map(
                    ([month, holidaysInMonth]) => (
                      <div key={month} className="animate-fade-in">
                        <div className="flex items-center mb-6">
                          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                          <h3 className="text-2xl font-bold text-gray-800 px-6 bg-white">
                            {month}
                          </h3>
                          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {holidaysInMonth.map((holiday, index) => {
                            const holidayDate = new Date(holiday.date);
                            const isToday =
                              new Date().toDateString() ===
                              holidayDate.toDateString();
                            const isPast = holidayDate < new Date();

                            return (
                              <div
                                key={index}
                                className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                                  isToday
                                    ? "border-yellow-400 bg-gradient-to-br from-yellow-50 to-yellow-100 shadow-yellow-200"
                                    : isPast
                                    ? "border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 opacity-75"
                                    : "border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 hover:border-blue-400"
                                }`}
                              >
                                {isToday && (
                                  <Badge className="absolute top-2 right-2 bg-yellow-500 text-white animate-pulse">
                                    วันนี้
                                  </Badge>
                                )}

                                <div className="p-6">
                                  <div className="flex items-start space-x-4">
                                    <div
                                      className={`flex flex-col items-center justify-center p-3 rounded-lg ${
                                        isToday
                                          ? "bg-yellow-200"
                                          : isPast
                                          ? "bg-gray-200"
                                          : "bg-blue-200"
                                      }`}
                                    >
                                      <span
                                        className={`text-2xl font-bold ${
                                          isToday
                                            ? "text-yellow-800"
                                            : isPast
                                            ? "text-gray-600"
                                            : "text-blue-800"
                                        }`}
                                      >
                                        {holidayDate.getDate()}
                                      </span>
                                      <span
                                        className={`text-xs font-medium ${
                                          isToday
                                            ? "text-yellow-600"
                                            : isPast
                                            ? "text-gray-500"
                                            : "text-blue-600"
                                        }`}
                                      >
                                        {holidayDate.toLocaleString("th-TH", {
                                          month: "short",
                                        })}
                                      </span>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                      <h4
                                        className={`font-bold text-lg leading-tight mb-2 ${
                                          isToday
                                            ? "text-yellow-800"
                                            : isPast
                                            ? "text-gray-600"
                                            : "text-gray-800"
                                        }`}
                                      >
                                        {holiday.name}
                                      </h4>
                                      <p
                                        className={`text-sm ${
                                          isToday
                                            ? "text-yellow-600"
                                            : isPast
                                            ? "text-gray-500"
                                            : "text-gray-600"
                                        }`}
                                      >
                                        {holidayDate.toLocaleString("th-TH", {
                                          weekday: "long",
                                        })}
                                      </p>

                                      {/* แสดงจำนวนวันที่เหลือ */}
                                      {!isPast && !isToday && (
                                        <div className="mt-2">
                                          <span className="text-xs text-blue-600 font-medium">
                                            อีก{" "}
                                            {Math.ceil(
                                              (holidayDate - new Date()) /
                                                (1000 * 60 * 60 * 24)
                                            )}{" "}
                                            วัน
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Decorative elements */}
                                <div
                                  className={`absolute top-0 right-0 w-20 h-20 opacity-10 transform rotate-12 translate-x-6 -translate-y-6 ${
                                    isToday
                                      ? "text-yellow-400"
                                      : isPast
                                      ? "text-gray-400"
                                      : "text-blue-400"
                                  }`}
                                >
                                  <CalendarIcon className="w-full h-full" />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )
                  )
                ) : (
                  <div className="text-center py-16">
                    <CalendarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-xl text-gray-500 font-medium">
                      ไม่พบข้อมูลวันหยุด
                    </p>
                    <p className="text-gray-400 mt-2">
                      กรุณาติดต่อแผนกบุคคลเพื่อสอบถามข้อมูลเพิ่มเติม
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </div>
        </Card>
      </div>
    </div>
  );
}
export default CompanyHolidayPage;
