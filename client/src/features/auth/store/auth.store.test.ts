import { beforeEach, describe, expect, it, vi } from "vitest";

import { useAuthStore } from "./auth.store";
import { AuthService, ApiRequestError } from "../services/auth.service";
import * as apiModule from "../../../shared/api/api";

vi.mock("../services/auth.service", () => ({
  AuthService: {
    login: vi.fn(),
    register: vi.fn(),
    me: vi.fn(),
  },
  ApiRequestError: class ApiRequestError extends Error {
    status: number;
    code?: string;
    details?: unknown;

    constructor(
      message: string,
      options: { status: number; code?: string; details?: unknown },
    ) {
      super(message);
      this.name = "ApiRequestError";
      this.status = options.status;
      this.code = options.code;
      this.details = options.details;
    }
  },
}));

vi.mock("../../../shared/api/api", async () => {
  const actual = await vi.importActual<
    typeof import("../../../shared/api/api")
  >("../../../shared/api/api");

  return {
    ...actual,
    getToken: vi.fn(),
    setToken: vi.fn(),
    clearToken: vi.fn(),
    setUnauthorizedHandler: vi.fn(),
  };
});

const mockedAuthService = vi.mocked(AuthService);
const mockedApi = vi.mocked(apiModule);

function resetStore() {
  useAuthStore.setState({
    user: null,
    isAuthenticated: false,
    isBootstrapping: true,
    isLoginLoading: false,
    isRegisterLoading: false,
    error: null,
  });
}

describe("auth store", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetStore();
  });

  it("logs in successfully and sets authenticated state", async () => {
    mockedAuthService.login.mockResolvedValue({
      token: "test-token",
      user: {
        id: "user-1",
        email: "test@example.com",
      },
    });

    const result = await useAuthStore.getState().login({
      email: "test@example.com",
      password: "Password123!",
    });

    const state = useAuthStore.getState();

    expect(result).toBe(true);
    expect(mockedApi.setToken).toHaveBeenCalledWith("test-token");
    expect(state.user).toEqual({
      id: "user-1",
      email: "test@example.com",
    });
    expect(state.isAuthenticated).toBe(true);
    expect(state.isLoginLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it("maps invalid login errors and clears auth state", async () => {
    mockedAuthService.login.mockRejectedValue(
      new ApiRequestError("Unauthorized", {
        status: 401,
        code: "INVALID_CREDENTIALS",
      }),
    );

    const result = await useAuthStore.getState().login({
      email: "test@example.com",
      password: "WrongPassword123!",
    });

    const state = useAuthStore.getState();

    expect(result).toBe(false);
    expect(mockedApi.clearToken).toHaveBeenCalled();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoginLoading).toBe(false);
    expect(state.error).toBe("Email or password is incorrect.");
  });

  it("registers successfully and sets authenticated state", async () => {
    mockedAuthService.register.mockResolvedValue({
      token: "register-token",
      user: {
        id: "user-2",
        email: "new@example.com",
      },
    });

    const result = await useAuthStore.getState().register({
      email: "new@example.com",
      password: "Password123!",
    });

    const state = useAuthStore.getState();

    expect(result).toBe(true);
    expect(mockedApi.setToken).toHaveBeenCalledWith("register-token");
    expect(state.user).toEqual({
      id: "user-2",
      email: "new@example.com",
    });
    expect(state.isAuthenticated).toBe(true);
    expect(state.isRegisterLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it("maps duplicate-email register errors", async () => {
    mockedAuthService.register.mockRejectedValue(
      new ApiRequestError("Email already exists", {
        status: 409,
        code: "EMAIL_ALREADY_EXISTS",
      }),
    );

    const result = await useAuthStore.getState().register({
      email: "dupe@example.com",
      password: "Password123!",
    });

    const state = useAuthStore.getState();

    expect(result).toBe(false);
    expect(mockedApi.clearToken).toHaveBeenCalled();
    expect(state.isAuthenticated).toBe(false);
    expect(state.error).toBe("An account with that email already exists.");
  });

  it("restoreAuth leaves user logged out when no token exists", async () => {
    mockedApi.getToken.mockReturnValue(null);

    await useAuthStore.getState().restoreAuth();

    const state = useAuthStore.getState();

    expect(mockedAuthService.me).not.toHaveBeenCalled();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isBootstrapping).toBe(false);
  });

  it("restoreAuth restores the user when token is valid", async () => {
    mockedApi.getToken.mockReturnValue("valid-token");
    mockedAuthService.me.mockResolvedValue({
      id: "user-3",
      email: "restore@example.com",
    });

    await useAuthStore.getState().restoreAuth();

    const state = useAuthStore.getState();

    expect(mockedAuthService.me).toHaveBeenCalled();
    expect(state.user).toEqual({
      id: "user-3",
      email: "restore@example.com",
    });
    expect(state.isAuthenticated).toBe(true);
    expect(state.isBootstrapping).toBe(false);
    expect(state.error).toBeNull();
  });

  it("restoreAuth clears token and auth state when token is invalid", async () => {
    mockedApi.getToken.mockReturnValue("bad-token");
    mockedAuthService.me.mockRejectedValue(new Error("Unauthorized"));

    await useAuthStore.getState().restoreAuth();

    const state = useAuthStore.getState();

    expect(mockedApi.clearToken).toHaveBeenCalled();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isBootstrapping).toBe(false);
    expect(state.error).toBeNull();
  });

  it("logout clears token and resets auth state", () => {
    useAuthStore.setState({
      user: { id: "user-4", email: "logout@example.com" },
      isAuthenticated: true,
      isBootstrapping: false,
      isLoginLoading: false,
      isRegisterLoading: false,
      error: "Some error",
    });

    useAuthStore.getState().logout();

    const state = useAuthStore.getState();

    expect(mockedApi.clearToken).toHaveBeenCalled();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isBootstrapping).toBe(false);
    expect(state.isLoginLoading).toBe(false);
    expect(state.isRegisterLoading).toBe(false);
    expect(state.error).toBeNull();
  });
});
