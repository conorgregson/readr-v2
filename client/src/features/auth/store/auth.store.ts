import { create } from "zustand";
import { clearToken, getToken, setToken } from "../../../shared/api/api";
import { AuthService, type AuthUser } from "../services/auth.service";

type AuthState = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  error: string | null;

  setAuth: (data: { token: string; user: AuthUser }) => void;
  login: (input: { email: string; password: string }) => Promise<boolean>;
  register: (input: { email: string; password: string }) => Promise<boolean>;
  restoreAuth: () => Promise<void>;
  clearError: () => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isBootstrapping: true,
  error: null,

  setAuth: ({ token, user }) => {
    setToken(token);
    set({
      user,
      isAuthenticated: true,
      isBootstrapping: false,
      error: null,
    });
  },

  login: async ({ email, password }) => {
    try {
      const data = await AuthService.login({ email, password });
      setToken(data.token);
      set({
        user: data.user,
        isAuthenticated: true,
        isBootstrapping: false,
        error: null,
      });
      return true;
    } catch (error) {
      clearToken();
      set({
        user: null,
        isAuthenticated: false,
        isBootstrapping: false,
        error: (error as Error)?.message ?? "Login failed",
      });
      return false;
    }
  },

  register: async ({ email, password }) => {
    try {
      const data = await AuthService.register({ email, password });
      setToken(data.token);
      set({
        user: data.user,
        isAuthenticated: true,
        isBootstrapping: false,
        error: null,
      });
      return true;
    } catch (error) {
      clearToken();
      set({
        user: null,
        isAuthenticated: false,
        isBootstrapping: false,
        error: (error as Error)?.message ?? "Registration failed",
      });
      return false;
    }
  },

  restoreAuth: async () => {
    const token = getToken();

    if (!token) {
      set({
        user: null,
        isAuthenticated: false,
        isBootstrapping: false,
        error: null,
      });
      return;
    }

    try {
      const user = await AuthService.me();
      set({
        user,
        isAuthenticated: true,
        isBootstrapping: false,
        error: null,
      });
    } catch {
      clearToken();
      set({
        user: null,
        isAuthenticated: false,
        isBootstrapping: false,
        error: null,
      });
    }
  },

  clearError: () => set({ error: null }),

  logout: () => {
    clearToken();
    set({
      user: null,
      isAuthenticated: false,
      isBootstrapping: false,
      error: null,
    });
  },
}));
