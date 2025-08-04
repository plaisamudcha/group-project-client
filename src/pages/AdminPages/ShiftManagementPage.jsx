import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, PlusCircle, Pencil, XCircle, Users } from "lucide-react";
import { toast } from 'react-toastify';
import admintoApi from "@/src/api/adminApi";

function ShiftManagementPage() {
  const [shifts, setShifts] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isShiftDialogOpen, setIsShiftDialogOpen] = useState(false);
  const [isManageEmployeeDialogOpen, setIsManageEmployeeDialogOpen] = useState(false);

  const [editingShift, setEditingShift] = useState(null);
  const [managingShift, setManagingShift] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState("");
  
  const [formState, setFormState] = useState({ name: '', inTime: '', outTime: '' });

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const shiftsResponse = await admintoApi.getAllShifts();
      const usersResponse = await admintoApi.getAllUser();
      
      setShifts(shiftsResponse.data.result || []);
      setAllUsers(usersResponse.data.users || []); 
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("เกิดข้อผิดพลาดในการดึงข้อมูล");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenShiftDialog = (shift = null) => {
    if (shift) {
      setEditingShift(shift);
      setFormState({ name: shift.name, inTime: shift.inTime, outTime: shift.outTime });
    } else {
      setEditingShift(null);
      setFormState({ name: '', inTime: '', outTime: '' });
    }
    setIsShiftDialogOpen(true);
  };
  
  const handleOpenManageEmployeeDialog = (shift) => {
    setManagingShift(shift);
    setSelectedUserId("");
    setIsManageEmployeeDialogOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveShift = async () => {
    if (!formState.name || !formState.inTime || !formState.outTime) {
      toast.warn("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    try {
      if (editingShift) {
        await admintoApi.updateShift(editingShift.id, formState);
        toast.success("อัปเดตข้อมูลกะสำเร็จ!");
      } else {
        await admintoApi.createShift(formState);
        toast.success("สร้างกะใหม่สำเร็จ!");
      }
      setIsShiftDialogOpen(false);
      await loadData();
    } catch (err) {
      console.error("Failed to save shift:", err);
      toast.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  const handleAddEmployee = async () => {
    if (!selectedUserId) {
        toast.warn("กรุณาเลือกพนักงาน");
        return;
    }
    try {
        const payload = {
            shiftId: managingShift.id,
            userId: Number(selectedUserId)
        };
        await admintoApi.assignEmployeeToShift(payload);
        toast.success("เพิ่มพนักงานเข้ากะสำเร็จ!");
        await loadData(); // Reload all data to reflect changes
        setIsManageEmployeeDialogOpen(false);
    } catch (err) {
        console.error("Failed to add employee:", err);
        toast.error("ไม่สามารถเพิ่มพนักงานได้");
    }
  };

  const handleRemoveEmployee = async (userId) => {
    try {
        const payload = { userId: userId };
        await admintoApi.removeEmployeeFromShift(payload);
        toast.success("นำพนักงานออกจากกะสำเร็จ!");
        await loadData(); // Reload for consistency
        setIsManageEmployeeDialogOpen(false);
    } catch (err) {
        console.error("Failed to remove employee:", err);
        toast.error("ไม่สามารถนำพนักงานออกได้");
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
  
  const availableUsers = Array.isArray(allUsers) ? allUsers.filter(user => 
    user.employeeProfile &&
    // เพิ่มการป้องกันโดยใช้ || [] เพื่อให้แน่ใจว่าเป็น Array เสมอ
    !(managingShift?.employeeProfiles || []).some(profile => profile?.user?.id === user.id)
  ) : [];

  return (
    <div className="p-4 md:px-24">
      <header className="my-8">
        <h1 className="text-3xl font-bold text-gray-800">จัดการกะการทำงาน</h1>
        <p className="text-muted-foreground">เพิ่ม แก้ไข และจัดการพนักงานในแต่ละกะ</p>
      </header>

      <div className="flex justify-end mb-6">
        <Button onClick={() => handleOpenShiftDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" /> เพิ่มกะใหม่
        </Button>
      </div>

      <div className="border rounded-lg overflow-x-auto bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ชื่อกะ</TableHead>
              <TableHead className="text-center">เวลาเข้างาน</TableHead>
              <TableHead className="text-center">เวลาออกงาน</TableHead>
              <TableHead className="text-center">พนักงาน</TableHead>
              <TableHead className="text-right">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shifts.length > 0 ? (
              shifts.map((shift) => (
                <TableRow key={shift.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">{shift.name}</TableCell>
                  <TableCell className="text-center">{shift.inTime}</TableCell>
                  <TableCell className="text-center">{shift.outTime}</TableCell>
                  <TableCell className="text-center">{shift.employeeProfiles?.length || 0} คน</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleOpenManageEmployeeDialog(shift)}>
                        <Users className="mr-2 h-4 w-4" /> จัดการพนักงาน
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleOpenShiftDialog(shift)}>
                      <Pencil className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  ไม่พบข้อมูลกะการทำงาน
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit Shift Dialog */}
      <Dialog open={isShiftDialogOpen} onOpenChange={setIsShiftDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingShift ? 'แก้ไขกะการทำงาน' : 'สร้างกะการทำงานใหม่'}</DialogTitle>
            <DialogDescription>
              กรอกรายละเอียดของกะการทำงานด้านล่าง
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">ชื่อกะ</Label>
              <Input id="name" name="name" value={formState.name} onChange={handleFormChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="inTime" className="text-right">เวลาเข้างาน</Label>
              <Input id="inTime" name="inTime" type="time" value={formState.inTime} onChange={handleFormChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="outTime" className="text-right">เวลาออกงาน</Label>
              <Input id="outTime" name="outTime" type="time" value={formState.outTime} onChange={handleFormChange} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">ยกเลิก</Button>
            </DialogClose>
            <Button onClick={handleSaveShift}>บันทึก</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Manage Employees Dialog */}
      <Dialog open={isManageEmployeeDialogOpen} onOpenChange={setIsManageEmployeeDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>จัดการพนักงานในกะ "{managingShift?.name}"</DialogTitle>
            <DialogDescription>
              เพิ่มหรือนำพนักงานออกจากกะการทำงานนี้
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-6">
            <div>
                <Label className="font-semibold">พนักงานในกะปัจจุบัน</Label>
                <div className="mt-2 border rounded-lg p-2 space-y-2 max-h-40 overflow-y-auto">
                    {/* เพิ่มการป้องกันโดยใช้ || [] เพื่อให้แน่ใจว่าเป็น Array เสมอ */}
                    {(managingShift?.employeeProfiles || []).length > 0 ? (
                        managingShift.employeeProfiles.map(profile => (
                            <div key={profile?.user?.id} className="flex justify-between items-center bg-slate-50 p-2 rounded-md">
                                <span>{profile?.user?.name}</span>
                                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600" onClick={() => handleRemoveEmployee(profile?.user?.id)}>
                                    <XCircle className="h-4 w-4 mr-1"/> ลบ
                                </Button>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground text-center p-4">ยังไม่มีพนักงานในกะนี้</p>
                    )}
                </div>
            </div>
            <div>
                <Label className="font-semibold">เพิ่มพนักงานใหม่</Label>
                <div className="mt-2 flex gap-2">
                    <Select onValueChange={setSelectedUserId} value={selectedUserId}>
                        <SelectTrigger>
                            <SelectValue placeholder="เลือกพนักงาน..." />
                        </SelectTrigger>
                        <SelectContent>
                            {availableUsers.length > 0 ? (
                                availableUsers.map(user => (
                                    <SelectItem key={user.id} value={String(user.id)}>{user.name}</SelectItem>
                                ))
                            ) : (
                                <p className="p-2 text-sm text-muted-foreground">ไม่พบพนักงานที่ว่าง</p>
                            )}
                        </SelectContent>
                    </Select>
                    <Button onClick={handleAddEmployee} disabled={!selectedUserId}>
                        <PlusCircle className="h-4 w-4 mr-2"/> เพิ่ม
                    </Button>
                </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">ปิด</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ShiftManagementPage;
