import { privateApi } from "./baseApi";

const employeeApi = {
  getProfile: (userId) => {
    return privateApi.get(`/profiles/${userId}`);
  },

  postLeaveRequest: (leaveData) => privateApi.post('/leaves', leaveData),
  getLeaveRequests: () => privateApi.get('/leaves/user'),
  getLeaveEntitlements: () => privateApi.get('/aunnual-leave/user'),
  getHolidays: () => privateApi.get('/holidays'),
};

export default employeeApi;