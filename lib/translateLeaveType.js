export function translateLeaveType(type) {
  const translations = {
    SICK: { en: "Sick Leave", th: "ลาป่วย" },
    PERSONAL: { en: "Personal Leave", th: "ลากิจ" },
    VACATION: { en: "Vacation Leave", th: "ลาพักร้อน" },
    MATERNITY: { en: "Maternity Leave", th: "ลาคลอด" },
    MARRIAGE: { en: "Marriage Leave", th: "ลาแต่งงาน" },
    COMPENSATION: { en: "Compensation Leave", th: "ลาทดแทน" },
    WFH: { en: "Work From Home", th: "ทำงานที่บ้าน" },
  };

  return translations[type] || { en: type, th: type };
}
