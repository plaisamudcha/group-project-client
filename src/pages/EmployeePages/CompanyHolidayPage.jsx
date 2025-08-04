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
import { AlertTriangle, CalendarIcon, Calendar, Sparkles, Clock, MapPin } from "lucide-react";
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
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 p-6">
        <div className="w-full max-w-7xl mx-auto">
          <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-xl">
            <CardHeader className="text-center pb-8">
              <div className="flex items-center justify-center mb-6">
                <div className="relative">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="absolute -top-1 -right-1">
                    <Skeleton className="h-6 w-6 rounded-full" />
                  </div>
                </div>
                <Skeleton className="h-10 w-64 ml-4" />
              </div>
              <Skeleton className="h-6 w-96 mx-auto" />
            </CardHeader>
            <CardContent className="space-y-12 p-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-6">
                  <div className="flex items-center justify-center">
                    <Skeleton className="h-8 w-48" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, j) => (
                      <div key={j} className="space-y-3">
                        <Skeleton className="h-32 w-full rounded-2xl" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
        <Alert variant="destructive" className="border-red-200 shadow-2xl bg-white/90 backdrop-blur-sm">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <AlertTitle className="text-red-800 font-bold">เกิดข้อผิดพลาด!</AlertTitle>
              <AlertDescription className="text-red-700 mt-1">{error}</AlertDescription>
            </div>
          </div>
        </Alert>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-200/30 to-cyan-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-sky-200/30 to-blue-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-indigo-200/20 to-blue-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 p-6">
        <div className="w-full max-w-7xl mx-auto">
          <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-xl pt-0">
            <CardHeader className="text-center pb-8 bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-600 text-white rounded-t-2xl relative overflow-hidden p-3">
              {/* Header background pattern */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 via-sky-600/90 to-cyan-600/90"></div>
              <div className="absolute inset-0 opacity-10">
                <div className="w-full h-full bg-gradient-to-br from-white/10 via-transparent to-white/5"></div>
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-center mb-6">
                  <div className="relative">
                    <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/30">
                      <Calendar className="h-10 w-10 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 p-1 bg-yellow-400 rounded-full">
                      <Sparkles className="h-4 w-4 text-yellow-800" />
                    </div>
                  </div>
                  <div className="ml-6">
                    <CardTitle className="text-4xl font-bold bg-gradient-to-r from-white to-purple-100 bg-clip-text ">
                      วันหยุดบริษัท
                    </CardTitle>
                  </div>
                </div>
                <CardDescription className="text-blue-100 text-xl font-medium">
                  รายการวันหยุดประจำปี สำหรับพนักงานทุกคน
                </CardDescription>
                <div className="mt-4 flex items-center justify-center space-x-6 text-blue-100/80">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">ประเทศไทย</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">อัพเดทล่าสุด: {new Date().toLocaleDateString('th-TH')}</span>
                  </div>
                </div>
              </div>
            </CardHeader>

            <div className="max-h-[75vh] overflow-y-auto">
              <CardContent className="p-8">
                <div className="space-y-16">
                  {Object.keys(groupedHolidays).length > 0 ? (
                    Object.entries(groupedHolidays).map(
                      ([month, holidaysInMonth], monthIndex) => (
                        <div key={month} className="animate-fade-in" style={{animationDelay: `${monthIndex * 0.1}s`}}>
                          <div className="relative mb-8">
                            <div className="absolute inset-0 flex items-center">
                              <div className="w-full border-t-2 border-gradient-to-r from-transparent via-blue-200 to-transparent"></div>
                            </div>
                            <div className="relative flex justify-center">
                              <div className="px-8 py-3 bg-gradient-to-r from-blue-600 to-sky-600 text-white rounded-full shadow-lg">
                                <h3 className="text-2xl font-bold flex items-center">
                                  <Calendar className="h-6 w-6 mr-3" />
                                  {month}
                                </h3>
                              </div>
                            </div>
                            <div className="absolute top-1/2 left-4 transform -translate-y-1/2 w-3 h-3 bg-blue-400 rounded-full"></div>
                            <div className="absolute top-1/2 right-4 transform -translate-y-1/2 w-3 h-3 bg-sky-400 rounded-full"></div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {holidaysInMonth.map((holiday, index) => {
                              const holidayDate = new Date(holiday.date);
                              const isToday =
                                new Date().toDateString() ===
                                holidayDate.toDateString();
                              const isPast = holidayDate < new Date();

                              return (
                                <div
                                  key={index}
                                  className={`group relative overflow-hidden rounded-2xl transition-all duration-500 hover:scale-105 hover:rotate-1 cursor-pointer border-2 ${
                                    isPast 
                                      ? "bg-gradient-to-br from-slate-300 via-slate-400 to-slate-500 shadow-lg shadow-slate-400/20 border-slate-300 opacity-60"
                                      : "bg-gradient-to-br from-sky-500 via-blue-500 to-indigo-500 shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 border-blue-400"
                                  }`}
                                  style={{
                                    backgroundImage: isPast 
                                      ? 'linear-gradient(135deg, #cbd5e1 0%, #94a3b8 50%, #64748b 100%)'
                                      : 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 50%, #6366f1 100%)',
                                    animationDelay: `${index * 0.1}s`
                                  }}
                                >
                                  {/* Strong background overlay to ensure visibility */}
                                  <div className={`absolute inset-0 ${
                                    isPast 
                                      ? "bg-gradient-to-br from-slate-400/80 via-slate-500/80 to-slate-600/80"
                                      : "bg-gradient-to-br from-blue-500/90 via-sky-500/90 to-indigo-500/90"
                                  }`}></div>
                                  
                                  {isToday && (
                                    <Badge className="absolute top-3 right-3 bg-yellow-500/90 text-yellow-900 font-bold z-20 animate-bounce shadow-lg backdrop-blur-sm">
                                      <Sparkles className="h-3 w-3 mr-1" />
                                      วันนี้
                                    </Badge>
                                  )}

                                  <div className="relative z-10 p-6 text-white">
                                    <div className="flex items-start space-x-4">
                                      <div className="relative">
                                        <div className={`flex flex-col items-center justify-center p-4 rounded-2xl backdrop-blur-sm border-2 shadow-lg ${
                                          isPast
                                            ? "bg-white/40 border-white/50 shadow-slate-300/20"
                                            : "bg-white/50 border-white/70 shadow-blue-300/30"
                                        }`}>
                                          <span className={`text-3xl font-black drop-shadow-lg ${
                                            isPast ? 'text-slate-700' : 'text-blue-900'
                                          }`}>
                                            {holidayDate.getDate()}
                                          </span>
                                          <span className={`text-sm font-bold drop-shadow ${
                                            isPast ? 'text-slate-600' : 'text-blue-800'
                                          }`}>
                                            {holidayDate.toLocaleString("th-TH", {
                                              month: "short",
                                            })}
                                          </span>
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white/40 rounded-full"></div>
                                      </div>

                                      <div className="flex-1 min-w-0">
                                        <h4 className={`font-bold text-lg leading-tight mb-3 drop-shadow-lg ${
                                          isPast ? 'text-white/70' : 'text-white'
                                        }`}>
                                          {holiday.name}
                                        </h4>
                                        <p className={`text-sm font-medium mb-3 drop-shadow ${
                                          isPast ? 'text-white/60' : 'text-white/90'
                                        }`}>
                                          {holidayDate.toLocaleString("th-TH", {
                                            weekday: "long",
                                          })}
                                        </p>

                                        {!isPast && !isToday && (
                                          <div className="flex items-center space-x-2">
                                            <div className="p-1 bg-white/20 rounded-full">
                                              <Clock className="h-3 w-3" />
                                            </div>
                                            <span className="text-sm font-bold drop-shadow text-white">
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
                                  <div className="absolute -top-4 -right-4 w-16 h-16 opacity-20 transform rotate-12">
                                    <CalendarIcon className="w-full h-full text-white" />
                                  </div>
                                  <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-white/10 rounded-full"></div>
                                  <div className="absolute top-1/2 -right-1 w-2 h-6 bg-white/20 rounded-full transform rotate-45"></div>
                                  
                                  {/* Hover glow effect */}
                                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-white/5 to-white/10"></div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )
                    )
                  ) : (
                    <div className="text-center py-20">
                      <div className="relative inline-block mb-8">
                        <div className="p-8 bg-gradient-to-br from-blue-100 to-sky-100 rounded-3xl">
                          <CalendarIcon className="h-20 w-20 text-blue-400 mx-auto" />
                        </div>
                        <div className="absolute -top-2 -right-2 p-2 bg-yellow-400 rounded-full">
                          <Sparkles className="h-6 w-6 text-yellow-800" />
                        </div>
                      </div>
                      <h3 className="text-3xl font-bold text-gray-700 mb-4">
                        ไม่พบข้อมูลวันหยุด
                      </h3>
                      <p className="text-gray-500 text-lg mb-2">
                        กรุณาติดต่อแผนกบุคคลเพื่อสอบถามข้อมูลเพิ่มเติม
                      </p>
                      <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-sky-50 rounded-2xl inline-block">
                        <p className="text-blue-600 font-medium">📞 ฝ่ายบุคคล: ext. 100</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default CompanyHolidayPage;