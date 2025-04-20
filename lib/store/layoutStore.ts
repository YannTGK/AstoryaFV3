import { create } from "zustand";

type LayoutState = {
  isSearching: boolean;
  setIsSearching: (value: boolean) => void;
};

export const useLayoutStore = create<LayoutState>((set) => ({
  isSearching: false,
  setIsSearching: (value) => set({ isSearching: value }),
}));
