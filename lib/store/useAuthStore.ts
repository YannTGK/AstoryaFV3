import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/services/api";

type User = {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phoneNumber: string;
  dob: string;
  dod?: string | null;
  country: string;
  plan: "EXPLORER" | "PREMIUM" | "LEGACY";
  activationCode?: string; // ✅ deze lijn is belangrijk
};

type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  logout: () => void;
  loadToken: () => Promise<void>;
};

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: true }),
  setToken: (token) => {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    AsyncStorage.setItem("authToken", token);
    set({ token });
  },

  logout: async () => {
    await AsyncStorage.removeItem("authToken");
    set({ user: null, token: null, isAuthenticated: false });
  },

  // useAuthStore.ts
  loadToken: async () => {
    const token = await AsyncStorage.getItem("authToken");

    if (!token) return;
    api.defaults.headers.common.Authorization = `Bearer ${token}`;

    try {
      const res = await api.get("/auth/me");
      set({ token, user: res.data.user, isAuthenticated: true });
    } catch (e: any) {
      console.log("❌ /auth/me fout:", e?.response?.status, e?.message); // <—
      await AsyncStorage.removeItem("authToken");
      set({ user: null, token: null, isAuthenticated: false });
    }
  }
}));

export default useAuthStore;