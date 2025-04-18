import { create } from "zustand";

type FlowState = {
  hasCompletedPrivate: boolean;
  hasCompletedPublic: boolean;
  privateFlowData?: { name: string; emissive: string };
  publicFlowData?: { name: string; emissive: string };
  toggleStatus: "private" | "public";
  setToggleStatus: (status: "private" | "public") => void;
  setCompletedPrivate: (data: { name: string; emissive: string }) => void;
  setCompletedPublic: (data: { name: string; emissive: string }) => void;
};

const useFlowStore = create<FlowState>((set) => ({
  hasCompletedPrivate: false,
  hasCompletedPublic: false,
  privateFlowData: undefined,
  publicFlowData: undefined,
  toggleStatus: "private", // standaard: private

  setToggleStatus: (status) => set({ toggleStatus: status }),

  setCompletedPrivate: (data) =>
    set((state) => ({
      hasCompletedPrivate: true,
      privateFlowData: data,
      toggleStatus: "private", // bij voltooien, zet actief
    })),

  setCompletedPublic: (data) =>
    set((state) => ({
      hasCompletedPublic: true,
      publicFlowData: data,
      toggleStatus: "public", // bij voltooien, zet actief
    })),
}));

export default useFlowStore;
