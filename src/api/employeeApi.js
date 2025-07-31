import { privateApi } from "./baseApi";

const employeeApi = {
  postLeaveRequest: (leaveData) => privateApi.post('/leaves', leaveData),
  getLeaveRequests: () => privateApi.get('/leaves/user'),
  getLeaveEntitlements: () => privateApi.get('/aunnual-leave/user'),
  getHolidays: () => privateApi.get('/holidays'),
  getMyProfile: (userId) => privateApi.get(`/profiles/${userId}`),
};

export default employeeApi;