# 📄 Frontend Page Structure - HR Management System

ระบบนี้ถูกแบ่งออกเป็น 3 กลุ่มหลักตามบทบาทของผู้ใช้งาน:

---

## 🟢 1. Public Pages

> ผู้ใช้ทุกคนสามารถเข้าถึงได้โดยไม่ต้อง Login

| Page            | Path                     | Description                      |
| --------------- | ------------------------ | -------------------------------- |
| Homepage        | `/`                      | หน้าแรกของระบบ แสดงข้อมูลทั่วไป  |
| Login           | `/login`                 | หน้าล็อกอินเข้าสู่ระบบ           |
| Forgot Password | `/forgot-password`       | หน้ารีเควสรหัสผ่านใหม่ผ่าน email |
| Reset Password  | `/reset-password/:token` | ตั้งรหัสผ่านใหม่จาก token        |

---

## 🔵 2. HR Pages

> เฉพาะผู้ใช้งานที่มี Role = `HR` เท่านั้น

| Page                   | Path                     | Description                              |
| ---------------------- | ------------------------ | ---------------------------------------- |
| HR Dashboard           | `/hr/dashboard`          | ภาพรวมระบบ แสดงสถิติเข้างาน/ลางาน        |
| User Management        | `/hr/users`              | จัดการข้อมูลพนักงานทั้งหมด               |
| Attendance Records     | `/hr/attendances`        | ตรวจสอบ/อัปเดตข้อมูลเข้างานของพนักงาน    |
| Leave Requests         | `/hr/leave-requests`     | ตรวจสอบใบลาทั้งหมด พร้อมอนุมัติ/ปฏิเสธ   |
| Leave Entitlements     | `/hr/leave-entitlements` | กำหนดสิทธิ์วันลาประจำปีให้พนักงานแต่ละคน |
| Work Policy Management | `/hr/work-policies`      | จัดการกฎเวลาเข้า-ออกงาน                  |
| Shift Management       | `/hr/shifts`             | จัดการกะทำงาน                            |
| Holiday Management     | `/hr/holidays`           | เพิ่ม/ลบ วันหยุดบริษัท                   |
| Audit Log              | `/hr/audit-logs`         | บันทึกการกระทำที่เกิดขึ้นในระบบ          |

---

## 🟠 3. Employee Pages

> เฉพาะผู้ใช้งานที่มี Role = `EMPLOYEE` เท่านั้น

| Page               | Path                       | Description                             |
| ------------------ | -------------------------- | --------------------------------------- |
| Employee Dashboard | `/employee/dashboard`      | ภาพรวมของตัวเอง เช่น ข้อมูลลา/เวลาทำงาน |
| My Profile         | `/employee/profile`        | ข้อมูลส่วนตัวและกฎการทำงานของตนเอง      |
| My Attendance      | `/employee/attendances`    | ดูประวัติการเข้างาน รายงานการมาทำงาน    |
| Request Leave      | `/employee/request-leave`  | ฟอร์มยื่นคำขอลา                         |
| My Leave Requests  | `/employee/leave-requests` | ตรวจสอบสถานะใบลาที่เคยยื่น              |
| Leave Entitlement  | `/employee/entitlement`    | สิทธิ์วันลาประจำปีที่เหลือ              |
| Company Holidays   | `/employee/holidays`       | ดูปฏิทินวันหยุดของบริษัท                |

---

## 🔒 Access Control Strategy

- **Public Page**: ไม่ต้อง Login
- **HR Page**: ตรวจสอบว่า `user.role === 'HR'`
- **Employee Page**: ตรวจสอบว่า `user.role === 'EMPLOYEE'`

---

> ✨ หมายเหตุ: สามารถขยายเพิ่มเติม เช่น `Admin`, `Manager`, หรือแยก Mobile View ได้ในอนาคต
