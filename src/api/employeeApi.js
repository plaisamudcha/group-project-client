import axios from "axios";
import useUserStore from "../stores/useUserStore";

const employeeApi = axios.create({
  baseURL: `http://localhost:3000/api/profiles`, 
});


employeeApi.interceptors.request.use(
  (config) => {
    const token = useUserStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default employeeApi;