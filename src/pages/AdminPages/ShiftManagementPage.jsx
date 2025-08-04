import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { 
  Clock, 
  PlusCircle, 
  Pencil, 
  XCircle, 
  Users, 
  UserPlus,
  Building2,
  Timer,
  Calendar,
  RefreshCw
} from "lucide-react";
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
        await loadData();
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
        await loadData();
        setIsManageEmployeeDialogOpen(false);
    } catch (err) {
        console.error("Failed to remove employee:", err);
        toast.error("ไม่สามารถนำพนักงานออกได้");
    }
  };

  const availableUsers = Array.isArray(allUsers) ? allUsers.filter(user => 
    user.employeeProfile &&
    !(managingShift?.employeeProfiles || []).some(profile => profile?.user?.id === user.id)
  ) : [];

  // คำนวณสถิติ
  const totalShifts = shifts.length;
  const totalEmployees = shifts.reduce((sum, shift) => sum + (shift.employeeProfiles?.length || 0), 0);
  const avgEmployeesPerShift = totalShifts > 0 ? (totalEmployees / totalShifts).toFixed(1) : 0;
  const activeShifts = shifts.filter(shift => (shift.employeeProfiles?.length || 0) > 0).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex justify-center items-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-lg text-gray-600">Loading shift data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col justify-center items-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <XCircle className="h-8 w-8 text-red-600" />
        </div>
        <h2 className="text-xl font-semibold text-red-600">{error}</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto p-4 md:px-8 lg:px-12 max-w-7xl">
        
        {/* Header Section */}
        <div className="mb-8 mt-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl shadow-lg">
              <Clock className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Shift Management
              </h1>
              <p className="text-gray-600 mt-1 text-lg">
                Manage work shifts and assign employees to optimize workplace scheduling
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Shifts</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{totalShifts}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Building2 className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
            
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
                  <p className="text-gray-600 text-sm font-medium">Active Shifts</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{activeShifts}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <Timer className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Avg Per Shift</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{avgEmployeesPerShift}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-xl">
                  <Calendar className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          
          {/* Toolbar */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-900">Work Shifts</h2>
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  {totalShifts} shifts
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={loadData}
                  disabled={isLoading}
                  className="hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button 
                  onClick={() => handleOpenShiftDialog()}
                  className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add New Shift
                </Button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50 hover:bg-gray-50">
                  <TableHead className="font-bold text-gray-800 py-4">Shift Name</TableHead>
                  <TableHead className="text-center font-bold text-gray-800">Start Time</TableHead>
                  <TableHead className="text-center font-bold text-gray-800">End Time</TableHead>
                  <TableHead className="text-center font-bold text-gray-800">Duration</TableHead>
                  <TableHead className="text-center font-bold text-gray-800">Employees</TableHead>
                  <TableHead className="text-center font-bold text-gray-800">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shifts.length > 0 ? (
                  shifts.map((shift) => {
                    const duration = shift.inTime && shift.outTime 
                      ? `${Math.abs(parseInt(shift.outTime.split(':')[0]) - parseInt(shift.inTime.split(':')[0]))} hrs`
                      : 'N/A';
                    
                    return (
                      <TableRow key={shift.id} className="hover:bg-blue-50/50 transition-colors duration-200">
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                              <Clock className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <span className="font-semibold text-gray-900">{shift.name}</span>
                              <p className="text-sm text-gray-500">Work Shift</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            {shift.inTime}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                            {shift.outTime}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {duration}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Users className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">{shift.employeeProfiles?.length || 0}</span>
                            <span className="text-gray-500 text-sm">people</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleOpenManageEmployeeDialog(shift)}
                              className="hover:bg-blue-100 hover:text-blue-700"
                            >
                              <UserPlus className="mr-1 h-4 w-4" />
                              <span className="hidden md:inline">Manage</span>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleOpenShiftDialog(shift)}
                              className="hover:bg-purple-100 hover:text-purple-700"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                          <Clock className="h-8 w-8 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-gray-600">No shifts found</p>
                          <p className="text-gray-500 mt-1">Create your first work shift to get started</p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Create/Edit Shift Dialog */}
        <Dialog open={isShiftDialogOpen} onOpenChange={setIsShiftDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900">
                {editingShift ? 'Edit Work Shift' : 'Create New Shift'}
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Fill in the shift details below to {editingShift ? 'update' : 'create'} the work schedule
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">Shift Name</Label>
                <Input 
                  id="name" 
                  name="name" 
                  value={formState.name} 
                  onChange={handleFormChange}
                  placeholder="e.g., Morning Shift"
                  className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="inTime" className="text-sm font-medium text-gray-700">Start Time</Label>
                <Input 
                  id="inTime" 
                  name="inTime" 
                  type="time" 
                  value={formState.inTime} 
                  onChange={handleFormChange}
                  className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="outTime" className="text-sm font-medium text-gray-700">End Time</Label>
                <Input 
                  id="outTime" 
                  name="outTime" 
                  type="time" 
                  value={formState.outTime} 
                  onChange={handleFormChange}
                  className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button 
                onClick={handleSaveShift}
                className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
              >
                {editingShift ? 'Update' : 'Create'} Shift
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Manage Employees Dialog */}
        <Dialog open={isManageEmployeeDialogOpen} onOpenChange={setIsManageEmployeeDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900">
                Manage Employees - "{managingShift?.name}"
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Add or remove employees from this shift schedule
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-6">
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-3 block">Current Employees</Label>
                <div className="border border-gray-200 rounded-lg p-3 space-y-2 max-h-40 overflow-y-auto bg-gray-50">
                  {(managingShift?.employeeProfiles || []).length > 0 ? (
                    managingShift.employeeProfiles.map(profile => (
                      <div key={profile?.user?.id} className="flex justify-between items-center bg-white p-3 rounded-md border border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {profile?.user?.name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="font-medium text-gray-900">{profile?.user?.name}</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700 hover:bg-red-50" 
                          onClick={() => handleRemoveEmployee(profile?.user?.id)}
                        >
                          <XCircle className="h-4 w-4 mr-1"/>
                          Remove
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm text-gray-500">No employees assigned to this shift yet</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-3 block">Add New Employee</Label>
                <div className="flex gap-2">
                  <Select onValueChange={setSelectedUserId} value={selectedUserId}>
                    <SelectTrigger className="flex-1 border-gray-300 focus:border-purple-500 focus:ring-purple-500">
                      <SelectValue placeholder="Select an employee..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableUsers.length > 0 ? (
                        availableUsers.map(user => (
                          <SelectItem key={user.id} value={String(user.id)}>
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-xs">
                                  {user.name?.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              {user.name}
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-3 text-sm text-gray-500 text-center">
                          No available employees found
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={handleAddEmployee} 
                    disabled={!selectedUserId}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  >
                    <PlusCircle className="h-4 w-4 mr-2"/>
                    Add
                  </Button>
                </div>
              </div>
            </div>
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

export default ShiftManagementPage;