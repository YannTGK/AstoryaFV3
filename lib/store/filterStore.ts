import { create } from "zustand";

type FilterState = {
  dob: string;
  dod: string;
  country: string;
  coordX: string;
  coordY: string;
  coordZ: string;
  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;
};

export const useFilterStore = create<FilterState>((set) => ({
  dob: "",
  dod: "",
  country: "",
  coordX: "",
  coordY: "",
  coordZ: "",
  setFilters: (filters) => set((state) => ({ ...state, ...filters })),
  resetFilters: () =>
    set({
      dob: "",
      dod: "",
      country: "",
      coordX: "",
      coordY: "",
      coordZ: "",
    }),
}));