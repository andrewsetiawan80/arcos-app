// src/store/auth.ts - API-backed auth
import { create } from 'zustand';
import { api } from '../lib/api';

const DEFAULT_ROLE = 'guest';

export type Role = 'admin' | 'production' | 'guest';

type AuthStore = {
  role: Role;
  isAuthenticated: boolean;
  user: { id: number; email: string; role: string } | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  loadAuth: () => Promise<void>;
  setRole: (role: Role) => void;
};

export const useAuth = create<AuthStore>((set) => ({
  role: DEFAULT_ROLE,
  isAuthenticated: false,
  user: null,
  
  loadAuth: async () => {
    try {
      const result = await api.getCurrentUser();
      if (result.data?.user) {
        const userRole = result.data.user.role;
        const role: Role = userRole === 'admin' ? 'admin' : userRole === 'production' ? 'production' : 'guest';
        set({
          user: result.data.user,
          role,
          isAuthenticated: userRole === 'admin' || userRole === 'production',
        });
      } else {
        set({ role: DEFAULT_ROLE, isAuthenticated: false, user: null });
      }
    } catch (error) {
      console.error('Failed to load auth:', error);
      set({ role: DEFAULT_ROLE, isAuthenticated: false, user: null });
    }
  },
  
  setRole: async (role: Role) => {
    set({ role, isAuthenticated: role === 'admin' || role === 'production' });
  },
  
  login: async (email: string, password: string) => {
    try {
      const result = await api.login(email, password);
      if (result.error) {
        return { success: false, error: result.error };
      }
      if (result.data?.user) {
        const userRole = result.data.user.role;
        const role: Role = userRole === 'admin' ? 'admin' : userRole === 'production' ? 'production' : 'guest';
        set({
          user: result.data.user,
          role,
          isAuthenticated: userRole === 'admin' || userRole === 'production',
        });
        return { success: true };
      }
      return { success: false, error: 'Login failed' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Login failed' };
    }
  },
  
  register: async (email: string, password: string) => {
    try {
      const result = await api.register(email, password);
      if (result.error) {
        return { success: false, error: result.error };
      }
      if (result.data?.user) {
        const userRole = result.data.user.role;
        const role: Role = userRole === 'admin' ? 'admin' : userRole === 'production' ? 'production' : 'guest';
        set({
          user: result.data.user,
          role,
          isAuthenticated: userRole === 'admin' || userRole === 'production',
        });
        return { success: true };
      }
      return { success: false, error: 'Registration failed' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Registration failed' };
    }
  },
  
  logout: async () => {
    await api.logout();
    set({ role: DEFAULT_ROLE, isAuthenticated: false, user: null });
  },
}));