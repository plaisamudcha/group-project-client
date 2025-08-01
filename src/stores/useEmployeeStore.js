import { create } from "zustand";
import { persist } from "zustand/middleware";
import employeeApi from "../api/employeeApi";

const useEmployeeStore = create(
  persist(
    (set) => ({
      profile: null,
      loading: false,
      error: null,
      // -- ดึง profile
      fetchProfile: async (userId) => {
        set({ loading: true, error: null });
        try {
          const res = await employeeApi.getProfile(userId);
          set({ profile: res.data, loading: false });
        } catch (err) {
          set({ error: err.message || "เกิดข้อผิดพลาด", loading: false });
        }
      },
      // -- แก้ไข profile
      updateProfile: async (userId, data) => {
        set({ loading: true, error: null });
        try {
          const res = await employeeApi.updateProfile(userId, data);
          set({ profile: res.data, loading: false });
        } catch (err) {
          set({ error: err.message || "เกิดข้อผิดพลาด", loading: false });
        }
      },
      // -- reset
      resetProfile: () => set({ profile: null, loading: false, error: null }),
    }),
    {
      name: "employee-profile-storage",
      getStorage: () => localStorage,
    }
  )
);

export default useEmployeeStore;
