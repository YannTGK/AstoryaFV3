// lib/store/useMessageStore.ts
import { create } from "zustand";

interface Message {
  id: number;
  to: string;
  from: string;
  message: string;
  menuOpen: boolean;
}

interface MessageStore {
  messages: Message[];
  addMessage: (msg: Omit<Message, "menuOpen">) => void;
  toggleMenu: (id: number) => void;
  closeAllMenus: () => void;
  selectedMessage: Message | null;
  openMessage: (msg: Message) => void;
  closeMessage: () => void;
}

export const useMessageStore = create<MessageStore>((set, get) => ({
  messages: [],
  selectedMessage: null,
  addMessage: (msg) => {
    const exists = get().messages.some(
      (m) => m.to === msg.to && m.message === msg.message
    );
    if (exists) return;

    set((state) => ({
      messages: [...state.messages, { ...msg, menuOpen: false }],
    }));
  },
  toggleMenu: (id) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id ? { ...msg, menuOpen: !msg.menuOpen } : { ...msg, menuOpen: false }
      ),
    })),
  closeAllMenus: () =>
    set((state) => ({
      messages: state.messages.map((msg) => ({ ...msg, menuOpen: false })),
    })),
  openMessage: (msg) => set({ selectedMessage: msg }),
  closeMessage: () => set({ selectedMessage: null }),
}));
