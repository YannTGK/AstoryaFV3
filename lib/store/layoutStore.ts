// lib/store/layoutStore.ts
import { create } from "zustand";

type S = {
  isSearching: boolean;
  showOnlyMine: boolean;       // ENIGE toggle
  setIsSearching: (v:boolean)=>void;
  setShowOnlyMine:(v:boolean)=>void;
};

export const useLayoutStore = create<S>()((set)=>({
  isSearching:false,
  showOnlyMine:false,
  setIsSearching:(v)=>set({isSearching:v}),
  setShowOnlyMine:(v)=>set({showOnlyMine:v}),
}));