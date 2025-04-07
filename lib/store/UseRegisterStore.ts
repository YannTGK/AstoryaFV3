import { create } from "zustand";

type RegisterState = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dob: string;
  setUserInfo: (info: Partial<RegisterState>) => void;
  reset: () => void;
};

const useRegisterStore = create<RegisterState>((set) => ({
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  dob: "",
  setUserInfo: (info) => set(info),
  reset: () => set({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    dob: ""
  })
}));

export default useRegisterStore;