import { create } from "zustand";
import {
  clearToken,
  getToken,
  setToken,
  setUnauthorizedHandler,
} from "../../../shared/api/api";
import {
  AuthService,
  ApiRequestError,
  type AuthUser,
} from "../services/auth.service";

type AuthState = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  isLoginLoading: boolean;
  isRegisterLoading: boolean;
  error: string | null;

  setAuth: (data: { token: string; user: AuthUser }) => void;
  login: (input: { email: string; password: string }) => Promise<boolean>;
  register: (input: { email: string; password: string }) => Promise<boolean>;
  restoreAuth: () => Promise<void>;
  clearError: () => void;
  logout: () => void;
};

function mapAuthError(error: unknown, fallback: string) {
  if (error instanceof ApiRequestError) {
    if (error.code === "INVALID_CREDENTIALS" || error.status === 401) {
      return "Email or password is incorrect.";
    }

    if (
      error.code === "EMAIL_ALREADY_EXISTS" ||
      /already exists|duplicate/i.test(error.message)
    ) {
      return "An account with that email already exists.";
    }

    return error.message || fallback;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isBootstrapping: true,
  isLoginLoading: false,
  isRegisterLoading: false,
  error: null,

  setAuth: ({ token, user }) => {
    setToken(token);
    set({
      user,
      isAuthenticated: true,
      isBootstrapping: false,
      isLoginLoading: false,
      isRegisterLoading: false,
      error: null,
    });
  },

  login: async ({ email, password }) => {
    set({
      isLoginLoading: true,
      error: null,
    });

    try {
      const data = await AuthService.login({ email, password });
      setToken(data.token);
      set({
        user: data.user,
        isAuthenticated: true,
        isBootstrapping: false,
        isLoginLoading: false,
        isRegisterLoading: false,
        error: null,
      });
      return true;
    } catch (error) {
      clearToken();
      set({
        user: null,
        isAuthenticated: false,
        isBootstrapping: false,
        isLoginLoading: false,
        error: mapAuthError(error, "Login failed. Please try again."),
      });
      return false;
    }
  },

  register: async ({ email, password }) => {
    set({
      isRegisterLoading: true,
      error: null,
    });

    try {
      const data = await AuthService.register({ email, password });
      setToken(data.token);
      set({
        user: data.user,
        isAuthenticated: true,
        isBootstrapping: false,
        isLoginLoading: false,
        isRegisterLoading: false,
        error: null,
      });
      return true;
    } catch (error) {
      clearToken();
      set({
        user: null,
        isAuthenticated: false,
        isBootstrapping: false,
        isRegisterLoading: false,
        error: mapAuthError(error, "Registration failed. Please try again."),
      });
      return false;
    }
  },

  restoreAuth: async () => {
    set({
      isBootstrapping: true,
      error: null,
    });

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
      isLoginLoading: false,
      isRegisterLoading: false,
      error: null,
    });
  },
}));

setUnauthorizedHandler(() => {
  const state = useAuthStore.getState();

  if (!state.isAuthenticated && !state.isBootstrapping) return;

  state.logout();
});
