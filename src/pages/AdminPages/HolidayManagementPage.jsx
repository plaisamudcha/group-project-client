import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import admintoApi from "@/src/api/adminApi";


const currentYear = dayjs().year();
const availableYears = [currentYear - 1, currentYear, currentYear + 1];

const INITIAL_HOLIDAYS = [
  { id: 1, date: "2025-01-01", name: "วันขึ้นปีใหม่" },
  { id: 2, date: "2025-04-13", name: "วันสงกรานต์" },
  { id: 3, date: "2025-04-14", name: "วันสงกรานต์" },
  { id: 4, date: "2026-01-01", name: "วันขึ้นปีใหม่" },
];

function HolidayManagementPage() {
  const [holidays, setHolidays] = useState(INITIAL_HOLIDAYS);
  const [selectedYear, setSelectedYear] = useState(String(currentYear));
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [holidayName, setHolidayName] = useState("");
  const [holidayDate, setHolidayDate] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const filteredHolidays = holidays.filter(
    (h) => h.date.startsWith(selectedYear)
  );
  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        setIsLoading(true);
        setError(null); 
        const response = await admintoApi.fetchAllholiday();
        // console.log(response.data.holiday)
        setHolidays(response.data.holiday);
      } catch (err) {
        console.error("Failed to fetch holidays:", err);
        setError("ไม่สามารถโหลดข้อมูลวันหยุดได้"); 
      } finally {
        setIsLoading(false); 
      }
    };

    fetchHolidays();
  }, []);


  const handleAddClick = () => {
    setEditingHoliday(null);
    setHolidayName("");
    setHolidayDate(dayjs(`${selectedYear}-01-01`).format("YYYY-MM-DD"));
    setIsDialogOpen(true);
  };

  const handleEditClick = (holiday) => {
    setEditingHoliday(holiday);
    setHolidayName(holiday.name);

    setHolidayDate(dayjs(holiday.date).format("YYYY-MM-DD"));
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!holidayName || !holidayDate) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }


    const formattedDate = dayjs(holidayDate).format("YYYY-MM-DD");

    if (editingHoliday) {
      setHolidays(
        holidays.map((h) =>
          h.id === editingHoliday.id
            ? { ...h, name: holidayName, date: formattedDate }
            : h
        )
      );
    } else {
      const newHoliday = {
        id: Date.now(),
        name: holidayName,
        date: formattedDate,
      };
      setHolidays([...holidays, newHoliday]);
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (idToDelete) => {
    if (window.confirm("คุณต้องการลบวันหยุดนี้ใช่หรือไม่?")) {
      setHolidays(holidays.filter(h => h.id !== idToDelete));
    }
  }
  if (isLoading) {
    return <div className="p-8 text-center">กำลังโหลดข้อมูล...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }
  return (
    <div className="p-4 md:p-8">
      <h1 className="text-4xl font-bold mx-4 my-8">Holidays Management</h1>

      <div className="flex justify-between items-center px-4 md:px-16 mb-8">
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

      <div className="border rounded-lg mx-4 md:mx-16">
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
                    <Button variant="outline" size="sm" onClick={() => handleEditClick(holiday)}>
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(holiday.id)}>
                      Delete
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
              <Input
                id="date"
                type="date"
                value={holidayDate}
                onChange={(e) => setHolidayDate(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={holidayName}
                onChange={(e) => setHolidayName(e.target.value)}
                className="col-span-3"
                placeholder="ชื่อวันหยุด"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">Cancel</Button>
            </DialogClose>
            <Button type="button" onClick={handleSave}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default HolidayManagementPage;