import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { 
  Loader2, 
  XCircle, 
  Users, 
  Clock,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Search,
  Eye,
  Calendar
} from "lucide-react";
import admintoApi from "@/src/api/adminApi";

const currentDate = dayjs();
const currentMonth = currentDate.month() + 1;
const currentYear = currentDate.year();

const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

function AttendanceRecordPage() {
  const [users, setUsers] = useState([]);
  const [allAttendanceData, setAllAttendanceData] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [holidays, setHolidays] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);
  const [error, setError] = useState(null);

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewingUser, setViewingUser] = useState(null);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await admintoApi.getAllUser();
      console.log("Users response:", response);
      setUsers(response.data.users || []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setError("Failed to load user data. Please try again.");
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadHolidays = async () => {
    try {
      const response = await admintoApi.fetchAllholiday();
      console.log("Holidays response:", response);
      
      // ตรวจสอบ response structure
      let holidayData = [];
      if (response && response.data) {
        if (Array.isArray(response.data)) {
          holidayData = response.data;
        } else if (response.data.holiday && Array.isArray(response.data.holiday)) {
          holidayData = response.data.holiday;
        }
      }
      
      setHolidays(holidayData);
      console.log("Processed holidays:", holidayData);
    } catch (error) {
      console.error("Failed to fetch holidays:", error);
      setHolidays([]);
    }
  };

  const loadAllAttendanceData = async () => {
    try {
      setIsLoadingAttendance(true);
      
      const response = await admintoApi.getAllAttendance();
      console.log("All attendance response:", response);
      
      // ตรวจสอบ response structure ตาม database
      let attendanceRecords = [];
      
      if (response && response.data) {
        if (Array.isArray(response.data)) {
          attendanceRecords = response.data;
        } else if (response.data.attendances && Array.isArray(response.data.attendances)) {
          attendanceRecords = response.data.attendances;
        } else {
          console.warn("Unexpected response structure:", response.data);
          attendanceRecords = [];
        }
      }
      
      console.log("Processed attendance records:", attendanceRecords);
      setAllAttendanceData(attendanceRecords);
      
      processAttendanceData(attendanceRecords);
      
    } catch (error) {
      console.error("Failed to fetch attendance data:", error);
      setAllAttendanceData([]);
      setAttendanceData({});
    } finally {
      setIsLoadingAttendance(false);
    }
  };

  const processAttendanceData = (attendanceRecords) => {
    if (!Array.isArray(attendanceRecords)) {
      console.warn("attendanceRecords is not an array:", attendanceRecords);
      setAttendanceData({});
      return;
    }

    const attendanceMap = {};
    
    attendanceRecords.forEach(record => {
      if (!record) return;
      
      const userId = record.userId;
      if (!userId) return;
      
      const recordDate = dayjs(record.date);
      const recordMonth = recordDate.month() + 1;
      const recordYear = recordDate.year();
      
      if (recordMonth === selectedMonth && recordYear === selectedYear) {
        if (!attendanceMap[userId]) {
          attendanceMap[userId] = [];
        }
        attendanceMap[userId].push(record);
      }
    });
    
    console.log("Processed attendance data:", attendanceMap);
    setAttendanceData(attendanceMap);
  };

  // ฟังก์ชันตรวจสอบว่าวันนั้นเป็นวันหยุดหรือไม่
  const isHoliday = (date) => {
    if (!holidays || holidays.length === 0) return false; // เพิ่มการตรวจสอบ
    
    const dateString = dayjs(date).format('YYYY-MM-DD');
    return holidays.some(holiday => {
      const holidayDate = dayjs(holiday.date).format('YYYY-MM-DD');
      return holidayDate === dateString;
    });
  };

  // ฟังก์ชันคำนวณวันทำงานจริง (ไม่รวมเสาร์ อาทิตย์ และวันหยุด)
  const calculateActualWorkingDays = (month, year) => {
    const daysInMonth = dayjs(`${year}-${month}-01`).daysInMonth();
    const firstDay = dayjs(`${year}-${month}-01`);
    let workingDays = 0;
    let weekendDays = 0;
    let holidayDays = 0;
    
    for (let i = 0; i < daysInMonth; i++) {
      const currentDay = firstDay.add(i, 'day');
      const dayOfWeek = currentDay.day();
      
      // ตรวจสอบเสาร์อาทิตย์
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        weekendDays++;
        continue;
      }
      
      // ตรวจสอบวันหยุด
      if (isHoliday(currentDay)) {
        holidayDays++;
        continue;
      }
      
      // ถ้าไม่ใช่เสาร์อาทิตย์ และไม่ใช่วันหยุด
      workingDays++;
    }
    
    console.log(`Working days calculation for ${month}/${year}:`);
    console.log(`- Total days: ${daysInMonth}`);
    console.log(`- Weekend days: ${weekendDays}`);
    console.log(`- Holiday days: ${holidayDays}`);
    console.log(`- Working days: ${workingDays}`);
    console.log(`- Holidays data:`, holidays);
    
    return workingDays;
  };

  // ฟังก์ชันคำนวณวันทำงานสำหรับแต่ละคน (หักวันหยุดที่พนักงานไม่ได้ไปทำงาน)
  const calculatePersonalWorkingDays = (userId, month, year) => {
    const userAttendance = attendanceData[userId] || [];
    const baseWorkingDays = calculateActualWorkingDays(month, year);
    
    // หาวันหยุดที่พนักงานไม่ได้ไปทำงาน
    let holidaysNotWorked = 0;
    
    // ดูว่าในวันหยุดมีการบันทึก attendance หรือไม่
    const monthHolidays = holidays.filter(holiday => {
      const holidayDate = dayjs(holiday.date);
      return holidayDate.month() + 1 === month && holidayDate.year() === year;
    });
    
    monthHolidays.forEach(holiday => {
      const holidayDate = dayjs(holiday.date);
      const holidayRecord = userAttendance.find(record => 
        dayjs(record.date).format('YYYY-MM-DD') === holidayDate.format('YYYY-MM-DD')
      );
      
      // ถ้าไม่มี record หรือ status เป็น ABSENT ในวันหยุด ให้หักออก
      // แต่ในความเป็นจริง วันหยุดไม่ควรหักออกเพิ่ม เพราะ calculateActualWorkingDays หักแล้ว
      // เลยไม่ต้องหักเพิ่ม เว้นแต่ต้องการ logic พิเศษ
    });
    
    // วันทำงานจริงของพนักงาน = วันทำงานพื้นฐาน (ที่หักวันหยุดแล้ว)
    const personalWorkingDays = baseWorkingDays; // ไม่ต้องหักเพิ่ม
    
    console.log(`Personal working days for user ${userId}: ${personalWorkingDays} (base: ${baseWorkingDays})`);
    return Math.max(personalWorkingDays, 0);
  };

  useEffect(() => {
    const loadAllData = async () => {
      await Promise.all([
        loadUsers(),
        loadHolidays(),
        loadAllAttendanceData()
      ]);
    };
    
    loadAllData();
  }, []);

  useEffect(() => {
    if (allAttendanceData.length > 0) {
      processAttendanceData(allAttendanceData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth, selectedYear, holidays]); // เพิ่ม holidays dependency

  const handleRefresh = () => {
    loadUsers();
    loadHolidays();
    loadAllAttendanceData();
  };

  const calculateAttendanceStats = (userId) => {
    const attendance = attendanceData[userId] || [];
    
    if (!Array.isArray(attendance)) {
      return {
        workDays: 0,
        lateCount: 0,
        absentDays: 0,
        onLeaveDays: 0,
        totalDays: 0,
        attendanceRate: 0
      };
    }
    
    // คำนวณสถิติตาม database structure
    const completedDays = attendance.filter(record => 
      record?.status === 'COMPLETED'
    ).length;
    
    const absentDays = attendance.filter(record => 
      record?.status === 'ABSENT'
    ).length;
    
    const lateCount = attendance.filter(record => 
      record?.isLate === 1
    ).length;

    const onLeaveDays = attendance.filter(record => 
      record?.status === 'ON_LEAVE'
    ).length;
    
    // ใช้ฟังก์ชันใหม่ที่คำนวณวันทำงานส่วนบุคคล (หักวันหยุดที่ไม่ได้ทำงาน)
    const personalWorkingDays = calculatePersonalWorkingDays(userId, selectedMonth, selectedYear);
    
    // คำนวณ attendance rate (ไม่นับวันลาเป็นขาดงาน)
    const totalAttendanceDays = completedDays + onLeaveDays;
    const attendanceRate = personalWorkingDays > 0 ? ((totalAttendanceDays / personalWorkingDays) * 100).toFixed(1) : 0;

    return {
      workDays: completedDays,
      lateCount,
      absentDays,
      onLeaveDays,
      totalDays: personalWorkingDays, // ใช้วันทำงานส่วนบุคคล
      attendanceRate
    };
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate overall stats
  const totalEmployees = filteredUsers.length;
  const averageAttendanceRate = filteredUsers.length > 0 
    ? (filteredUsers.reduce((sum, user) => sum + parseFloat(calculateAttendanceStats(user.id).attendanceRate), 0) / filteredUsers.length).toFixed(1)
    : 0;
  const totalLateCount = filteredUsers.reduce((sum, user) => sum + calculateAttendanceStats(user.id).lateCount, 0);
  const totalAbsentDays = filteredUsers.reduce((sum, user) => sum + calculateAttendanceStats(user.id).absentDays, 0);

  // คำนวณสถิติเพิ่มเติม
  const currentMonthWorkingDays = calculateActualWorkingDays(selectedMonth, selectedYear);
  const holidaysInMonth = holidays.filter(holiday => {
    const holidayDate = dayjs(holiday.date);
    return holidayDate.month() + 1 === selectedMonth && holidayDate.year() === selectedYear;
  }).length;

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col justify-center items-center">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button 
            onClick={() => loadUsers()} 
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto p-4 md:px-8 lg:px-12 max-w-7xl">
        
        {/* Header Section */}
        <div className="mb-8 mt-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <Clock className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Attendance Records
              </h1>
              <p className="text-gray-600 mt-1 text-lg">
                Track and monitor employee attendance, punctuality, and work patterns
              </p>
            </div>
          </div>

          {/* Enhanced Stats Cards with Holiday Info */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Employees</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{totalEmployees}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Working Days</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{currentMonthWorkingDays}</p>
                  <p className="text-xs text-gray-500 mt-1">Excl. holidays</p>
                </div>
                <div className="p-3 bg-indigo-100 rounded-xl">
                  <Calendar className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Avg Attendance</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{averageAttendanceRate}%</p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Late</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{totalLateCount}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-xl">
                  <AlertCircle className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Absent</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{totalAbsentDays}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-xl">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Holiday Info Banner */}
          {holidaysInMonth > 0 && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-purple-800 font-semibold">
                    {holidaysInMonth} holiday(s) in {MONTHS.find(m => m.value === selectedMonth)?.label} {selectedYear}
                  </p>
                  <p className="text-purple-600 text-sm">
                    Working days calculation excludes weekends and holidays
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          
          {/* Toolbar */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-900">Attendance Summary</h2>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {MONTHS.find(m => m.value === selectedMonth)?.label} {selectedYear}
                </Badge>
                {currentMonthWorkingDays > 0 && (
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                    {currentMonthWorkingDays} work days
                  </Badge>
                )}
              </div>

              <div className="flex gap-2 flex-wrap">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search employees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                  <SelectTrigger className="w-36 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map(month => (
                      <SelectItem key={month.value} value={month.value.toString()}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                  <SelectTrigger className="w-24 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {YEARS.map(year => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button 
                  variant="outline" 
                  onClick={handleRefresh}
                  disabled={isLoading || isLoadingAttendance}
                  className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${(isLoading || isLoadingAttendance) ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50 hover:bg-gray-50">
                  <TableHead className="font-bold text-gray-800 py-4 min-w-[200px]">Employee</TableHead>
                  <TableHead className="text-center font-bold text-gray-800 min-w-[120px]">Work Days</TableHead>
                  <TableHead className="text-center font-bold text-gray-800 min-w-[120px]">Late Count</TableHead>
                  <TableHead className="text-center font-bold text-gray-800 min-w-[120px]">Absent Days</TableHead>
                  <TableHead className="text-center font-bold text-gray-800 min-w-[140px]">Attendance Rate</TableHead>
                  <TableHead className="text-center font-bold text-gray-800 min-w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2">Loading attendance records...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => {
                    const stats = calculateAttendanceStats(user.id);
                    const attendanceRate = parseFloat(stats.attendanceRate);
                    
                    return (
                      <TableRow key={user.id} className="hover:bg-blue-50/50 transition-colors duration-200">
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                              <span className="text-white font-bold text-sm">
                                {user.name?.charAt(0).toUpperCase() || 'U'}
                              </span>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{user.name}</p>
                              <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center">
                            <span className="font-semibold text-lg">{stats.workDays}</span>
                            <span className="text-xs text-gray-500">/ {stats.totalDays} days</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge 
                            variant="outline" 
                            className={stats.lateCount > 3 ? 'bg-red-50 text-red-700 border-red-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}
                          >
                            {stats.lateCount}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge 
                            variant="outline" 
                            className={stats.absentDays > 2 ? 'bg-red-50 text-red-700 border-red-200' : 'bg-gray-50 text-gray-700 border-gray-200'}
                          >
                            {stats.absentDays}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <span className={`font-bold text-lg ${
                              attendanceRate >= 95 ? 'text-green-600' :
                              attendanceRate >= 85 ? 'text-yellow-600' :
                              'text-red-600'
                            }`}>
                              {stats.attendanceRate}%
                            </span>
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  attendanceRate >= 95 ? 'bg-green-500' :
                                  attendanceRate >= 85 ? 'bg-yellow-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: `${Math.min(attendanceRate, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setViewingUser(user)}
                            className="hover:bg-blue-100 hover:text-blue-700"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                          <Users className="h-8 w-8 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-gray-600">No employees found</p>
                          <p className="text-gray-500 mt-1">No employees match your search criteria</p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* View Attendance Details Dialog */}
        <Dialog open={!!viewingUser} onOpenChange={() => setViewingUser(null)}>
          <DialogContent className="sm:max-w-6xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900">
                Attendance Details: {viewingUser?.name}
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Detailed attendance record for {MONTHS.find(m => m.value === selectedMonth)?.label} {selectedYear}
                {viewingUser && ` (${calculateAttendanceStats(viewingUser.id).totalDays} personal working days)`}
              </DialogDescription>
            </DialogHeader>
            {viewingUser && (
              <div className="py-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {(() => {
                    const stats = calculateAttendanceStats(viewingUser.id);
                    return (
                      <>
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <p className="text-2xl font-bold text-blue-600">{stats.workDays}</p>
                          <p className="text-sm text-gray-600">Work Days</p>
                          <p className="text-xs text-gray-500">/ {stats.totalDays} personal</p>
                        </div>
                        <div className="text-center p-3 bg-yellow-50 rounded-lg">
                          <p className="text-2xl font-bold text-yellow-600">{stats.lateCount}</p>
                          <p className="text-sm text-gray-600">Late Count</p>
                        </div>
                        <div className="text-center p-3 bg-red-50 rounded-lg">
                          <p className="text-2xl font-bold text-red-600">{stats.absentDays}</p>
                          <p className="text-sm text-gray-600">Absent Days</p>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <p className="text-2xl font-bold text-green-600">{stats.attendanceRate}%</p>
                          <p className="text-sm text-gray-600">Attendance Rate</p>
                        </div>
                      </>
                    );
                  })()}
                </div>
                
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="text-center">ID</TableHead>
                        <TableHead className="text-center">User ID</TableHead>
                        <TableHead className="text-center">Date</TableHead>
                        <TableHead className="text-center">Clock In</TableHead>
                        <TableHead className="text-center">Clock Out</TableHead>
                        <TableHead className="text-center">Late</TableHead>
                        <TableHead className="text-center">Late Minutes</TableHead>
                        <TableHead className="text-center">Absent</TableHead>
                        <TableHead className="text-center">Total Hours</TableHead>
                        <TableHead className="text-center">Overtime Hours</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-center">Work Policy ID</TableHead>
                        <TableHead className="text-center">Shift ID</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(() => {
                        const userAttendance = attendanceData[viewingUser.id] || [];
                        const attendanceRecords = Array.isArray(userAttendance) ? userAttendance : [];
                        
                        return attendanceRecords.length > 0 ? (
                          attendanceRecords.map((record, index) => {
                            const recordDate = dayjs(record.date);
                            const isHolidayDate = isHoliday(recordDate);
                            
                            return (
                              <TableRow key={record.id || index} className={`hover:bg-gray-50 ${isHolidayDate ? 'bg-purple-50' : ''}`}>
                                <TableCell className="text-center font-mono text-sm">{record.id}</TableCell>
                                <TableCell className="text-center font-mono text-sm">{record.userId}</TableCell>
                                <TableCell className="text-center">
                                  <div className="flex flex-col items-center">
                                    <span>{recordDate.format('DD/MM/YYYY')}</span>
                                    {isHolidayDate && (
                                      <Badge variant="outline" className="text-xs bg-purple-100 text-purple-700 border-purple-200 mt-1">
                                        Holiday
                                      </Badge>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="text-center font-mono">
                                  {record.clockIn || <span className="text-red-500">NULL</span>}
                                </TableCell>
                                <TableCell className="text-center font-mono">
                                  {record.clockOut || <span className="text-red-500">NULL</span>}
                                </TableCell>
                                <TableCell className="text-center">
                                  <Badge className={record.isLate === 1 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                                    {record.isLate === 1 ? 'Yes' : 'No'}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                  {record.lateMinutes > 0 ? (
                                    <Badge className="bg-orange-100 text-orange-800">{record.lateMinutes}</Badge>
                                  ) : (
                                    <span className="text-gray-400">0</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-center">
                                  <Badge className={record.isAbsent === 1 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                                    {record.isAbsent === 1 ? 'Yes' : 'No'}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-center font-mono">{record.totalHours || 0}</TableCell>
                                <TableCell className="text-center font-mono">{record.overtimeHours || 0}</TableCell>
                                <TableCell className="text-center">
                                  <Badge 
                                    className={
                                      record.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                      record.status === 'ABSENT' ? 'bg-red-100 text-red-800' :
                                      record.status === 'ON_LEAVE' ? 'bg-blue-100 text-blue-800' :
                                      'bg-gray-100 text-gray-800'
                                    }
                                  >
                                    {record.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-center font-mono text-sm">{record.workPolicyId}</TableCell>
                                <TableCell className="text-center">
                                  {record.shiftId || <span className="text-red-500">NULL</span>}
                                </TableCell>
                              </TableRow>
                            );
                          })
                        ) : (
                          <TableRow>
                            <TableCell colSpan={13} className="text-center py-8 text-gray-500">
                              No attendance records found for this period
                            </TableCell>
                          </TableRow>
                        );
                      })()}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default AttendanceRecordPage;