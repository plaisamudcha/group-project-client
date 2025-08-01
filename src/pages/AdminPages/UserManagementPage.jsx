import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
  TableBody,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const mockUsers = Array.from({ length: 12 }).map((_, i) => ({
  id: i + 1,
  name: `พนักงาน ${i + 1}`,
  email: `user${i + 1}@company.com`,
  role: i === 0 ? "HR" : "EMPLOYEE",
  employeeProfile: {
    employmentType: i % 2 === 0 ? "FULLTIME" : "PARTTIME",
  },
}));

const ITEMS_PER_PAGE = 5;

export default function UserManagementPage() {
  const [users, setUsers] = useState(mockUsers);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "EMPLOYEE",
    employmentType: "FULLTIME",
  });

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const currentData = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleRegister = () => {
    const newUser = {
      id: users.length + 1,
      ...formData,
      employeeProfile: {
        employmentType: formData.employmentType,
      },
    };
    setUsers([newUser, ...users]);
    resetForm();
    setIsRegisterOpen(false);
  };

  const handleEdit = () => {
    if (!editUser) return;
    const updatedUsers = users.map((u) =>
      u.id === editUser.id
        ? {
            ...u,
            ...formData,
            employeeProfile: {
              employmentType: formData.employmentType,
            },
          }
        : u
    );
    setUsers(updatedUsers);
    resetForm();
    setIsEditOpen(false);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "EMPLOYEE",
      employmentType: "FULLTIME",
    });
    setEditUser(null);
  };

  const openEditModal = (user) => {
    setEditUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      employmentType: user.employeeProfile?.employmentType || "FULLTIME",
    });
    setIsEditOpen(true);
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6 space-y-6">
      <Card>
        <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-4">
          <CardTitle>จัดการพนักงาน</CardTitle>
          <div className="flex gap-2 w-full md:w-auto">
            <Input
              placeholder="ค้นหาชื่อหรืออีเมล..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full md:w-64"
            />
            <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
              <DialogTrigger asChild>
                <Button>เพิ่มพนักงาน</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>ลงทะเบียนพนักงานใหม่</DialogTitle>
                </DialogHeader>
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleRegister();
                  }}
                >
                  <Input
                    placeholder="ชื่อ"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                  <Input
                    placeholder="อีเมล"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                  <Input
                    placeholder="รหัสผ่าน"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                  <select
                    className="w-full border rounded p-2"
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                  >
                    <option value="EMPLOYEE">EMPLOYEE</option>
                    <option value="HR">HR</option>
                  </select>
                  <select
                    className="w-full border rounded p-2"
                    value={formData.employmentType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        employmentType: e.target.value,
                      })
                    }
                  >
                    <option value="FULLTIME">FULLTIME</option>
                    <option value="PARTTIME">PARTTIME</option>
                  </select>
                  <Button type="submit" className="w-full">
                    ยืนยัน
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ชื่อ</TableHead>
                <TableHead>อีเมล</TableHead>
                <TableHead>บทบาท</TableHead>
                <TableHead>ประเภทการจ้าง</TableHead>
                <TableHead className="text-right">การจัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentData.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user.employeeProfile?.employmentType}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(user)}
                    >
                      แก้ไข
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex justify-end mt-4 gap-2">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            >
              ก่อนหน้า
            </Button>
            <span className="self-center">
              หน้า {currentPage} จาก {totalPages}
            </span>
            <Button
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
            >
              ถัดไป
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>แก้ไขข้อมูลพนักงาน</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              handleEdit();
            }}
          >
            <Input
              placeholder="ชื่อ"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
            <Input
              placeholder="อีเมล"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
            <select
              className="w-full border rounded p-2"
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
            >
              <option value="EMPLOYEE">EMPLOYEE</option>
              <option value="HR">HR</option>
            </select>
            <select
              className="w-full border rounded p-2"
              value={formData.employmentType}
              onChange={(e) =>
                setFormData({ ...formData, employmentType: e.target.value })
              }
            >
              <option value="FULLTIME">FULLTIME</option>
              <option value="PARTTIME">PARTTIME</option>
            </select>
            <Button type="submit" className="w-full">
              บันทึกการเปลี่ยนแปลง
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
