import { create } from "zustand";

interface SidebarOpenStore {
  sidebarOpen: "participants" | "chat" | null;
  setSidebarOpen: (open: "participants" | "chat" | null) => void;
}

const useSidebarOpenStore = create<SidebarOpenStore>()((set) => ({
  sidebarOpen: null,
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
}));

export default useSidebarOpenStore;
