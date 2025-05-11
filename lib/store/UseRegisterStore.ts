// lib/store/UseRegisterStore.ts
import { create } from "zustand";

type RegisterState = {
  firstName:   string;
  lastName:    string;
  username:    string;
  email:       string;
  phoneNumber: string;
  dob:         string;
  country:     string;            // ✅ nieuw veld

  /* actions */
  setUserInfo: (info: Partial<RegisterState>) => void;
  reset: () => void;
};

const useRegisterStore = create<RegisterState>((set) => ({
  /* ---------- defaults ---------- */
  firstName:   "",
  lastName:    "",
  username:    "",
  email:       "",
  phoneNumber: "",
  dob:         "",
  country:     "",          // ✅ default land

  /* ---------- actions ----------- */
  /** vul losse velden aan zonder de rest te overschrijven */
  setUserInfo: (info) =>
    set((state) => ({
      ...state,
      ...info,
    })),

  /** reset alles terug naar defaults */
  reset: () =>
    set({
      firstName:   "",
      lastName:    "",
      username:    "",
      email:       "",
      phoneNumber: "",
      dob:         "",
      country:     "",
    }),
}));

export default useRegisterStore;