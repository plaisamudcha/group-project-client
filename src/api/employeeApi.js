import { privateApi } from "./baseApi";

const employeeApi = {
  getProfile: (userId) => {
    return privateApi.get(`/profiles/${userId}`);
  },
}

export default employeeApi;