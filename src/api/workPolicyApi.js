import { privateApi } from "./baseApi";

const workPolicyToApi = {
  fetchPolicies: async () => {
    return await privateApi.get("/work-policies");
  },
  postPolicy: async (data) => {
    return await privateApi.post("/work-policies", data);
  },
  updatePolicy: async (id, data) => {
    return await privateApi.put(`/work-policies/${id}`, data);
  },
};

export default workPolicyToApi;
