// lib/store/filterStore.ts
import { create } from "zustand";

type FilterState = {
  dob: string;
  dod: string;
  country: string;
  coordX: string;
  coordY: string;
  coordZ: string;
  searchQuery: string;
  selectedStarId: string | null;         // ← nieuw
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
  searchQuery: "",
  selectedStarId: null,                  // ← initieel null

  setFilters: (filters) => set((state) => ({ ...state, ...filters })),

  resetFilters: () =>
    set({
      dob: "",
      dod: "",
      country: "",
      coordX: "",
      coordY: "",
      coordZ: "",
      searchQuery: "",
      selectedStarId: null,               // ← reset hier ook
    }),
}));