// lib/store/useMessageStore.ts
import { create } from "zustand";

interface Message {
  id: number;
  to: string;
  menuOpen: boolean;
}

interface MessageStore {
  messages: Message[];
  addMessage: (to: string) => void;
  toggleMenu: (id: number) => void;
  closeAllMenus: () => void;
}

export const useMessageStore = create<MessageStore>((set) => ({
  messages: [],
  addMessage: (to) =>
    set((state) => ({
      messages: [
        ...state.messages,
        { id: Date.now(), to, menuOpen: false },
      ],
    })),
  toggleMenu: (id) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id
          ? { ...msg, menuOpen: !msg.menuOpen }
          : { ...msg, menuOpen: false }
      ),
    })),
  closeAllMenus: () =>
    set((state) => ({
      messages: state.messages.map((msg) => ({ ...msg, menuOpen: false })),
    })),
}));