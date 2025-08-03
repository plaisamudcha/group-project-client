import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ValidationError } from "yup";
import holidaySchema from "@/src/validations/holidaySchema";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Pencil, Trash2, XCircle, Calendar, CalendarDays, Plus, Clock, Users } from "lucide-react";
import admintoApi from "@/src/api/adminApi";

const currentYear = dayjs().year();
const availableYears = [currentYear - 1, currentYear, currentYear + 1];

function HolidayManagementPage() {
  const [holidays, setHolidays] = useState([]);
  const [selectedYear, setSelectedYear] = useState(String(currentYear));
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [holidayName, setHolidayName] = useState("");
  const [holidayDate, setHolidayDate] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [holidayToDelete, setHolidayToDelete] = useState(null);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});

  const filteredHolidays = holidays.filter(
    (h) => h.date.startsWith(selectedYear)
  );

  const fetchHolidays = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await admintoApi.fetchAllholiday();
      const sortedHolidays = response.data.holiday.sort((a, b) => a.date.localeCompare(b.date));
      setHolidays(sortedHolidays);
    } catch (err) {
      console.error("Failed to fetch holidays:", err);
      setError("ไม่สามารถโหลดข้อมูลวันหยุดได้");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  const handleAddClick = () => {
    setEditingHoliday(null);
    setHolidayName("");
    setHolidayDate(dayjs(`${selectedYear}-01-01`).format("YYYY-MM-DD"));
    setErrors({});
    setIsDialogOpen(true);
  };

  const handleEditClick = (holiday) => {
    setEditingHoliday(holiday);
    setHolidayName(holiday.name);
    setHolidayDate(dayjs(holiday.date).format("YYYY-MM-DD"));
    setErrors({});
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    const formDataForValidation = {
      name: holidayName,
      date: holidayDate,
    };

    try {
      setErrors({});
      if (editingHoliday) {
        const payload = {
          name: holidayName,
        };

        const originalDate = dayjs(editingHoliday.date).format("YYYY-MM-DD");

        if (holidayDate !== originalDate) {
          payload.date = holidayDate;
        }

        await admintoApi.updateHoliday(editingHoliday.id, payload);
      } else {
        await admintoApi.ceateHoliday({
          name: holidayName,
          date: holidayDate,
        });
      }

      await fetchHolidays();
      setIsDialogOpen(false);
    } catch (err) {
      if (err instanceof ValidationError) {
        const newErrors = err.inner.reduce((acc, currentError) => {
          acc[currentError.path] = currentError.message;
          return acc;
        }, {});
        setErrors(newErrors);
      } else {
        console.error("Failed to save holiday:", err);
        alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    }
  };

  const confirmDelete = async () => {
    if (holidayToDelete) {
      try {
        await admintoApi.deleteHoliday(holidayToDelete);
        fetchHolidays();
        setHolidayToDelete(null);
      } catch (err) {
        console.error("Failed to delete holiday:", err);
        alert("เกิดข้อผิดพลาด: ไม่สามารถลบข้อมูลได้");
        setHolidayToDelete(null);
      }
    }
  };

  const getUpcomingHolidays = () => {
    const today = dayjs();
    return holidays.filter(holiday => dayjs(holiday.date).isAfter(today)).slice(0, 3);
  };

  const getHolidayTypeColor = (holiday) => {
    const date = dayjs(holiday.date);
    const month = date.month();
    
    if (month === 0 || month === 11) return 'bg-red-100 text-red-800 border-red-200'; // Jan/Dec
    if (month >= 2 && month <= 4) return 'bg-green-100 text-green-800 border-green-200'; // Mar-May
    if (month >= 5 && month <= 7) return 'bg-blue-100 text-blue-800 border-blue-200'; // Jun-Aug
    return 'bg-purple-100 text-purple-800 border-purple-200'; // Sep-Nov
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex justify-center items-center">
        <div className="flex items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="text-lg font-medium text-gray-700">Loading holidays...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col justify-center items-center">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Data</h2>
          <p className="text-gray-600">{error}</p>
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
            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg">
              <Calendar className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Holiday Management
              </h1>
              <p className="text-gray-600 mt-1 text-lg">
                Manage company holidays, special events, and important dates
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Holidays</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{holidays.length}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">This Year ({selectedYear})</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{filteredHolidays.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <CalendarDays className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Upcoming</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{getUpcomingHolidays().length}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Toolbar */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-900">Holiday Calendar</h2>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {filteredHolidays.length} holidays in {selectedYear}
                </Badge>
                
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-28 border-gray-300 focus:border-green-500 focus:ring-green-500">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableYears.map(year => (
                      <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleAddClick} 
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Holiday
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50 hover:bg-gray-50">
                  <TableHead className="font-bold text-gray-800 py-4">Holiday Name</TableHead>
                  <TableHead className="text-center font-bold text-gray-800">Date</TableHead>
                  <TableHead className="text-center font-bold text-gray-800">Day of Week</TableHead>
                  <TableHead className="text-center font-bold text-gray-800">Type</TableHead>
                  <TableHead className="text-center font-bold text-gray-800">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHolidays.length > 0 ? (
                  filteredHolidays.map((holiday, index) => (
                    <TableRow key={holiday.id} className="hover:bg-green-50/50 transition-colors duration-200">
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{holiday.name}</p>
                            <Badge className={`mt-1 text-xs ${getHolidayTypeColor(holiday)}`}>
                              {dayjs(holiday.date).format('MMMM')}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center justify-center gap-2 text-sm font-medium">
                            <Calendar className="h-4 w-4 text-green-600" />
                            {dayjs(holiday.date).format("YYYY-MM-DD")}
                          </div>
                          <span className="text-xs text-gray-500">
                            {dayjs(holiday.date).format("DD MMM YYYY")}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="text-sm font-medium text-blue-700">
                          {dayjs(holiday.date).format("dddd")}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                          Public Holiday
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleEditClick(holiday)}
                            className="hover:bg-blue-100 hover:text-blue-700 transition-colors"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setHolidayToDelete(holiday.id)}
                            className="hover:bg-red-100 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                          <Calendar className="h-8 w-8 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-gray-600">No holidays found</p>
                          <p className="text-gray-500 mt-1">No holidays scheduled for {selectedYear}</p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Add/Edit Holiday Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                {editingHoliday ? "Edit Holiday" : "Add New Holiday"}
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                {editingHoliday ? "Update holiday information with new details." : "Create a new holiday entry for the calendar."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="text-sm font-semibold text-gray-700">Holiday Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={holidayDate}
                  onChange={(e) => setHolidayDate(e.target.value)}
                  className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                />
                {errors.date && (
                  <p className="text-sm text-red-500 mt-1">{errors.date}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold text-gray-700">Holiday Name</Label>
                <Input
                  id="name"
                  value={holidayName}
                  onChange={(e) => setHolidayName(e.target.value)}
                  placeholder="Enter holiday name"
                  className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                )}
              </div>
            </div>
            <DialogFooter className="gap-3">
              <DialogClose asChild>
                <Button type="button" variant="outline" className="px-6">
                  Cancel
                </Button>
              </DialogClose>
              <Button 
                type="button" 
                onClick={handleSave}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 px-6"
              >
                {editingHoliday ? "Update Holiday" : "Create Holiday"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!holidayToDelete} onOpenChange={() => setHolidayToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-bold text-gray-900">
                Delete Holiday?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600">
                This action cannot be undone. The holiday will be permanently removed from the calendar.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-3">
              <AlertDialogCancel className="px-6">Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 px-6"
              >
                Delete Holiday
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

export default HolidayManagementPage;