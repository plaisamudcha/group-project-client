import { publicApi } from "./baseApi";

const authToApi = {
  register: (data) => {
    return publicApi.post("/auth/register", data);
  },
  login: (data) => {
    return publicApi.post("/auth/login", data);
  },
  forgotPassword: (data) => {
    return publicApi.post("/auth/forgot-password", data);
  },
  resetPassword: (token, data) => {
    return publicApi.post(`/auth/reset-password/${token}`, data);
  },
};

export default authToApi;
