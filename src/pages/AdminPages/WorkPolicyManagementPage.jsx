import { Badge } from "@/components/ui/badge.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label.jsx";
import { Textarea } from "@/components/ui/textarea.jsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table.jsx";
import { Pencil, UserPlus } from "lucide-react";
import workPolicyToApi from "@/src/api/workPolicyApi.js";
import { useEffect, useState } from "react";

function WorkPolicyManagementPage() {
  const [policies, setPolicies] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [editingPolicy, setEditingPolicy] = useState(null)
  const [isAssignOpen, setIsAssignOpen] = useState(false)
  const [selectedPolicy, setSelectedPolicy] = useState(null)
  const [employees, setEmployees] = useState([])
  const [selectedEmployees, setSelectedEmployees] = useState([])
  const [searchEmployee, setSearchEmployee] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    startTime: '',
    endTime: '',
    allowedLateMinutesPerMonth: '',
    deductIfLateOver: '',
    halfDayAbsentRule: '',
    minHoursForHalfDay: '',
    remark: '',
    workingDays: []
  })

  const fetchPolicies = async () => {
    try {
      const response = await workPolicyToApi.fetchPolicies()
      setPolicies(response.data.policies)
      return response
    } catch (error) {
      console.error("Error fetching policies:", error)
    }
  }

  const fetchEmployees = async () => {
    try {
      // Mock data สำหรับทดสอบ UI
      const mockEmployees = [
        {
          id: 1,
          firstName: "สมชาย",
          lastName: "ใจดี",
          email: "somchai@company.com",
          department: "IT Department",
          currentPolicy: "Standard Policy"
        },
        {
          id: 2,
          firstName: "สมหญิง",
          lastName: "รักงาน",
          email: "somying@company.com",
          department: "HR Department",
          currentPolicy: null
        },
        {
          id: 3,
          firstName: "นายโจ",
          lastName: "บิ๊กบอส",
          email: "joe@company.com",
          department: "Management",
          currentPolicy: "Executive Policy"
        },
        {
          id: 4,
          firstName: "มารี",
          lastName: "แอดมิน",
          email: "marie@company.com",
          department: "Finance",
          currentPolicy: null
        },
        {
          id: 5,
          firstName: "ปิเตอร์",
          lastName: "เดฟ",
          email: "peter@company.com",
          department: "IT Department",
          currentPolicy: "Standard Policy"
        }
      ]
      
      setEmployees(mockEmployees)
      console.log("Mock employees loaded:", mockEmployees)
    } catch (error) {
      console.error("Error fetching employees:", error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // Process data ก่อนส่ง
      const dataToSend = {
        name: formData.name.trim(),
        startTime: formData.startTime,
        endTime: formData.endTime,
        allowedLateMinutesPerMonth: parseFloat(formData.allowedLateMinutesPerMonth) || 0,
        deductIfLateOver: parseFloat(formData.deductIfLateOver) || 0,
        halfDayAbsentRule: parseFloat(formData.halfDayAbsentRule) || 0.5,
        minHoursForHalfDay: parseFloat(formData.minHoursForHalfDay) || 4,
        remark: formData.remark,
        workingDays: formData.workingDays.length > 0 ? formData.workingDays : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
      }

      console.log("Sending data:", dataToSend)
      
      if (editingPolicy) {
        // Update existing policy
        await workPolicyToApi.updatePolicy(editingPolicy.id, dataToSend)
        console.log("Policy updated")
      } else {
        // Create new policy
        await workPolicyToApi.postPolicy(dataToSend)
        console.log("Policy created")
      }
      
      setIsOpen(false)
      setEditingPolicy(null)

      // Reset form
      setFormData({
        name: '',
        startTime: '',
        endTime: '',
        allowedLateMinutesPerMonth: '',
        deductIfLateOver: '',
        halfDayAbsentRule: '',
        minHoursForHalfDay: '',
        remark: '',
        workingDays: []
      })
      fetchPolicies()
    } catch (error) {
      console.error("Error saving policy:", error)
    }
  }

  const handleCheckboxChange = (day) => {
    setFormData(prev => {
      const updatedDays = prev.workingDays.includes(day)
        ? prev.workingDays.filter(d => d !== day)
        : [...prev.workingDays, day]

      return {
        ...prev,
        workingDays: updatedDays
      }
    })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // function สำหรับ edit
  const handleEditClick = (policy) => {
    setEditingPolicy(policy)
    setFormData({
      name: policy.name || '',
      startTime: policy.startTime || '',
      endTime: policy.endTime || '',
      allowedLateMinutesPerMonth: policy.allowedLateMinutesPerMonth || '',
      deductIfLateOver: policy.deductIfLateOver || '',
      halfDayAbsentRule: policy.halfDayAbsentRule || '',
      minHoursForHalfDay: policy.minHoursForHalfDay || '',
      remark: policy.remark || '',
      workingDays: policy.workingDays || []
    })
    setIsOpen(true)
  }

  // function สำหรับ assign policy
  const handleAssignClick = async (policy) => {
    setSelectedPolicy(policy)
    setIsAssignOpen(true)
    await fetchEmployees()
  }

  // function สำหรับ submit assign
  const handleAssignSubmit = async () => {
    if (!selectedPolicy || selectedEmployees.length === 0) {
      alert("กรุณาเลือก employee อย่างน้อย 1 คน")
      return
    }

    try {
      // Mock การ assign - แค่แสดงผลใน console
      const assignData = {
        policyId: selectedPolicy.id,
        policyName: selectedPolicy.name,
        employeeIds: selectedEmployees,
        employeeNames: employees
          .filter(emp => selectedEmployees.includes(emp.id))
          .map(emp => `${emp.firstName} ${emp.lastName}`)
      }
      
      console.log("Mock Policy Assignment:", assignData)
      console.log(`กำลัง assign policy "${selectedPolicy.name}" ให้กับ:`)
      assignData.employeeNames.forEach(name => console.log(`- ${name}`))
      
      setIsAssignOpen(false)
      setSelectedPolicy(null)
      setSelectedEmployees([])
      
      alert(`มอบหมาย Policy "${selectedPolicy.name}" ให้กับ ${assignData.employeeNames.length} คน สำเร็จ!\n\n${assignData.employeeNames.join('\n')}`)
    } catch (error) {
      console.error("Error assigning policy:", error)
      alert("เกิดข้อผิดพลาด: ไม่สามารถมอบหมาย Policy ได้")
    }
  }

  // function สำหรับจัดการ employee selection
  const handleEmployeeToggle = (employeeId) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    )
  }

  // function สำหรับ reset form เมื่อยกเลิก
  const handleCancel = () => {
    setIsOpen(false)
    setEditingPolicy(null)
    setFormData({
      name: '',
      startTime: '',
      endTime: '',
      allowedLateMinutesPerMonth: '',
      deductIfLateOver: '',
      halfDayAbsentRule: '',
      minHoursForHalfDay: '',
      remark: '',
      workingDays: []
    })
  }

  useEffect(() => {
    fetchPolicies().then(res => console.log(res.data))
  }, [])

  return (
    <div className="p-4 md:px-24">
      <p className="text-4xl font-bold mt-8">Work Policies</p>
      <p className="my-4 font-semibold text-black/50">Manage company policies related to employment, conduct, and operations.</p>

      <div className="flex justify-between items-center">
        <p className="text-xl font-bold my-4">Policies</p>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>Add Policy</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingPolicy ? "Edit Work Policy" : "Add New Work Policy"}
              </DialogTitle>
              <DialogDescription>
                {editingPolicy ? "Update work policy with new configurations." : "Create a new work policy with specific rules and configurations."}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className={'mb-3'} htmlFor="name">Policy Name</Label>
                  <Input
                    id="name"
                    name="name"
                    autoComplete="off"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter policy name"
                    required
                  />
                </div>

                <div>
                  <Label className={'mb-3'} htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    name="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label className={'mb-3'} htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    name="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label className={'mb-3'} htmlFor="allowedLate">Allowed Late (min/month)</Label>
                  <Input
                    id="allowedLate"
                    name="allowedLateMinutesPerMonth"
                    type="number"
                    value={formData.allowedLateMinutesPerMonth}
                    onChange={handleInputChange}
                    placeholder="30"
                  />
                </div>

                <div>
                  <Label className={'mb-3'} htmlFor="deductLate">Deduct Late</Label>
                  <Input
                    id="deductLate"
                    name="deductIfLateOver"
                    type="number"
                    value={formData.deductIfLateOver}
                    onChange={handleInputChange}
                    placeholder="0"
                  />
                </div>

                <div>
                  <Label className={'mb-3'} htmlFor="halfDayRule">Half Day Rule</Label>
                  <select
                    id="halfDayRule"
                    name="halfDayAbsentRule"
                    value={formData.halfDayAbsentRule}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  >
                    <option value="1">None</option>
                    <option value="0.5">0.5</option>
                  </select>
                </div>

                <div>
                  <Label className={'mb-3'} htmlFor="minHoursHalfday">Min Hours Halfday</Label>
                  <Input
                    id="minHoursHalfday"
                    name="minHoursForHalfDay"
                    type="number"
                    value={formData.minHoursForHalfDay}
                    onChange={handleInputChange}
                    placeholder="4"
                  />
                </div>

                <div className="col-span-2">
                  <Label className="mb-3">Working Days</Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                      <div key={day} className="flex items-center space-x-2">
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
              </div>

              <div>
                <Label htmlFor="remark">Remark</Label>
                <Textarea
                  id="remark"
                  name="remark"
                  value={formData.remark}
                  onChange={handleInputChange}
                  placeholder="Additional notes..."
                  rows={3}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingPolicy ? "Update Policy" : "Create Policy"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px] font-bold">Policy Name</TableHead>
              <TableHead className="w-[120px] text-center font-bold">Start Time</TableHead>
              <TableHead className="w-[120px] text-center font-bold">End Time</TableHead>
              <TableHead className="w-[180px] text-center font-bold">
                Allowed Late
                <span className="text-xs text-black/40 hidden md:inline ml-1">
                  minute/month
                </span>
              </TableHead>
              <TableHead className="w-[120px] text-center font-bold">Deduct Late</TableHead>
              <TableHead className="w-[140px] text-center font-bold">Half Day Rule</TableHead>
              <TableHead className="w-[160px] text-center font-bold">Min Hours Halfday</TableHead>
              <TableHead className="w-[120px] text-center font-bold">Remark</TableHead>
              <TableHead className="w-[140px] text-center font-bold">Working Day</TableHead>
              <TableHead className="w-[120px] text-center font-bold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {policies.length > 0 ? (
              policies.map((policy) => (
                <TableRow key={policy.id}>
                  <TableCell className="font-semibold">{policy.name || <Badge variant="outline">ยังไม่มีข้อมูล</Badge>}</TableCell>
                  <TableCell className="text-center font-semibold text-black/70">{policy.startTime || <Badge className={'font-semibold text-black/70'} variant="outline">ยังไม่มีข้อมูล</Badge>}</TableCell>
                  <TableCell className="text-center font-semibold text-black/70">{policy.endTime || <Badge className={'font-semibold text-black/70'} variant="outline">ยังไม่มีข้อมูล</Badge>}</TableCell>
                  <TableCell className="text-center font-semibold text-black/70">{policy.allowedLateMinutesPerMonth || <Badge className={'font-semibold text-black/70'} variant="outline">ยังไม่มีข้อมูล</Badge>}</TableCell>
                  <TableCell className="text-center font-semibold text-black/70">{policy.deductIfLateOver || <Badge className={'font-semibold text-black/70'} variant="outline">ยังไม่มีข้อมูล</Badge>}</TableCell>
                  <TableCell className="text-center font-semibold text-black/70">{policy.halfDayAbsentRule || <Badge className={'font-semibold text-black/70'} variant="outline">ยังไม่มีข้อมูล</Badge>}</TableCell>
                  <TableCell className="text-center font-semibold text-black/70">{policy.minHoursForHalfDay || <Badge className={'font-semibold text-black/70'} variant="outline">ยังไม่มีข้อมูล</Badge>}</TableCell>
                  <TableCell className="text-center font-semibold text-black/70">{policy.remark || <Badge className={'font-semibold text-black/70'} variant="outline">ยังไม่มีข้อมูล</Badge>}</TableCell>
                  <TableCell className="text-center font-semibold text-black/70">{policy.workingDays?.join(', ') || <Badge className={'font-semibold text-black/70'} variant="outline">ยังไม่มีข้อมูล</Badge>}</TableCell>
                  <TableCell className="text-center space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEditClick(policy)}>
                      <Pencil className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleAssignClick(policy)} className="text-blue-500 hover:text-blue-600">
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-4 font-bold text-black/50">
                  No policies found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog สำหรับ Assign Policy */}
      <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Assign Policy to Employees</DialogTitle>
            <DialogDescription>
              เลือก employees ที่ต้องการให้ใช้ policy "{selectedPolicy?.name}"
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Search/Filter Section */}
            <div className="flex items-center gap-4">
              <Input
                placeholder="ค้นหา employee..."
                value={searchEmployee}
                onChange={(e) => setSearchEmployee(e.target.value)}
                className="flex-1"
              />
              <Button variant="outline" size="sm" onClick={() => {
                setSelectedEmployees(employees.map(emp => emp.id))
              }}>
                เลือกทั้งหมด
              </Button>
              <Button variant="outline" size="sm" onClick={() => {
                setSelectedEmployees([])
              }}>
                ยกเลิกทั้งหมด
              </Button>
            </div>

            {/* Employee List */}
            <div className="border rounded-lg max-h-96 overflow-y-auto">
              {employees.length > 0 ? (
                <div className="p-4 space-y-2">
                  {employees
                    .filter(employee => 
                      employee.firstName?.toLowerCase().includes(searchEmployee.toLowerCase()) ||
                      employee.lastName?.toLowerCase().includes(searchEmployee.toLowerCase()) ||
                      employee.email?.toLowerCase().includes(searchEmployee.toLowerCase())
                    )
                    .map((employee) => (
                    <div key={employee.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                      <input
                        type="checkbox"
                        id={`employee-${employee.id}`}
                        checked={selectedEmployees.includes(employee.id)}
                        onChange={() => handleEmployeeToggle(employee.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-700">
                              {employee.firstName?.charAt(0)}{employee.lastName?.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <Label htmlFor={`employee-${employee.id}`} className="font-medium cursor-pointer">
                              {employee.firstName} {employee.lastName}
                            </Label>
                            <p className="text-sm text-gray-500">
                              {employee.email} • {employee.department || 'No Department'}
                            </p>
                          </div>
                        </div>
                      </div>
                      {employee.currentPolicy && (
                        <Badge variant="outline" className="text-xs">
                          Current: {employee.currentPolicy}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  ไม่พบข้อมูล employees
                </div>
              )}
            </div>

            {/* Selected Count */}
            <div className="text-sm text-gray-600">
              เลือกแล้ว: {selectedEmployees.length} คน
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => {
              setIsAssignOpen(false)
              setSelectedPolicy(null)
              setSelectedEmployees([])
              setSearchEmployee('')
            }}>
              Cancel
            </Button>
            <Button type="button" onClick={handleAssignSubmit} disabled={selectedEmployees.length === 0}>
              Assign Policy ({selectedEmployees.length} คน)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default WorkPolicyManagementPage;