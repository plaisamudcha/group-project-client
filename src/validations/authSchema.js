import { object, string, ref } from "yup";

const authSchema = {
  registerSchema: object({
    name: string().required("กรุณาใส่ชื่อ"),
    email: string().email("อีเมลไม่ถูกต้อง").required("กรุณาใส่อีเมล"),
    password: string()
      .min(6, "กรุณาใส่รหัสผ่านอย่างน้อย 6 ตัว")
      .required("กรุณาใส่รหัสผ่าน"),
    workPolicyId: string().required("กรุณาใส่ WorkPolicy"),
  }),
  loginSchema: object({
    email: string().email("อีเมลไม่ถูกต้อง").required("กรุณาใส่อีเมล"),
    password: string().required("กรุณาใส่รหัสผ่าน"),
  }),
  forgotPassword: object({
    email: string().email("อีเมลไม่ถูกต้อง").required("กรุณาใส่อีเมล"),
  }),
  resetPassword: object({
    password: string()
      .min(6, "กรุณาใส่รหัสผ่านอย่างน้อย 6 ตัว")
      .required("กรุณาใส่รหัสผ่าน"),
    confirmPassword: string()
      .oneOf([ref("password")], "กรุณายืนยันรหัสผ่าน")
      .required("กรุณายืนยันรหัสผ่าน"),
  }),
};

export default authSchema;
