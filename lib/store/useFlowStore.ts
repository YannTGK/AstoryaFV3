import { create } from "zustand";

type FlowState = {
  toggleStatus: "private" | "public";
  setToggleStatus: (status: "private" | "public") => void;
};

const useFlowStore = create<FlowState>((set) => ({
  toggleStatus: "private",
  setToggleStatus: (status) => set({ toggleStatus: status }),
}));

export default useFlowStore;
