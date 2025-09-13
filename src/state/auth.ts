import { create } from "zustand";

export type Role = "admin" | "engineer" | "production" | "sales";

type Store = {
  role: Role;
  setRole: (r: Role) => void;
};

export const useAuth = create<Store>((set) => ({
  role: "admin", // change at runtime via a settings UI / devtools
  setRole: (role) => set({ role }),
}));
