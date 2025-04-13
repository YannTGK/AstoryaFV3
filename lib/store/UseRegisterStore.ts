import { create } from "zustand";

type RegisterState = {
  firstName: string;
  lastName: string;
  username: string;  // Nieuw toegevoegd
  email: string;
  phoneNumber: string;
  dob: string;
  setUserInfo: (info: Partial<RegisterState>) => void;
  reset: () => void;
};

const useRegisterStore = create<RegisterState>((set) => ({
  firstName: "",
  lastName: "",
  username: "",        // Initieel lege username
  email: "",
  phoneNumber: "",
  dob: "",
  setUserInfo: (info) => set(info),
  reset: () =>
    set({
      firstName: "",
      lastName: "",
      username: "",    // Ook resetten username naar lege string
      email: "",
      phoneNumber: "",
      dob: "",
    }),
}));

export default useRegisterStore;