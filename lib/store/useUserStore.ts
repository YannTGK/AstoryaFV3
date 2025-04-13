import { create } from "zustand";

type User = {
  _id: string;
  username: string;  // Nieuw toegevoegd
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  dob?: string;
};

type UserStore = {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
};

const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));

export default useUserStore;