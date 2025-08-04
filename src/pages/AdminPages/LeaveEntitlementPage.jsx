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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Loader2, 
  Pencil, 
  PlusCircle, 
  Trash2, 
  Users, 
  XCircle, 
  Calendar,
  UserCheck,
  Clock,
  TrendingUp,
  RefreshCw,
  FileText,
  CheckCircle2
} from "lucide-react";
import admintoApi from "@/src/api/adminApi";

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
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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
    try {
      setIsLoading(true);
      setError(null);

      const response = await admintoApi.getAllUser();
      const users = response.data.users;

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

  const handleRefresh = () => {
    loadData();
  };

  const pendingEmployeesCount = entitlements.filter(e => e.leaves.length === 0).length;
  const totalEmployees = entitlements.length;
  const employeesWithQuota = entitlements.filter(e => e.leaves.length > 0).length;
  
  // คำนวณวันลาเฉลี่ย
  const avgLeaveDays = entitlements.filter(e => e.leaves.length > 0).reduce((sum, emp) => {
    const totalDays = emp.leaves.reduce((total, leave) => total + leave.total, 0);
    return sum + totalDays;
  }, 0) / Math.max(employeesWithQuota, 1);

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
    if (isSaving) return;
    
    const isEditing = !!editingEntitlement;

    if (!isEditing && !selectedNewUserId) {
      alert("กรุณาเลือกพนักงาน");
      return;
    }

    setIsSaving(true);

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
    } catch (err) {
      console.error("เกิดข้อผิดพลาดในการบันทึก:", err);
      alert("ไม่สามารถบันทึกข้อมูลได้: " + (err.response?.data?.message || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  const handleBulkFormChange = (leaveType, value) => {
    setBulkFormState(prev => ({ ...prev, [leaveType]: parseInt(value, 10) || 0 }));
  };

  const handleBulkCreate = async () => {
    if (isSaving) return;
    
    const employeesToUpdate = entitlements.filter(e => e.leaves.length === 0);
    if (employeesToUpdate.length === 0) {
      alert("ไม่พบพนักงานที่รอการสร้างโควต้าในปีที่เลือก");
      return;
    }

    setIsSaving(true);

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
    } catch (err) {
      console.error("เกิดข้อผิดพลาดในการสร้างโควต้าแบบกลุ่ม:", err);
      alert("ไม่สามารถสร้างโควต้าได้: " + (err.response?.data?.message || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!toDelete || isDeleting) return;

    setIsDeleting(true);
    try {
      await admintoApi.deleteUserEntitlements(toDelete.id, toDelete.year);
      await loadData();
      setToDelete(null);
    } catch (err) {
      console.error("เกิดข้อผิดพลาดในการลบ:", err);
      alert("ไม่สามารถลบข้อมูลได้: " + (err.response?.data?.message || err.message));
    } finally {
      setIsDeleting(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col justify-center items-center">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button 
            onClick={() => loadData()} 
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
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
            <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Leave Entitlements
              </h1>
              <p className="text-gray-600 mt-1 text-lg">
                Manage employee leave quotas and track annual entitlements
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Employees</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{totalEmployees}</p>
                </div>
                <div className="p-3 bg-indigo-100 rounded-xl">
                  <Users className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">With Quota</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{employeesWithQuota}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Pending Setup</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{pendingEmployeesCount}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-xl">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Avg Leave Days</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{avgLeaveDays.toFixed(1)}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
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
                <h2 className="text-2xl font-bold text-gray-900">Leave Quotas</h2>
                <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                  {selectedYear}
                </Badge>
                
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-28 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableYears.map(year => (
                      <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleOpenSingleDialog()} 
                  disabled={eligibleUsers.length === 0 || isLoading}
                  className="hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Individual
                </Button>
                <Button 
                  onClick={() => setIsBulkDialog(true)}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                >
                  <Users className="mr-2 h-4 w-4" />
                  Bulk Create
                  {pendingEmployeesCount > 0 && (
                    <Badge variant="secondary" className="ml-2 bg-white text-indigo-700">
                      {pendingEmployeesCount}
                    </Badge>
                  )}
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
                  {Object.values(LEAVE_TYPES).map(name => (
                    <TableHead key={name} className="text-center font-bold text-gray-800 min-w-[120px]">{name}</TableHead>
                  ))}
                  <TableHead className="text-center font-bold text-gray-800 min-w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={Object.keys(LEAVE_TYPES).length + 2} className="text-center py-12">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        <span className="ml-2">Loading leave entitlements...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : entitlements.length > 0 ? (
                  entitlements.map((item) => (
                    <TableRow key={item.id} className="hover:bg-indigo-50/50 transition-colors duration-200">
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {item.employeeName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{item.employeeName}</p>
                            <p className="text-sm text-gray-500">Employee ID: {item.id}</p>
                          </div>
                        </div>
                      </TableCell>
                      {Object.keys(LEAVE_TYPES).map(leaveKey => {
                        const leaveData = getLeaveData(item.leaves, leaveKey);
                        return (
                          <TableCell key={leaveKey} className="text-center">
                            {item.leaves.length > 0 ? (
                              <div className="flex flex-col gap-1">
                                <span className="font-medium">{`${leaveData.used} / ${leaveData.total}`}</span>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full" 
                                    style={{ width: `${Math.min((leaveData.used / Math.max(leaveData.total, 1)) * 100, 100)}%` }}
                                  ></div>
                                </div>
                              </div>
                            ) : (
                              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                No Quota
                              </Badge>
                            )}
                          </TableCell>
                        );
                      })}
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleOpenSingleDialog(item)}
                            className="hover:bg-blue-100 hover:text-blue-700"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-red-100 hover:text-red-700"
                            onClick={() => setToDelete(item)}
                            disabled={item.leaves.length === 0}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={Object.keys(LEAVE_TYPES).length + 2} className="text-center py-12">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                          <FileText className="h-8 w-8 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-gray-600">No employees found</p>
                          <p className="text-gray-500 mt-1">No employee data available for {selectedYear}</p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Single Employee Dialog */}
        <Dialog open={isSingleDialog} onOpenChange={setIsSingleDialog}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900">
                {editingEntitlement ? (editingEntitlement.leaves.length > 0 ? `Edit Quota: ${editingEntitlement.employeeName}` : `Create Quota: ${editingEntitlement.employeeName}`) : 'Add New Employee Quota'}
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Set leave days for year {selectedYear}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {!editingEntitlement && (
                <div className="space-y-2">
                  <Label htmlFor="employeeName" className="text-sm font-semibold text-gray-700">Employee Name</Label>
                  <Select value={selectedNewUserId} onValueChange={setSelectedNewUserId}>
                    <SelectTrigger className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500">
                      <SelectValue placeholder="Select employee..." />
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
                <div key={key} className="space-y-2">
                  <Label htmlFor={key} className="text-sm font-semibold text-gray-700">{name}</Label>
                  <Input
                    id={key}
                    type="number"
                    value={formState[key] || 0}
                    onChange={(e) => handleFormChange(key, e.target.value)}
                    min="0"
                    disabled={isSaving}
                    className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              ))}
            </div>
            <DialogFooter className="gap-3">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isSaving}>
                  Cancel
                </Button>
              </DialogClose>
              <Button 
                onClick={handleSave} 
                disabled={isSaving}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Bulk Create Dialog */}
        <Dialog open={isBulkDialog} onOpenChange={setIsBulkDialog}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900">
                🚀 Create Leave Quotas for {selectedYear}
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Set standard quotas for {pendingEmployeesCount} employees without data in selected year
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-6">
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700">1. Set Standard Leave Days</Label>
                <div className="space-y-3">
                  {Object.entries(LEAVE_TYPES).map(([key, name]) => (
                    <div key={key} className="space-y-2">
                      <Label htmlFor={`bulk-${key}`} className="text-sm font-medium text-gray-700">{name}</Label>
                      <Input
                        id={`bulk-${key}`}
                        type="number"
                        value={bulkFormState[key]}
                        onChange={(e) => handleBulkFormChange(key, e.target.value)}
                        min="0"
                        disabled={isSaving}
                        className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700">2. Target Employees</Label>
                <RadioGroup defaultValue="all-pending" disabled>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all-pending" id="r1" />
                    <Label htmlFor="r1">All employees without quota ({pendingEmployeesCount} people)</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
            <DialogFooter className="gap-3">
              <Button variant="outline" onClick={() => setIsBulkDialog(false)} disabled={isSaving}>
                Cancel
              </Button>
              <Button 
                onClick={handleBulkCreate} 
                disabled={pendingEmployeesCount === 0 || isSaving}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  pendingEmployeesCount > 0 ? `Create ${pendingEmployeesCount} Quotas` : 'No Employees to Create'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!toDelete} onOpenChange={() => setToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-bold text-gray-900">
                Confirm Delete
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600">
                Are you sure you want to delete {toDelete?.employeeName}'s quota for {toDelete?.year}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-3">
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete} 
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Confirm Delete'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

export default LeaveEntitlementPage;