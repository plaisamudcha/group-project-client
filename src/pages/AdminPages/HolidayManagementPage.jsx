import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Button } from "@/components/ui/button";
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
import { Loader2, Pencil, Trash2, XCircle } from "lucide-react";
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

    // await holidaySchema.validate(formDataForValidation, {
    //   abortEarly: false,
    // });
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
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-red-500">
        <XCircle className="h-10 w-10 mb-4" />
        <h2 className="text-xl font-semibold">{error}</h2>
      </div>
    );
  }
  return (
    <div className="p-4 md:px-24">
      <h1 className="text-4xl font-bold my-8">Holidays Management</h1>
      <div className="flex justify-between items-center  mb-8">
        <div className="flex items-center gap-4">

          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-28">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map(year => (
                <SelectItem key={year} value={String(year)}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-muted-foreground">
            พบ {filteredHolidays.length} วัน
          </p>
        </div>
        <Button onClick={handleAddClick}>Add Holiday</Button>
      </div>

      <div className="border rounded-lg ">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Date</TableHead>
              <TableHead>Holiday Name</TableHead>
              <TableHead className="text-right w-[150px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredHolidays.length > 0 ? (
              filteredHolidays.map((holiday) => (
                <TableRow key={holiday.id}>
                  <TableCell>{dayjs(holiday.date).format("YYYY-MM-DD")}</TableCell>
                  <TableCell className="font-medium">{holiday.name}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEditClick(holiday)}>
                      <Pencil className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => setHolidayToDelete(holiday.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  ไม่พบข้อมูลวันหยุดสำหรับปี {selectedYear}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingHoliday ? "Edit Holiday" : "Add New Holiday"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <div className="col-span-3">
                <Input
                  id="date"
                  type="date"
                  value={holidayDate}
                  onChange={(e) => setHolidayDate(e.target.value)}
                />
                {errors.date && (
                  <p className="text-sm text-red-500 mt-1">{errors.date}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <div className="col-span-3">
                <Input
                  id="name"
                  value={holidayName}
                  onChange={(e) => setHolidayName(e.target.value)}
                  placeholder="ชื่อวันหยุด"
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button type="button" onClick={handleSave}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={!!holidayToDelete} onOpenChange={() => setHolidayToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>คุณแน่ใจหรือไม่?</AlertDialogTitle>
            <AlertDialogDescription>
              การกระทำนี้ไม่สามารถย้อนกลับได้ ระบบจะลบข้อมูลวันหยุดนี้อย่างถาวร
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>ยืนยันการลบ</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default HolidayManagementPage;