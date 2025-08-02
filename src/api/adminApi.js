import { privateApi } from "./baseApi";
const admintoApi = {
  fetchAllholiday: () => {
    return privateApi.get("/holidays")
  },
  deleteHoliday: (id) => {
    return privateApi.delete(`/holidays/${id}`)
  },
  ceateHoliday: (body) => {
    return privateApi.post("/holidays", body)
  },
  updateHoliday: (id, body) => {
    return privateApi.put(`/holidays/${id}`, body);
  }, getAllUser: () => {
    return privateApi.get('/users')
  }, createEntitlements: (payload) => {
    return privateApi.post('/aunnual-leave/create', payload);
  },
  updateEntitlements: (payload) => {
    return privateApi.post('/aunnual-leave/create', payload);
  },
  createBulkEntitlements: (payload) => {
    return privateApi.post('/aunnual-leave/createbulk', payload);
  },
  deleteUserEntitlements: (userId, year) => {
    return privateApi.delete(`/aunnual-leave/user/${userId}/year/${year}`);
  }, getAllLeaveRequst: () => {
    return privateApi.get("/leaves")
  }, updateLeaveStatus: (id, status) => {
    return privateApi.put(`/leaves/${id}/status`, status)
  }, getAllShifts: () => {
    return privateApi.get("/shifts");
  },
  createShift: (body) => {
     console.log(body)
    return privateApi.post("/shifts", body);
  },
  updateShift: (id, body) => {
    return privateApi.put(`/shifts/${id}`, body);
  },
  assignEmployeeToShift: (body) => {
    return privateApi.post("/shifts/assign-employee", body);
  },
  removeEmployeeFromShift: (body) => {
    return privateApi.post("/shifts/remove-employee", body);
  },
};

export default admintoApi;
