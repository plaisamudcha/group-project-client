import { privateApi } from "./baseApi";

const workPolicyToApi = {
  fetchPolicies: () => {
    return privateApi.get("/work-policies");
  },
  postPolicy: (data) => {
    return privateApi.post("/work-policies", data);
  },
  updatePolicy: (id, data) => {
    return privateApi.put(`/work-policies/${id}`, data);
  },
};

export default workPolicyToApi;
