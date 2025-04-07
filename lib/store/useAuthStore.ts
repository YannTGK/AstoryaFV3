import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/services/api";

type User = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dob: string;
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

  loadToken: async () => {
    const token = await AsyncStorage.getItem("authToken");
    if (!token) return;

    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    try {
      const res = await api.get("/auth/me");
      set({ token, user: res.data.user, isAuthenticated: true });
    } catch (e) {
      await AsyncStorage.removeItem("authToken");
      set({ user: null, token: null, isAuthenticated: false });
    }
  },
}));

export default useAuthStore;