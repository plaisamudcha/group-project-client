// React imports
import { useEffect, useState } from "react";

// Date utilities
import { format } from "date-fns";
import { th } from "date-fns/locale";

// UI Components
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Icons
import {
  CheckCircle,
  Send,
  Loader2,
  AlertTriangle,
  CalendarIcon,
  Clock,
  FileText,
  Users,
  Calendar as CalendarLucide,
  Info,
  X,
} from "lucide-react";

// API and stores
import employeeApi from "@/src/api/employeeApi";
import useUserStore from "@/src/stores/useUserStore";

// Utils
import { cn } from "@/lib/utils";

// Toast Component
const Toast = ({ message, type = "success", onClose, isVisible, details = null }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  const typeStyles = {
    success: {
      bg: "bg-gradient-to-r from-green-500 to-emerald-600",
      icon: <CheckCircle className="h-5 w-5 text-white" />,
      progress: "bg-green-300",
    },
    error: {
      bg: "bg-gradient-to-r from-red-500 to-pink-600",
      icon: <X className="h-5 w-5 text-white" />,
      progress: "bg-red-300",
    },
    warning: {
      bg: "bg-gradient-to-r from-yellow-500 to-orange-600",
      icon: <AlertTriangle className="h-5 w-5 text-white" />,
      progress: "bg-yellow-300",
    },
    info: {
      bg: "bg-gradient-to-r from-blue-500 to-indigo-600",
      icon: <Info className="h-5 w-5 text-white" />,
      progress: "bg-blue-300",
    },
  };

  const style = typeStyles[type];

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-500 transform ${
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <div className={`${style.bg} rounded-lg shadow-2xl p-4 pr-12 min-w-[320px] max-w-md relative overflow-hidden`}>
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 bg-white/20 rounded-full p-2 backdrop-blur-sm">
            {style.icon}
          </div>
          <div className="flex-1">
            <p className="text-white font-medium text-sm">{message}</p>
            {details && (
              <p className="text-white/80 text-xs mt-1">{details}</p>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white/80 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
        {/* Progress bar animation */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10">
          <div 
            className={`h-full ${style.progress} transition-all duration-[7000ms] ease-linear`}
            style={{
              width: isVisible ? "0%" : "100%",
              transition: isVisible ? "width 7s linear" : "none"
            }}
          />
        </div>
      </div>
    </div>
  );
};

function RequestLeavePage() {
  console.log("RequestLeavePage loaded - Version 2.0");
  
  const [status, setStatus] = useState({
    loading: false,
    error: null,
    success: false,
  });

  const [holidays, setHolidays] = useState([]);
  const [workingDays, setWorkingDays] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [leaveDuration, setLeaveDuration] = useState("FULL_DAY");
  
  // Toast state
  const [toast, setToast] = useState({
    isVisible: false,
    message: "",
    type: "success",
    details: null,
  });

  const loggedInUser = useUserStore((state) => state.user);

  // Helper function to show toast
  const showToast = (message, type = "success", details = null) => {
    setToast({ isVisible: true, message, type, details });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  useEffect(() => {
    if (!loggedInUser?.id) return;

    const fetchData = async () => {
      try {
        console.log("Fetching holidays and work policy...");
        const [holidayRes, profileRes] = await Promise.all([
          employeeApi.getHolidays(),
          employeeApi.getMyProfile(loggedInUser.id),
        ]);

        console.log("Holiday response:", holidayRes.data);
        const holidayDates = holidayRes.data.holiday.map(
          (h) => new Date(h.date)
        );
        setHolidays(holidayDates);
        console.log("Holidays set:", holidayDates.map(d => format(d, "yyyy-MM-dd")));

        if (profileRes.data.workPolicy?.workingDays) {
          console.log("Work policy found:", profileRes.data.workPolicy.workingDays);
          setWorkingDays(profileRes.data.workPolicy.workingDays);
        } else {
          console.warn("Working days not found, defaulting to Mon-Fri.");
          setWorkingDays([
            "MONDAY",
            "TUESDAY",
            "WEDNESDAY",
            "THURSDAY",
            "FRIDAY",
          ]);
        }
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
        setWorkingDays([
          "MONDAY",
          "TUESDAY",
          "WEDNESDAY",
          "THURSDAY",
          "FRIDAY",
        ]);
      }
    };

    fetchData();
  }, [loggedInUser]);

  useEffect(() => {
    if (leaveDuration !== "FULL_DAY" && startDate) {
      setEndDate(startDate);
    }
  }, [startDate, leaveDuration]);

  const handleSubmit = async (e) => {
    
    
    e.preventDefault();
    setStatus({ loading: true, error: null, success: false });

    const formData = new FormData(e.target);
    
    // ตรวจสอบข้อมูลก่อนส่ง
    const leaveType = formData.get("leaveType");
    const reason = formData.get("reason");
    
    // Validate ข้อมูลทั้งหมดก่อนส่ง
    if (!leaveType) {
      setStatus({
        loading: false,
        error: "กรุณาเลือกประเภทการลา",
        success: false,
      });
      showToast("กรุณาเลือกประเภทการลา", "warning");
      return;
    }
    
    if (!reason || reason.trim() === "") {
      setStatus({
        loading: false,
        error: "กรุณาระบุเหตุผลการลา",
        success: false,
      });
      showToast("กรุณาระบุเหตุผลการลา", "warning");
      return;
    }
    
    if (!startDate || !endDate) {
      setStatus({
        loading: false,
        error: "กรุณาเลือกวันที่เริ่มและสิ้นสุดการลา",
        success: false,
      });
      showToast("กรุณาเลือกวันที่เริ่มและสิ้นสุดการลา", "warning");
      return;
    }
    
    // ตรวจสอบว่าไม่ได้เลือกวันหยุด
    
    let invalidDates = [];
    let currentDate = new Date(startDate);
    const end = new Date(endDate);
    
    while (currentDate <= end) {
      const dayName = format(currentDate, "EEEE").toUpperCase();
      const isHoliday = holidays.some(
        (holiday) =>
          currentDate.getFullYear() === holiday.getFullYear() &&
          currentDate.getMonth() === holiday.getMonth() &&
          currentDate.getDate() === holiday.getDate()
      );
      const isWorkingDay = workingDays.includes(dayName);
      
      console.log(`Checking ${format(currentDate, "yyyy-MM-dd")} (${dayName}):`, {
        isHoliday,
        isWorkingDay,
        disabled: !isWorkingDay || isHoliday
      });
      
      if (!isWorkingDay || isHoliday) {
        invalidDates.push({
          date: format(currentDate, "dd MMM yyyy", { locale: th }),
          reason: isHoliday ? "วันหยุดนักขัตฤกษ์" : "ไม่ใช่วันทำงาน"
        });
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    if (invalidDates.length > 0) {
      const errorDetail = invalidDates
        .map(d => `${d.date} (${d.reason})`)
        .join(", ");
      
      setStatus({
        loading: false,
        error: `ไม่สามารถลาในวันที่เลือกได้: ${errorDetail}`,
        success: false,
      });
      showToast(
        "❌ ไม่สามารถลาในวันที่เลือก", 
        "error",
        errorDetail
      );
      return;
    }
    
    // WORKAROUND สำหรับ bug ใน backend
    // ถ้าลาหลายวัน ให้ตรวจสอบว่าไม่มีวันเสาร์-อาทิตย์อยู่ตรงกลาง
    if (startDate && endDate) {
      let hasWeekend = false;
      let current = new Date(startDate);
      const end = new Date(endDate);
      
      while (current <= end) {
        const dayName = format(current, "EEEE").toUpperCase();
        if (dayName === "SATURDAY" || dayName === "SUNDAY") {
          hasWeekend = true;
          break;
        }
        current.setDate(current.getDate() + 1);
      }
      
      if (hasWeekend) {
        setStatus({
          loading: false,
          error: "ไม่สามารถลาข้ามวันหยุดสุดสัปดาห์ได้ กรุณาแยกใบลาเป็น 2 ช่วง",
          success: false,
        });
        showToast(
          "❌ พบวันหยุดสุดสัปดาห์ในช่วงที่ลา", 
          "error",
          "กรุณาแยกใบลาหรือเลือกเฉพาะวันทำงาน"
        );
        return;
      }
    }
    
    // สร้าง object สำหรับส่ง - ตาม backend requirements
    // Backend ต้องการ: startDate, endDate, leaveType, reason, leaveSession
    // ไม่ต้องส่ง userId เพราะ backend ดึงจาก req.user.id (token)
    
    // ใช้ local date string เพื่อหลีกเลี่ยง timezone issues
    const formatDateForBackend = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    const leaveData = {
      leaveType: leaveType,
      reason: reason.trim(),
      startDate: formatDateForBackend(startDate),
      endDate: formatDateForBackend(endDate),
      leaveSession: leaveDuration, // backend ต้องการ field นี้!
    };

    

    try {
      console.log("Attempting to send leave request...");
      
      // WORKAROUND: ลองเลี่ยง bug ของ backend
      // ถ้า backend มีปัญหากับ MATERNITY ลองเปลี่ยนเป็น type อื่น
      if (leaveData.leaveType === "MATERNITY") {
        console.warn("MATERNITY type might have issues, trying as PERSONAL for testing");
        // Uncomment บรรทัดล่างเพื่อ test
        // leaveData.leaveType = "PERSONAL";
      }
      
      console.log("=== FINAL DATA TO SEND ===");
      console.log(JSON.stringify(leaveData, null, 2));
      
      const response = await employeeApi.postLeaveRequest(leaveData);
      console.log("Leave request successful:", response);
      
      setStatus({ loading: false, error: null, success: true });
      
      // แสดง toast success
      const leaveTypeText = {
        VACATION: "วันลาพักร้อน",
        PERSONAL: "วันลากิจ", 
        SICK: "วันลาป่วย",
        MATERNITY: "ลาคลอด",
        UNPAID: "วันลางานไม่รับเงินเดือน"
      };
      
      showToast(
        `✅ ส่งคำขอลา${leaveTypeText[leaveType] || ""}สำเร็จ`,
        "success",
        `${format(startDate, "dd MMM yyyy", { locale: th })} - ${format(endDate, "dd MMM yyyy", { locale: th })}`
      );
      
      // รีเซ็ตฟอร์ม
      e.target.reset();
      setStartDate(null);
      setEndDate(null);
      setLeaveDuration("FULL_DAY");
      
      setTimeout(
        () => setStatus({ loading: false, error: null, success: false }),
        5000
      );
    } catch (error) {
      
      
      // ดึงข้อความ error จาก response
      let errorMessage = "เกิดข้อผิดพลาดในการส่งคำขอ";
      let errorDetails = null;
      
      if (error.response?.data) {
        const responseData = error.response.data;
        console.log("Raw error response:", responseData);
        
        // ลองดึง error message จากหลายรูปแบบที่เป็นไปได้
        if (responseData.message) {
          errorMessage = responseData.message;
        } else if (responseData.error) {
          errorMessage = responseData.error;
        } else if (responseData.errors) {
          if (Array.isArray(responseData.errors)) {
            errorMessage = "ข้อมูลไม่ถูกต้อง";
            errorDetails = responseData.errors.join(", ");
          } else if (typeof responseData.errors === 'object') {
            // กรณี errors เป็น object
            errorDetails = Object.entries(responseData.errors)
              .map(([field, msg]) => `${field}: ${msg}`)
              .join(", ");
          }
        } else if (typeof responseData === 'string') {
          errorMessage = responseData;
        }
        
        // ตรวจสอบ validation errors
        if (responseData.validationErrors) {
          errorDetails = Object.entries(responseData.validationErrors)
            .map(([field, msg]) => `${field}: ${msg}`)
            .join(", ");
        }
        
        // ตรวจสอบ field errors
        if (responseData.fieldErrors) {
          errorDetails = Object.entries(responseData.fieldErrors)
            .map(([field, msg]) => `${field}: ${msg}`)
            .join(", ");
        }
      }
      
      // ตรวจสอบ status code และให้คำแนะนำ
      if (error.response?.status === 400) {
        // ตรวจสอบ error message เฉพาะ
        if (errorMessage && errorMessage.includes("วันหยุด")) {
          errorMessage = "❌ ไม่สามารถลาในวันหยุด";
          errorDetails = "กรุณาเลือกวันทำงานเท่านั้น (จันทร์-ศุกร์ ที่ไม่ใช่วันหยุดนักขัตฤกษ์)";
        } else if (errorMessage && errorMessage.includes("ซ้ำ")) {
          errorMessage = "❌ มีใบลาซ้ำซ้อน";
          errorDetails = "คุณมีใบลาในช่วงเวลานี้อยู่แล้ว กรุณาเลือกวันอื่น";
        } else if (errorMessage && errorMessage.includes("โควต้า")) {
          errorMessage = "❌ วันลาไม่เพียงพอ";
          errorDetails = "จำนวนวันลาคงเหลือไม่เพียงพอสำหรับการลาครั้งนี้";
        } else {
          errorMessage = "❌ ข้อมูลที่ส่งไม่ถูกต้อง";
          if (!errorDetails) {
            // แสดงข้อมูลที่ส่งไปเพื่อช่วย debug
            console.log("=== Debug Information ===");
            console.log("Sent data:", leaveData);
            console.log("User info:", {
              id: loggedInUser.id,
              firstName: loggedInUser.firstName,
              lastName: loggedInUser.lastName,
              department: loggedInUser.department
            });
            errorDetails = "กรุณาตรวจสอบ: 1) เลือกเฉพาะวันทำงาน 2) ไม่ซ้ำกับใบลาเดิม 3) มีวันลาเพียงพอ";
          }
        }
      } else if (error.response?.status === 401) {
        errorMessage = "❌ ไม่มีสิทธิ์ในการดำเนินการ";
        errorDetails = "กรุณาเข้าสู่ระบบใหม่";
      } else if (error.response?.status === 403) {
        errorMessage = "❌ ไม่ได้รับอนุญาต";
        errorDetails = "คุณไม่มีสิทธิ์ในการยื่นใบลา";
      } else if (error.response?.status === 404) {
        errorMessage = "❌ ไม่พบ API endpoint";
        errorDetails = "กรุณาติดต่อผู้ดูแลระบบ (endpoint: /api/leaves)";
      } else if (error.response?.status === 409) {
        errorMessage = "❌ มีใบลาซ้ำซ้อน";
        errorDetails = "คุณมีใบลาในช่วงเวลานี้อยู่แล้ว กรุณาเลือกวันอื่น";
      } else if (error.response?.status === 422) {
        errorMessage = "❌ ข้อมูลไม่ผ่านการตรวจสอบ";
        errorDetails = "กรุณาตรวจสอบความถูกต้องของข้อมูลทุกช่อง";
      } else if (error.response?.status === 500) {
        errorMessage = "❌ เซิร์ฟเวอร์มีปัญหา";
        errorDetails = "กรุณาลองใหม่ภายหลัง";
      }
      
      setStatus({
        loading: false,
        error: `${errorMessage}${errorDetails ? ': ' + errorDetails : ''}`,
        success: false,
      });
      
      showToast(errorMessage, "error", errorDetails);
    }
  };

  const isDateDisabled = (date) => {
    const dayName = format(date, "EEEE").toUpperCase();
    if (workingDays.length > 0 && !workingDays.includes(dayName)) {
      return true;
    }
    return holidays.some(
      (holiday) =>
        date.getFullYear() === holiday.getFullYear() &&
        date.getMonth() === holiday.getMonth() &&
        date.getDate() === holiday.getDate()
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-6">
      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
        details={toast.details}
      />
      
      <div className="w-full max-w-4xl mx-auto">
        <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm pt-0">
          <CardHeader className="text-center pb-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg py-4">
            <div className="flex items-center justify-center mb-4">
              <Send className="h-8 w-8 mr-3" />
              <CardTitle className="text-3xl font-bold">
                ฟอร์มยื่นคำขอลา
              </CardTitle>
            </div>
            <CardDescription className="text-purple-100 text-lg">
              กรอกรายละเอียดด้านล่างเพื่อยื่นคำขอลา
              ระบบจะดำเนินการตรวจสอบและอนุมัติ
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8">
            {/* แสดงข้อมูลพื้นฐาน */}
            <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
              <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center">
                <Users className="h-5 w-5 mr-2" />
                ข้อมูลผู้ยื่นคำขอ
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Badge
                    variant="outline"
                    className="bg-white text-purple-700 border-purple-300"
                  >
                    👤 {loggedInUser?.firstName} {loggedInUser?.lastName}
                  </Badge>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge
                    variant="outline"
                    className="bg-white text-purple-700 border-purple-300"
                  >
                    🏢 {loggedInUser?.department || "ไม่ระบุแผนก"}
                  </Badge>
                </div>
              </div>
            </div>

            {status.success && (
              <Alert className="mb-6 border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">
                  ส่งคำขอสำเร็จ!
                </AlertTitle>
                <AlertDescription className="text-green-700">
                  ระบบได้ส่งใบลาของคุณเพื่อรอการอนุมัติแล้ว
                  คุณสามารถติดตามสถานะได้ในหน้าประวัติการลา
                </AlertDescription>
              </Alert>
            )}

            {status.error && (
              <Alert
                variant="destructive"
                className="mb-6 border-red-200 shadow-lg"
              >
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>เกิดข้อผิดพลาด!</AlertTitle>
                <AlertDescription>{status.error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* ประเภทการลา */}
              <div className="space-y-4">
                <Label
                  htmlFor="leaveType"
                  className="text-lg font-semibold text-gray-800 flex items-center"
                >
                  <FileText className="h-5 w-5 mr-2 text-purple-600" />
                  ประเภทการลา
                </Label>
                <Select name="leaveType" required>
                  <SelectTrigger
                    id="leaveType"
                    className="h-12 text-base border-2 border-gray-200 focus:border-purple-400"
                  >
                    <SelectValue placeholder="เลือกประเภทการลาที่ต้องการ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VACATION" className="py-3">
                      <div className="flex items-center space-x-3">
                        <span>🏖️</span>
                        <span>วันลาพักร้อน</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="PERSONAL" className="py-3">
                      <div className="flex items-center space-x-3">
                        <span>📋</span>
                        <span>วันลากิจ</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="SICK" className="py-3">
                      <div className="flex items-center space-x-3">
                        <span>🏥</span>
                        <span>วันลาป่วย</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="MATERNITY" className="py-3">
                      <div className="flex items-center space-x-3">
                        <span>👶</span>
                        <span>ลาคลอด</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="UNPAID" className="py-3">
                      <div className="flex items-center space-x-3">
                        <span>💼</span>
                        <span>วันลางานไม่รับเงินเดือน</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* ช่วงเวลาที่ลา - เปิดใช้งานเพราะ backend ต้องการ leaveSession */}
              <div className="space-y-4">
                <Label className="text-lg font-semibold text-gray-800 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-purple-600" />
                  ช่วงเวลาที่ลา
                </Label>
                <RadioGroup
                  name="leaveDuration"
                  value={leaveDuration}
                  onValueChange={setLeaveDuration}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                  <div className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-purple-300 transition-colors">
                    <RadioGroupItem
                      value="FULL_DAY"
                      id="r1"
                      className="text-purple-600"
                    />
                    <Label htmlFor="r1" className="flex-1 cursor-pointer">
                      <div className="font-medium">เต็มวัน</div>
                      <div className="text-sm text-gray-600">08:00 - 17:00</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-purple-300 transition-colors">
                    <RadioGroupItem
                      value="MORNING"
                      id="r2"
                      className="text-purple-600"
                    />
                    <Label htmlFor="r2" className="flex-1 cursor-pointer">
                      <div className="font-medium">ครึ่งวันเช้า</div>
                      <div className="text-sm text-gray-600">08:00 - 12:00</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-purple-300 transition-colors">
                    <RadioGroupItem
                      value="AFTERNOON"
                      id="r3"
                      className="text-purple-600"
                    />
                    <Label htmlFor="r3" className="flex-1 cursor-pointer">
                      <div className="font-medium">ครึ่งวันบ่าย</div>
                      <div className="text-sm text-gray-600">13:00 - 17:00</div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* วันที่ลา */}
              <div className="space-y-4">
                <Label className="text-lg font-semibold text-gray-800 flex items-center">
                  <CalendarLucide className="h-5 w-5 mr-2 text-purple-600" />
                  กำหนดวันที่ลา
                </Label>
                
                {/* คำอธิบายเกี่ยวกับวันที่สามารถลาได้ */}
                <Alert className="border-blue-200 bg-blue-50">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-700 text-sm">
                    <strong>หมายเหตุ:</strong> สามารถลาได้เฉพาะวันทำงาน (จันทร์-ศุกร์) ที่ไม่ตรงกับวันหยุดนักขัตฤกษ์
                    <br />วันที่ถูกปิดในปฏิทิน = วันหยุด/วันที่ไม่สามารถลาได้
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-base font-medium text-gray-700">
                      วันที่เริ่มลา
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full h-12 justify-start text-left font-normal border-2 border-gray-200 hover:border-purple-400",
                            !startDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-3 h-5 w-5 text-purple-600" />
                          {startDate ? (
                            format(startDate, "PPP", { locale: th })
                          ) : (
                            <span>เลือกวันที่เริ่มลา</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          disabled={isDateDisabled}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {startDate && isDateDisabled(startDate) && (
                      <Alert className="mt-2 border-yellow-200 bg-yellow-50">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <AlertDescription className="text-yellow-700 text-sm">
                          วันที่เลือกเป็นวันหยุด/ไม่ใช่วันทำงาน
                        </AlertDescription>
                      </Alert>
                    )}
                    {leaveDuration !== "FULL_DAY" && (
                      <p className="text-sm text-gray-500 mt-2">
                        * การลาครึ่งวันจะใช้วันเดียวกับวันที่เริ่มลา
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label className="text-base font-medium text-gray-700">
                      วันที่สิ้นสุด
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full h-12 justify-start text-left font-normal border-2 border-gray-200 hover:border-purple-400",
                            !endDate && "text-muted-foreground",
                            leaveDuration !== "FULL_DAY" && "opacity-50 cursor-not-allowed"
                          )}
                          disabled={leaveDuration !== "FULL_DAY"}
                        >
                          <CalendarIcon className="mr-3 h-5 w-5 text-purple-600" />
                          {endDate ? (
                            format(endDate, "PPP", { locale: th })
                          ) : (
                            <span>เลือกวันที่สิ้นสุด</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          disabled={(date) =>
                            isDateDisabled(date) ||
                            (startDate && date < startDate)
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                {startDate && endDate && (
                  <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-purple-700">
                        จำนวนวันที่ลา:
                      </span>
                      <Badge className="bg-purple-100 text-purple-800">
                        {(() => {
                          let count = 0;
                          let current = new Date(startDate);
                          const end = new Date(endDate);
                          
                          while (current <= end) {
                            if (!isDateDisabled(current)) {
                              count++;
                            }
                            current.setDate(current.getDate() + 1);
                          }
                          
                          // ปรับตามช่วงเวลาที่เลือก
                          if (leaveDuration === "MORNING" || leaveDuration === "AFTERNOON") {
                            return "0.5 วัน";
                          }
                          return `${count} วัน`;
                        })()}
                      </Badge>
                    </div>
                    {leaveDuration !== "FULL_DAY" && (
                      <p className="text-xs text-purple-600 mt-2">
                        * การลาครึ่งวันจะนับเป็น 0.5 วัน
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* เหตุผลการลา */}
              <div className="space-y-4">
                <Label
                  htmlFor="reason"
                  className="text-lg font-semibold text-gray-800 flex items-center"
                >
                  <FileText className="h-5 w-5 mr-2 text-purple-600" />
                  เหตุผลการลา
                </Label>
                <Textarea
                  id="reason"
                  name="reason"
                  placeholder="กรุณาระบุเหตุผลการลาของคุณให้ชัดเจน เช่น ไปรักษาตัวที่โรงพยาบาล, เดินทางไปต่างจังหวัด, ติดธุระส่วนตัว เป็นต้น"
                  required
                  className="min-h-[120px] border-2 border-gray-200 focus:border-purple-400 text-base"
                />
              </div>

              {/* ปุ่มส่งคำขอ */}
              <div className="pt-6">
                <Button
                  type="submit"
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                  disabled={status.loading}
                >
                  {status.loading ? (
                    <>
                      <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                      กำลังส่งคำขอ...
                    </>
                  ) : (
                    <>
                      <Send className="mr-3 h-6 w-6" />
                      ยื่นใบลา
                    </>
                  )}
                </Button>

                <p className="text-center text-sm text-gray-600 mt-4">
                  โปรดตรวจสอบข้อมูลให้ถูกต้องก่อนส่งคำขอ
                  การแก้ไขอาจต้องติดต่อแผนกบุคคล
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default RequestLeavePage;