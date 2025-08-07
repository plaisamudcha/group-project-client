import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from 'react-toastify';
import { Pencil, UserPlus, Clock, Users, Shield, Plus, Search, CheckCircle2, AlertCircle, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import admintoApi from "@/src/api/adminApi";
import employeeApi from "@/src/api/employeeApi";

function WorkPolicyManagementPage() {
  const [policies, setPolicies] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [editingPolicy, setEditingPolicy] = useState(null)
  const [isAssignOpen, setIsAssignOpen] = useState(false)
  const [selectedPolicy, setSelectedPolicy] = useState(null)
  const [employees, setEmployees] = useState([])
  const [selectedEmployees, setSelectedEmployees] = useState([])
  const [searchEmployee, setSearchEmployee] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [remarkDialogOpen, setRemarkDialogOpen] = useState(false)
  const [selectedRemark, setSelectedRemark] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    startTime: '',
    endTime: '',
    allowedLateMinutesPerMonth: '',
    deductIfLateOver: '',
    halfDayAbsentRule: '1',
    minHoursForHalfDay: '',
    remark: '',
    workingDays: []
  })

  // ดึงข้อมูล policies และ employees เมื่อ component mount
  useEffect(() => {
    fetchPolicies()
    fetchEmployees()
  }, [])

  const fetchPolicies = async () => {
    try {
      setLoading(true)
      const response = await admintoApi.fetchPolicies()
      setPolicies(response.data.policies || response.data || [])
    } catch (error) {
      console.error("Error fetching policies:", error)
      toast.error("ไม่สามารถดึงข้อมูล policies ได้")
    } finally {
      setLoading(false)
    }
  }

  const fetchEmployees = async () => {
    try {
      const response = await admintoApi.getAllUser()
      console.log("Employees response:", response.data)
      
      const employeesData = response.data.users || 
                           response.data.employees || 
                           response.data.data || 
                           response.data || 
                           []
      
      console.log("Processed employees data:", employeesData)
      console.log("First employee:", employeesData[0])
      
      setEmployees(employeesData)
    } catch (error) {
      console.error("Error fetching employees:", error)
      toast.error("ไม่สามารถดึงข้อมูล employees ได้")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitLoading(true)

    try {
      const dataToSend = {
        name: formData.name.trim(),
        startTime: formData.startTime,
        endTime: formData.endTime,
        allowedLateMinutesPerMonth: parseInt(formData.allowedLateMinutesPerMonth) || 0,
        deductIfLateOver: parseInt(formData.deductIfLateOver) || 0,
        halfDayAbsentRule: parseFloat(formData.halfDayAbsentRule) || 1,
        minHoursForHalfDay: parseInt(formData.minHoursForHalfDay) || 4,
        remark: formData.remark,
        workingDays: formData.workingDays.length > 0 ? formData.workingDays : ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']
      }

      if (editingPolicy) {
        await admintoApi.updatePolicy(editingPolicy.id, dataToSend)
        toast.success("อัพเดท Policy สำเร็จ!")
      } else {
        await admintoApi.createPolicy(dataToSend)
        toast.success("สร้าง Policy สำเร็จ!")
      }
      
      await fetchPolicies()
      handleCancel()
    } catch (error) {
      console.error("Error saving policy:", error)
      toast.error(error.response?.data?.message || error.message || "ไม่สามารถบันทึก Policy ได้")
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleAssignClick = async (policy) => {
    setSelectedPolicy(policy)
    setIsAssignOpen(true)
  }

  const handleAssignSubmit = async () => {
    if (!selectedPolicy || selectedEmployees.length === 0) {
      toast.warn("กรุณาเลือก employee อย่างน้อย 1 คน")
      return
    }

    setSubmitLoading(true)
    try {
      const assignData = {
        policyId: selectedPolicy.id,
        employeeIds: selectedEmployees
      }
      
      await admintoApi.assignPolicy(assignData)
      
      const selectedEmployeeNames = employees
        .filter(emp => selectedEmployees.includes(emp.id))
        .map(emp => emp.name || 'Unknown Name')
      
      setIsAssignOpen(false)
      setSelectedPolicy(null)
      setSelectedEmployees([])
      setSearchEmployee('')
      
      toast.success(`มอบหมาย Policy "${selectedPolicy.name}" ให้กับ ${selectedEmployeeNames.length} คน สำเร็จ!`)
    } catch (error) {
      console.error("Error assigning policy:", error)
      toast.error(error.response?.data?.message || error.message || "ไม่สามารถมอบหมาย Policy ได้")
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleDeletePolicy = async (policyId) => {
    // ใช้ confirm dialog แทน alert สำหรับการยืนยัน
    if (!window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบ Policy นี้?")) {
      return
    }

    try {
      await admintoApi.deletePolicy(policyId)
      toast.success("ลบ Policy สำเร็จ!")
      await fetchPolicies()
    } catch (error) {
      console.error("Error deleting policy:", error)
      toast.error(error.response?.data?.message || error.message || "ไม่สามารถลบ Policy ได้")
    }
  }

  const handleCheckboxChange = (day) => {
    setFormData(prev => {
      const updatedDays = prev.workingDays.includes(day)
        ? prev.workingDays.filter(d => d !== day)
        : [...prev.workingDays, day]
      return { ...prev, workingDays: updatedDays }
    })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleEditClick = (policy) => {
    setEditingPolicy(policy)
    setFormData({
      name: policy.name || '',
      startTime: policy.startTime || '',
      endTime: policy.endTime || '',
      allowedLateMinutesPerMonth: policy.allowedLateMinutesPerMonth || '',
      deductIfLateOver: policy.deductIfLateOver || '',
      halfDayAbsentRule: policy.halfDayAbsentRule || '1',
      minHoursForHalfDay: policy.minHoursForHalfDay || '',
      remark: policy.remark || '',
      workingDays: policy.workingDays || []
    })
    setIsOpen(true)
  }

  const handleEmployeeToggle = (employeeId) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    )
  }

  // เพิ่ม function แยกสำหรับ checkbox เพื่อป้องกัน event bubbling
  const handleCheckboxToggle = (e, employeeId) => {
    e.stopPropagation()
    handleEmployeeToggle(employeeId)
  }

  const handleCancel = () => {
    setIsOpen(false)
    setEditingPolicy(null)
    setFormData({
      name: '',
      startTime: '',
      endTime: '',
      allowedLateMinutesPerMonth: '',
      deductIfLateOver: '',
      halfDayAbsentRule: '1',
      minHoursForHalfDay: '',
      remark: '',
      workingDays: []
    })
  }

  const handleViewRemark = (policy) => {
    setSelectedRemark({
      policyName: policy.name,
      remark: policy.remark || 'ไม่มีหมายเหตุ'
    })
    setRemarkDialogOpen(true)
  }

  const getPolicyTypeColor = (policy) => {
    if (policy.name?.includes('Executive')) return 'bg-purple-100 text-purple-800 border-purple-200'
    if (policy.name?.includes('Shift')) return 'bg-orange-100 text-orange-800 border-orange-200'
    return 'bg-blue-100 text-blue-800 border-blue-200'
  }

  const formatWorkingDays = (days) => {
    if (!Array.isArray(days) || days.length === 0) return 'Not specified'
    const dayMap = {
      'MONDAY': 'Mon', 'TUESDAY': 'Tue', 'WEDNESDAY': 'Wed', 
      'THURSDAY': 'Thu', 'FRIDAY': 'Fri', 'SATURDAY': 'Sat', 'SUNDAY': 'Sun'
    }
    return days.map(day => dayMap[day] || day).join(', ')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto p-4 md:px-8 lg:px-12 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8 mt-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Work Policies
              </h1>
              <p className="text-gray-600 mt-1 text-lg">
                Manage company policies related to employment, conduct, and operations
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Policies</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{policies.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Active Employees</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{employees.length}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Avg. Work Hours</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">8.5</p>
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
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-900">Policy Management</h2>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {policies.length} policies
                </Badge>
              </div>

              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Policy
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                      {editingPolicy ? "Edit Work Policy" : "Create New Work Policy"}
                    </DialogTitle>
                    <DialogDescription className="text-gray-600">
                      {editingPolicy ? "Update work policy with new configurations." : "Create a new work policy with specific rules and configurations."}
                    </DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <Label htmlFor="name" className="text-sm font-semibold text-gray-700">Policy Name</Label>
                        <Input
                          id="name"
                          name="name"
                          autoComplete="off"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Enter policy name"
                          className="mt-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="startTime" className="text-sm font-semibold text-gray-700">Start Time</Label>
                        <Input
                          id="startTime"
                          name="startTime"
                          type="time"
                          value={formData.startTime}
                          onChange={handleInputChange}
                          className="mt-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="endTime" className="text-sm font-semibold text-gray-700">End Time</Label>
                        <Input
                          id="endTime"
                          name="endTime"
                          type="time"
                          value={formData.endTime}
                          onChange={handleInputChange}
                          className="mt-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="allowedLate" className="text-sm font-semibold text-gray-700">Allowed Late (min/month)</Label>
                        <Input
                          id="allowedLate"
                          name="allowedLateMinutesPerMonth"
                          type="number"
                          value={formData.allowedLateMinutesPerMonth}
                          onChange={handleInputChange}
                          placeholder="30"
                          className="mt-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <Label htmlFor="deductLate" className="text-sm font-semibold text-gray-700">Deduct Late (minutes)</Label>
                        <Input
                          id="deductLate"
                          name="deductIfLateOver"
                          type="number"
                          value={formData.deductIfLateOver}
                          onChange={handleInputChange}
                          placeholder="0"
                          className="mt-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <Label htmlFor="halfDayRule" className="text-sm font-semibold text-gray-700">Half Day Rule</Label>
                        <select
                          id="halfDayRule"
                          name="halfDayAbsentRule"
                          value={formData.halfDayAbsentRule}
                          onChange={handleInputChange}
                          className="mt-2 flex h-10 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                          <option value="1">None</option>
                          <option value="0.5">0.5</option>
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="minHoursHalfday" className="text-sm font-semibold text-gray-700">Min Hours Half Day</Label>
                        <Input
                          id="minHoursHalfday"
                          name="minHoursForHalfDay"
                          type="number"
                          value={formData.minHoursForHalfDay}
                          onChange={handleInputChange}
                          placeholder="4"
                          className="mt-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Label className="text-sm font-semibold text-gray-700 mb-3 block">Working Days</Label>
                        <div className="grid grid-cols-4 gap-3">
                          {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map((day) => (
                            <div key={day} className="flex items-center space-x-2 p-2 rounded-lg border border-gray-200 hover:bg-gray-50">
                              <input
                                type="checkbox"
                                id={day}
                                checked={formData.workingDays.includes(day)}
                                onChange={() => handleCheckboxChange(day)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <Label htmlFor={day} className="text-sm font-medium cursor-pointer">
                                {day.slice(0, 3)}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <Label htmlFor="remark" className="text-sm font-semibold text-gray-700">Remarks</Label>
                        <Textarea
                          id="remark"
                          name="remark"
                          value={formData.remark}
                          onChange={handleInputChange}
                          placeholder="Additional notes and comments..."
                          rows={3}
                          className="mt-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <DialogFooter className="gap-3">
                      <Button type="button" variant="outline" onClick={handleCancel} className="px-6" disabled={submitLoading}>
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-6" disabled={submitLoading}>
                        {submitLoading ? "Saving..." : (editingPolicy ? "Update Policy" : "Create Policy")}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50 hover:bg-gray-50">
                  <TableHead className="font-bold text-gray-800 py-4">Policy Name</TableHead>
                  <TableHead className="text-center font-bold text-gray-800">Time Schedule</TableHead>
                  <TableHead className="text-center font-bold text-gray-800">Late Rules</TableHead>
                  <TableHead className="text-center font-bold text-gray-800">Half Day</TableHead>
                  <TableHead className="text-center font-bold text-gray-800">Working Days</TableHead>
                  <TableHead className="text-center font-bold text-gray-800">Remark</TableHead>
                  <TableHead className="text-center font-bold text-gray-800">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2">Loading policies...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : policies.length > 0 ? (
                  policies.map((policy, index) => (
                    <TableRow key={policy.id} className="hover:bg-blue-50/50 transition-colors duration-200">
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{policy.name}</p>
                            <Badge className={`mt-1 text-xs ${getPolicyTypeColor(policy)}`}>
                              {policy.name?.includes('Executive') ? 'Executive' : 
                               policy.name?.includes('Shift') ? 'Shift Work' : 'Standard'}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center justify-center gap-2 text-sm font-medium">
                            <Clock className="h-4 w-4 text-blue-600" />
                            {policy.startTime} - {policy.endTime}
                          </div>
                          <span className="text-xs text-gray-500">
                            {Math.round(Math.abs(new Date(`2000-01-01 ${policy.endTime}`) - new Date(`2000-01-01 ${policy.startTime}`)) / (1000 * 60 * 60))} hours
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col gap-1">
                          <div className="text-sm font-medium text-green-700">
                            {policy.allowedLateMinutesPerMonth} min/month
                          </div>
                          <div className="text-xs text-red-600">
                            Deduct: {policy.deductIfLateOver} min
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col gap-1">
                          <div className="text-sm font-medium">
                            Rule: {policy.halfDayAbsentRule}
                          </div>
                          <div className="text-xs text-gray-500">
                            Min: {policy.minHoursForHalfDay}h
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="text-sm font-medium text-blue-700">
                          {formatWorkingDays(policy.workingDays)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {policy.workingDays?.length || 0} days/week
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleViewRemark(policy)}
                          className="hover:bg-purple-100 hover:text-purple-700 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleEditClick(policy)}
                            className="hover:bg-blue-100 hover:text-blue-700 transition-colors"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleAssignClick(policy)}
                            className="hover:bg-green-100 hover:text-green-700 transition-colors"
                          >
                            <UserPlus className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                          <Shield className="h-8 w-8 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-gray-600">No policies found</p>
                          <p className="text-gray-500 mt-1">Create your first work policy to get started</p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Remark Dialog */}
        <Dialog open={remarkDialogOpen} onOpenChange={setRemarkDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Policy Remark
              </DialogTitle>
              <DialogDescription>
                หมายเหตุสำหรับ "{selectedRemark?.policyName}"
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-gray-700 leading-relaxed">
                  {selectedRemark?.remark}
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setRemarkDialogOpen(false)}
                className="px-6"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Assign Policy Dialog */}
        <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
          <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Assign Policy to Employees
              </DialogTitle>
              <DialogDescription>
                เลือก employees ที่ต้องการให้ใช้ policy "{selectedPolicy?.name}"
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 flex flex-col space-y-4 min-h-0">
              {/* Search and Filter Controls */}
              <div className="flex-shrink-0">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="ค้นหา employee..."
                      value={searchEmployee}
                      onChange={(e) => setSearchEmployee(e.target.value)}
                      className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setSelectedEmployees(employees.map(emp => emp.id))}
                      className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      เลือกทั้งหมด
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setSelectedEmployees([])}
                      className="hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                    >
                      <AlertCircle className="h-4 w-4 mr-1" />
                      ยกเลิกทั้งหมด
                    </Button>
                  </div>
                </div>
              </div>

              {/* Employee List */}
              <div className="flex-1 border rounded-xl overflow-hidden bg-gray-50/30 min-h-0">
                {employees.length > 0 ? (
                  <div className="h-full overflow-y-auto">
                    <div className="p-3 space-y-2">
                      {employees
                        .filter(employee => {
                          const name = employee.name || '';
                          const email = employee.email || '';
                          const role = employee.role || '';
                          const searchTerm = searchEmployee.toLowerCase();
                          
                          return name.toLowerCase().includes(searchTerm) ||
                                 email.toLowerCase().includes(searchTerm) ||
                                 role.toLowerCase().includes(searchTerm);
                        })
                        .map((employee) => (
                        <div 
                          key={employee.id} 
                          className={`flex items-center p-3 rounded-lg border transition-all duration-200 cursor-pointer
                            ${selectedEmployees.includes(employee.id) 
                              ? 'bg-blue-50 border-blue-200 shadow-sm' 
                              : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                            }`}
                          onClick={() => handleEmployeeToggle(employee.id)}
                        >
                          {/* Checkbox */}
                          <div className="flex items-center justify-center w-5 h-5 mr-3" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              id={`employee-${employee.id}`}
                              checked={selectedEmployees.includes(employee.id)}
                              onChange={(e) => handleCheckboxToggle(e, employee.id)}
                              className="w-4 h-4 text-blue-600 bg-white border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-1 cursor-pointer"
                            />
                          </div>

                          {/* Employee Info */}
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow flex-shrink-0">
                              <span className="text-white font-bold text-sm">
                                {(employee.name || 'U').charAt(0)}
                                {employee.name && employee.name.split(' ').length > 1 
                                  ? employee.name.split(' ')[1].charAt(0) 
                                  : 'N'}
                              </span>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-gray-900 text-sm truncate">
                                  {employee.name || 'Unknown Name'}
                                </h4>
                                {employee.currentPolicy && (
                                  <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200 flex-shrink-0">
                                    Current: {employee.currentPolicy}
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-3">
                                <p className="text-gray-600 flex items-center gap-1 truncate text-xs">
                                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"></span>
                                  <span className="truncate">{employee.email || 'No email'}</span>
                                </p>
                                <p className="text-gray-500 text-xs flex-shrink-0">
                                  {employee.role || 'No Role'} 
                                  {employee.employmentType && ` • ${employee.employmentType}`}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Selected Indicator */}
                          <div className="flex items-center justify-center w-5 h-5 ml-3">
                            {selectedEmployees.includes(employee.id) && (
                              <CheckCircle2 className="h-4 w-4 text-blue-600" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Users className="h-6 w-6 text-gray-400" />
                      </div>
                      <p className="text-sm font-medium text-gray-600">ไม่พบข้อมูล employees</p>
                      <p className="text-xs text-gray-500 mt-1">ลองค้นหาด้วยคำอื่น</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Selected Count and Summary */}
              <div className="flex-shrink-0 bg-blue-50 rounded-lg p-3 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-900 text-sm">
                      เลือกแล้ว: {selectedEmployees.length} คน
                    </span>
                  </div>
                  {selectedEmployees.length > 0 && (
                    <div className="text-xs text-blue-700">
                      พร้อมมอบหมาย Policy "{selectedPolicy?.name}"
                    </div>
                  )}
                </div>
                {selectedEmployees.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {employees
                      .filter(emp => selectedEmployees.includes(emp.id))
                      .slice(0, 4)
                      .map(emp => (
                        <Badge key={emp.id} variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                          {emp.name || 'Unknown Name'}
                        </Badge>
                      ))
                    }
                    {selectedEmployees.length > 4 && (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
                        +{selectedEmployees.length - 4} more
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="flex-shrink-0 gap-2 pt-4 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsAssignOpen(false)
                  setSelectedPolicy(null)
                  setSelectedEmployees([])
                  setSearchEmployee('')
                }}
                className="px-4"
                disabled={submitLoading}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={handleAssignSubmit} 
                disabled={selectedEmployees.length === 0 || submitLoading}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <UserPlus className="h-4 w-4 mr-1" />
                {submitLoading ? "Assigning..." : `Assign Policy (${selectedEmployees.length})`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default WorkPolicyManagementPage;