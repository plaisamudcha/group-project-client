import {  object,  string } from "yup";
import dayjs from "dayjs";

// ตรวจสอบรูปแบบวันที่ และตรวจจับเงื่อนไขไม่ให้สร้างหรือแก้ไขวันหยุดที่เป็นของปีที่แล้ว

const isValidDate = (value, format = "YYYY-MM-DD") => {
  return dayjs(value, format, true).isValid();
};

const isThisYearOrAfter = (value) => {
  return dayjs(value).year() >= dayjs().year()
}


const holidaySchema = {
  createOrUpdateHoliday: object({
    date: string()
      .required("กรุณาใส่วันหยุด")
      .nullable()
      .test("valid-format", "รูปแบบวันหยุดไม่ถูกต้อง", (value) =>
        value ? isValidDate(value) : null
      ).test("isYearAgo", "กรุณาตรวจสอบปี (ต้องเป็นปีปัจุบันหรือปีหน้า)", (value) =>
        value ? isThisYearOrAfter(value) : null
      ),
    name: string().required("กรุณาใส่ชื่อวันหยุด"),
  }),
};

export default holidaySchema;
