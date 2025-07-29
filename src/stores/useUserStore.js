import { create } from "zustand";
import { persist } from "zustand/middleware";
import authToApi from "../api/publicApi";

const useUserStore = create(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      resetToken: null,
      setAccessToken: (token) => {
        set({ accessToken: token });
      },
      login: async (data) => {
        const res = await authToApi.login(data);
        set({ user: res.data.user, accessToken: res.data.accessToken });
        return res;
      },
      forgotPassword: async (data) => {
        const res = await authToApi.forgotPassword(data);
        return res;
      },
      resetPassword: async (token, data) => {
        const res = await authToApi.resetPassword(token, data);
        return res;
      },
      logout: () => {
        set({ user: null, accessToken: null, resetToken: null });
        localStorage.removeItem("token");
      },
    }),
    {
      name: "user-storage", // unique name for the storage
      getStorage: () => localStorage, // use localStorage as the storage
    }
  )
);

export default useUserStore;
