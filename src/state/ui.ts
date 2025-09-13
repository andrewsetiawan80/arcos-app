import { create } from "zustand";

type UI = {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;

  commandOpen: boolean;
  setCommandOpen: (v: boolean) => void;
};

export const useUI = create<UI>((set) => ({
  sidebarCollapsed: false,
  setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),

  commandOpen: false,
  setCommandOpen: (v) => set({ commandOpen: v }),
}));
