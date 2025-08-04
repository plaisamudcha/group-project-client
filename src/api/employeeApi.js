import { privateApi } from "./baseApi";

const employeeApi = {
  getAttendance: (userId, month, year) => {
    return privateApi.get(`/attendance`, {
      params: { userId, month, year },
    });
  },
  fetchAllholiday: () => {
    return privateApi.get("/holidays");
  },
  clockIn: () => {
    return privateApi.post(`/attendance/clock-in`);
  },
  clockOut: () => {
    return privateApi.post(`/attendance/clock-out`);
  },
  postLeaveRequest: (leaveData) => privateApi.post("/leaves", leaveData),
  getLeaveRequests: () => privateApi.get("/leaves/user"),
  getLeaveEntitlements: () => privateApi.get("/aunnual-leave/user"),
  getHolidays: () => privateApi.get("/holidays"),
  getMyProfile: (userId) => privateApi.get(`/profiles/${userId}`),
};

export default employeeApi;
