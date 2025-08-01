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
  DialogDescription,
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
import admintoApi from "@/src/api/adminApi";
import { Loader2, Pencil, PlusCircle, Trash2, Users, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from 'react-toastify';

// การกำหนดประเภทการลาแบบรวมศูนย์
const LEAVE_TYPES = {
  VACATION: 'ลาพักร้อน',
  PERSONAL: 'ลากิจ',
  SICK: 'ลาป่วย',
  MATERNITY: 'ลาคลอด',
  UNPAID: 'ลาโดยไม่รับค่าจ้าง',
};

const currentYear = dayjs().year();
const availableYears = [currentYear - 1, currentYear, currentYear + 1];

function LeaveEntitlementPage() {
  const [entitlements, setEntitlements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState(String(currentYear));

  const [isSingleDialog, setIsSingleDialog] = useState(false);
  const [isBulkDialog, setIsBulkDialog] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const [editingEntitlement, setEditingEntitlement] = useState(null);
  const [formState, setFormState] = useState({});
  const [bulkFormState, setBulkFormState] = useState({
    VACATION: 14,
    PERSONAL: 14,
    SICK: 30,
    MATERNITY: 90,
    UNPAID: 90,
  });

  const [eligibleUsers, setEligibleUsers] = useState([]);
  const [selectedNewUserId, setSelectedNewUserId] = useState("");

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await admintoApi.getAllUser();
      const users = response.data.users;
      console.log(users);

      const processedData = users.map(user => {
        const userEntitlements = user.annualLeaveEntitlements || [];
        const entitlementsForYear = userEntitlements.filter(e => e.year === parseInt(selectedYear));
        const leaves = entitlementsForYear.length > 0
          ? Object.keys(LEAVE_TYPES).map(leaveKey => {
            const entitlement = entitlementsForYear.find(e => e.leaveType === leaveKey);
            return {
              type: leaveKey,
              used: entitlement?.usedDays || 0,
              total: entitlement?.entitledDays || 0,
            };
          })
          : [];

        return {
          id: user.id,
          employeeName: user.name,
          year: parseInt(selectedYear),
          leaves: leaves,
        };
      });
      setEntitlements(processedData);

      const usersWithoutQuota = processedData.filter(user => user.leaves.length === 0);
      setEligibleUsers(usersWithoutQuota);

    } catch (error) {
      console.error("ไม่สามารถดึงข้อมูลโควต้าได้:", error);
      setError("เกิดข้อผิดพลาดในการดึงข้อมูล กรุณาลองใหม่อีกครั้ง");
      setEntitlements([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear]);

  const pendingEmployeesCount = entitlements.filter(e => e.leaves.length === 0).length;

  const getLeaveData = (leaves, type) => {
    return leaves.find(l => l.type === type) || { used: 0, total: 0 };
  };

  const handleOpenSingleDialog = (entitlement = null) => {
    setEditingEntitlement(entitlement);
    setSelectedNewUserId("");
    const initialFormState = Object.keys(LEAVE_TYPES).reduce((acc, key) => {
      const existingLeave = (entitlement && entitlement.leaves.length > 0) ? getLeaveData(entitlement.leaves, key) : { total: bulkFormState[key] || 0 };
      acc[key] = existingLeave.total;
      return acc;
    }, {});
    setFormState(initialFormState);
    setIsSingleDialog(true);
  };

  const handleFormChange = (leaveType, value) => {
    setFormState(prev => ({ ...prev, [leaveType]: parseInt(value, 10) || 0 }));
  };

  const handleSave = async () => {
    const isEditing = !!editingEntitlement;

    if (!isEditing && !selectedNewUserId) {
      toast.warn("กรุณาเลือกพนักงาน");
      return;
    }

    const entitlementsPayload = Object.entries(formState).map(([leaveType, entitledDays]) => ({
      leaveType,
      entitledDays: Number(entitledDays),
    }));

    const payload = {
      userId: isEditing ? editingEntitlement.id : parseInt(selectedNewUserId),
      year: parseInt(selectedYear),
      entitlements: entitlementsPayload,
    };

    try {
      if (isEditing) {
        if (editingEntitlement.leaves.length > 0) {
          await admintoApi.updateEntitlements(payload);
        } else {
          await admintoApi.createEntitlements(payload);
        }
      } else {
        await admintoApi.createEntitlements(payload);
      }

      await loadData();

      setIsSingleDialog(false);
      setEditingEntitlement(null);
      toast.success("บันทึกข้อมูลสำเร็จ!");
    } catch (err) {
      console.error("เกิดข้อผิดพลาดในการบันทึก:", err);
      toast.error("ไม่สามารถบันทึกข้อมูลได้: " + (err.response?.data?.message || err.message));
    }
  };

  const handleBulkFormChange = (leaveType, value) => {
    setBulkFormState(prev => ({ ...prev, [leaveType]: parseInt(value, 10) || 0 }));
  };

  const handleBulkCreate = async () => {
    const employeesToUpdate = entitlements.filter(e => e.leaves.length === 0);
    if (employeesToUpdate.length === 0) {
      toast.info("ไม่พบพนักงานที่รอการสร้างโควต้าในปีที่เลือก");
      return;
    }

    const userIds = employeesToUpdate.map(emp => emp.id);
    const entitlementsPayload = Object.entries(bulkFormState).map(([leaveType, entitledDays]) => ({
      leaveType,
      entitledDays: Number(entitledDays),
    }));

    const payload = {
      year: parseInt(selectedYear),
      userIds: userIds,
      entitlements: entitlementsPayload,
    };

    try {
      await admintoApi.createBulkEntitlements(payload);
      await loadData();
      setIsBulkDialog(false);
      toast.success(`สร้างโควต้าสำหรับพนักงาน ${userIds.length} คนสำเร็จ`);
    } catch (err) {
      console.error("เกิดข้อผิดพลาดในการสร้างโควต้าแบบกลุ่ม:", err);
      toast.error("ไม่สามารถสร้างโควต้าได้: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;

    try {
      await admintoApi.deleteUserEntitlements(toDelete.id, toDelete.year);
      await loadData();
      setToDelete(null);
      toast.success("ลบข้อมูลสำเร็จ!");
    } catch (err) {
      console.error("เกิดข้อผิดพลาดในการลบ:", err);
      toast.error("ไม่สามารถลบข้อมูลได้: " + (err.response?.data?.message || err.message));
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
      <header className="my-8">
        <h1 className="text-3xl font-bold text-gray-800">Leave Entitlements</h1>
        <p className="text-muted-foreground">เพิ่ม แก้ไข และดูภาพรวมโควตาวันลาของพนักงาน</p>
      </header>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
            <SelectContent>
              {availableYears.map(year => (
                <SelectItem key={year} value={String(year)}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => handleOpenSingleDialog()} disabled={eligibleUsers.length === 0}>
            <PlusCircle className="mr-2 h-4 w-4" />เพิ่มรายคน
          </Button>
          <Button onClick={() => setIsBulkDialog(true)}>
            <Users className="mr-2 h-4 w-4" />สร้างโควต้าแบบกลุ่ม
            {pendingEmployeesCount > 0 && <Badge variant="secondary" className="ml-2">{pendingEmployeesCount}</Badge>}
          </Button>
        </div>
      </div>

      <div className="border rounded-lg overflow-x-auto bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px]">พนักงาน</TableHead>
              {Object.values(LEAVE_TYPES).map(name => (
                <TableHead key={name} className="text-center min-w-[120px]">{name}</TableHead>
              ))}
              <TableHead className="text-right min-w-[100px]">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entitlements.length > 0 ? (
              entitlements.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="font-medium text-gray-800">{item.employeeName}</div>
                  </TableCell>
                  {Object.keys(LEAVE_TYPES).map(leaveKey => {
                    const leaveData = getLeaveData(item.leaves, leaveKey);
                    return (
                      <TableCell key={leaveKey} className="text-center">
                        {item.leaves.length > 0 ? (
                          <span>{`${leaveData.used} / ${leaveData.total}`}</span>
                        ) : (
                          <Badge variant="outline">ยังไม่มีโควต้า</Badge>
                        )}
                      </TableCell>
                    );
                  })}
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenSingleDialog(item)}>
                      <Pencil className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => setToDelete(item)}
                      disabled={item.leaves.length === 0}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={Object.keys(LEAVE_TYPES).length + 2} className="h-24 text-center text-muted-foreground">ไม่พบข้อมูลพนักงาน</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isSingleDialog} onOpenChange={setIsSingleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingEntitlement ? (editingEntitlement.leaves.length > 0 ? `แก้ไขโควต้า: ${editingEntitlement.employeeName}` : `สร้างโควต้าสำหรับ: ${editingEntitlement.employeeName}`) : 'เพิ่มโควต้าพนักงานใหม่'}</DialogTitle>
            <DialogDescription>
              กำหนดจำนวนวันลาสำหรับปี {selectedYear}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto pr-2 flex-col flex">
            {!editingEntitlement && (
              <div className="flex justify-between items-center">
                <Label htmlFor="employeeName" className="font-semibold text-base">ชื่อพนักงาน</Label>
                <Select value={selectedNewUserId} onValueChange={setSelectedNewUserId}>
                  <SelectTrigger className="basis-2/4">
                    <SelectValue placeholder="เลือกพนักงาน..." />
                  </SelectTrigger>
                  <SelectContent>
                    {eligibleUsers.map(user => (
                      <SelectItem key={user.id} value={String(user.id)}>
                        {user.employeeName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {Object.entries(LEAVE_TYPES).map(([key, name]) => (
              <div key={key} className="flex justify-between items-center">
                <Label htmlFor={key} className="font-semibold text-base">{name}</Label>
                <Input
                  id={key}
                  type="number"
                  className="basis-2/4"
                  value={formState[key] || 0}
                  onChange={(e) => handleFormChange(key, e.target.value)}
                  min="0"
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                ยกเลิก
              </Button>
            </DialogClose>
            <Button onClick={handleSave}>บันทึก</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isBulkDialog} onOpenChange={setIsBulkDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">🚀 สร้างโควต้าวันลาสำหรับปี {selectedYear}</DialogTitle>
            <DialogDescription>กำหนดโควต้ามาตรฐานให้กับพนักงาน {pendingEmployeesCount} คนที่ยังไม่มีข้อมูลในปีที่เลือก</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-6">
            <div className="space-y-3">
              <Label className="font-semibold text-base">1. กำหนดจำนวนวันลามาตรฐาน</Label>
              <div className="flex flex-col gap-2">
                {Object.entries(LEAVE_TYPES).map(([key, name]) => (
                  <div key={key} className="flex justify-between items-center">
                    <Label htmlFor={`bulk-${key}`}>{name}</Label>
                    <Input
                      id={`bulk-${key}`}
                      type="number"
                      value={bulkFormState[key]}
                      onChange={(e) => handleBulkFormChange(key, e.target.value)}
                      min="0"
                      className="basis-2/4"
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <Label className="font-semibold text-base">2. กลุ่มพนักงานเป้าหมาย</Label>
              <RadioGroup defaultValue="all-pending" disabled>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all-pending" id="r1" />
                  <Label htmlFor="r1">พนักงานทุกคนที่ยังไม่มีโควต้า ({pendingEmployeesCount} คน)</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsBulkDialog(false)}>ยกเลิก</Button>
            <Button onClick={handleBulkCreate} disabled={pendingEmployeesCount === 0}>
              {pendingEmployeesCount > 0 ? `ยืนยันและสร้าง ${pendingEmployeesCount} โควต้า` : 'ไม่พบพนักงานให้สร้าง'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!toDelete} onOpenChange={() => setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
            <AlertDialogDescription>
              คุณแน่ใจหรือไม่ที่จะลบโควต้าของ {toDelete?.employeeName} ในปี {toDelete?.year} การกระทำนี้ไม่สามารถย้อนกลับได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">ยืนยัน</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default LeaveEntitlementPage;
