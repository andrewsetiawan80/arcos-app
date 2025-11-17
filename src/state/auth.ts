import { create } from "zustand";
import { api } from "../lib/api";

export type Role = "admin" | "engineer" | "production" | "sales" | "guest";

type AuthStore = {
  role: Role;
  isAuthenticated: boolean;
  user: { id: number; email: string; role: string } | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  loadAuth: () => Promise<void>;
  setRole: (r: Role) => void;
};

export const useAuth = create<AuthStore>((set, get) => ({
  role: "guest",
  isAuthenticated: false,
  user: null,

  loadAuth: async () => {
    try {
      const result = await api.getCurrentUser();
      if (result.data?.user) {
        set({
          user: result.data.user,
          role: result.data.user.role as Role || "guest",
          isAuthenticated: true,
        });
      } else {
        set({ role: "guest", isAuthenticated: false, user: null });
      }
    } catch (error) {
      console.error("Failed to load auth:", error);
      set({ role: "guest", isAuthenticated: false, user: null });
    }
  },

  login: async (email: string, password: string) => {
    try {
      const result = await api.login(email, password);
      if (result.error) {
        return { success: false, error: result.error };
      }
      if (result.data?.user) {
        set({
          user: result.data.user,
          role: result.data.user.role as Role || "guest",
          isAuthenticated: true,
        });
        return { success: true };
      }
      return { success: false, error: "Login failed" };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Login failed" };
    }
  },

  register: async (email: string, password: string) => {
    try {
      const result = await api.register(email, password);
      if (result.error) {
        return { success: false, error: result.error };
      }
      if (result.data?.user) {
        set({
          user: result.data.user,
          role: result.data.user.role as Role || "guest",
          isAuthenticated: true,
        });
        return { success: true };
      }
      return { success: false, error: "Registration failed" };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Registration failed" };
    }
  },

  logout: async () => {
    api.logout();
    set({ role: "guest", isAuthenticated: false, user: null });
  },

  setRole: (role) => set({ role }),
}));