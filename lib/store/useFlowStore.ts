import { create } from "zustand";

type FlowState = {
  hasCompletedPrivate: boolean;
  hasCompletedPublic: boolean;
  privateFlowData?: { name: string; emissive: string };
  publicFlowData?: { name: string; emissive: string };
  setCompletedPrivate: (data: { name: string; emissive: string }) => void;
  setCompletedPublic: (data: { name: string; emissive: string }) => void;
};

const useFlowStore = create<FlowState>((set) => ({
  hasCompletedPrivate: false,
  hasCompletedPublic: false,
  privateFlowData: undefined,
  publicFlowData: undefined,
  setCompletedPrivate: (data) =>
    set({
      hasCompletedPrivate: true,
      privateFlowData: data,
    }),
  setCompletedPublic: (data) =>
    set({
      hasCompletedPublic: true,
      publicFlowData: data,
    }),
}));

export default useFlowStore;
