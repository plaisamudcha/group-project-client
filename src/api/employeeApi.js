import { privateApi } from "./baseApi";

const employeeApi = {
  postLeaveRequest: (leaveData) => privateApi.post('/leaves', leaveData),
  getLeaveRequests: () => privateApi.get('/leaves/user'),
  getLeaveEntitlements: () => privateApi.get('/aunnual-leave'),
  getHolidays: () => privateApi.get('/holidays'),
};

export default employeeApi;