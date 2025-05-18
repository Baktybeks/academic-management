// store/authStore.ts
import { create } from "zustand";
import { User, UserRole } from "@/types";
import { authApi } from "@/services/authService";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    role?: UserRole
  ) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    try {
      set({ isLoading: true, error: null });
      const user = await authApi.login(email, password);
      set({ user, isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Неизвестная ошибка";
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  register: async (name, email, password, role) => {
    try {
      set({ isLoading: true, error: null });
      await authApi.register(name, email, password, role);
      set({ isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Неизвестная ошибка";
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true, error: null });
      await authApi.logout();
      set({ user: null, isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Неизвестная ошибка";
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  checkAuth: async () => {
    try {
      set({ isLoading: true, error: null });
      const user = await authApi.getCurrentUser();
      if (user && !("notActivated" in user)) {
        set({ user: user as User, isLoading: false });
      } else {
        set({ user: null, isLoading: false });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Неизвестная ошибка";
      set({ user: null, error: errorMessage, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
