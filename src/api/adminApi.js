import { privateApi } from "./baseApi";

const admintoApi = {
  // Holiday APIs
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
  },

  // Work Policy APIs
  fetchPolicies: async () => {
    return await privateApi.get("/work-policies");
  },
  createPolicy: async (data) => {
    return await privateApi.post("/work-policies", data);
  },
  updatePolicy: async (id, data) => {
    return await privateApi.put(`/work-policies/${id}`, data);
  },

  // User APIs
  getAllUser: () => {
    return privateApi.get('/users')
  },

  // Annual Leave APIs
  createEntitlements: (payload) => {
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
  },

  // Audit Log APIs
  fetchAuditLogs: () => {
    return privateApi.get('/audit-logs');
  }
};

export default admintoApi;