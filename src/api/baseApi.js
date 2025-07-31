import axios from "axios";
import useUserStore from "../stores/useUserStore";

const baseConfig = {
  baseURL: "http://localhost:3000/api",
  timeout: 10000,
  withCredentials: true,
};

const publicApi = axios.create(baseConfig);

const privateApi = axios.create(baseConfig);

privateApi.interceptors.request.use(
  (config) => {
    const token = useUserStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

privateApi.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error?.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const response = await publicApi.post("/auth/refresh-token");
        const newToken = response?.data?.newAccessToken;
        console.log("Refreshing token:", newToken);
        if (!newToken) {
          return Promise.reject(error);
        }
        useUserStore.getState().setAccessToken(newToken);
        error.config.headers["Authorization"] = `Bearer ${newToken}`;
        // Update headers for the original request
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        // Update the privateApi instance headers
        privateApi.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${newToken}`;
        return privateApi(originalRequest);
      } catch (refreshError) {
        useUserStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export { publicApi, privateApi };
