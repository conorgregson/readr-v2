import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AuthPage } from "./page";
import { useAuthStore } from "./store/auth.store";

vi.mock("./store/auth.store", () => ({
  useAuthStore: vi.fn(),
}));

const mockedUseAuthStore = vi.mocked(useAuthStore);

type AuthStoreSnapshot = {
  login: ReturnType<typeof vi.fn>;
  register: ReturnType<typeof vi.fn>;
  error: string | null;
  clearError: ReturnType<typeof vi.fn>;
  isLoginLoading: boolean;
  isRegisterLoading: boolean;
};

function createStoreSnapshot(
  overrides?: Partial<AuthStoreSnapshot>,
): AuthStoreSnapshot {
  return {
    login: vi.fn().mockResolvedValue(true),
    register: vi.fn().mockResolvedValue(true),
    error: null,
    clearError: vi.fn(),
    isLoginLoading: false,
    isRegisterLoading: false,
    ...overrides,
  };
}

function renderWithStore(snapshot: AuthStoreSnapshot) {
  mockedUseAuthStore.mockImplementation(((
    selector: (state: AuthStoreSnapshot) => unknown,
  ) => selector(snapshot)) as typeof useAuthStore);
  return render(<AuthPage />);
}

describe("AuthPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders login mode by default", () => {
    const snapshot = createStoreSnapshot();
    renderWithStore(snapshot);

    expect(
      screen.getByRole("heading", { name: /welcome to readr/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/sign in to access your reading data\./i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^sign in$/i }),
    ).toBeInTheDocument();
  });

  it("switches to register mode", () => {
    const snapshot = createStoreSnapshot();
    renderWithStore(snapshot);

    fireEvent.click(screen.getByRole("button", { name: /register/i }));

    expect(
      screen.getByText(/create an account to start tracking your library\./i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^create account$/i }),
    ).toBeInTheDocument();
    expect(snapshot.clearError).toHaveBeenCalled();
  });

  it("shows email validation errors after blur", async () => {
    const snapshot = createStoreSnapshot();
    renderWithStore(snapshot);

    const emailInput = screen.getByLabelText(/email/i);

    fireEvent.blur(emailInput);

    expect(await screen.findByText(/email is required\./i)).toBeInTheDocument();

    fireEvent.change(emailInput, { target: { value: "not-an-email" } });
    fireEvent.blur(emailInput);

    expect(
      await screen.findByText(/enter a valid email address\./i),
    ).toBeInTheDocument();
  });

  it("shows password validation errors after blur", async () => {
    const snapshot = createStoreSnapshot();
    renderWithStore(snapshot);

    const passwordInput = screen.getByLabelText(/password/i);

    fireEvent.blur(passwordInput);

    expect(
      await screen.findByText(/password is required\./i),
    ).toBeInTheDocument();

    fireEvent.change(passwordInput, { target: { value: "short" } });
    fireEvent.blur(passwordInput);

    expect(
      await screen.findByText(/password must be at least 8 characters\./i),
    ).toBeInTheDocument();
  });

  it("submits login credentials in login mode", async () => {
    const snapshot = createStoreSnapshot();
    renderWithStore(snapshot);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "Password123!" },
    });

    fireEvent.click(screen.getByRole("button", { name: /^sign in$/i }));

    await waitFor(() => {
      expect(snapshot.clearError).toHaveBeenCalled();
      expect(snapshot.login).toHaveBeenCalledWith({
        email: "user@example.com",
        password: "Password123!",
      });
    });

    expect(snapshot.register).not.toHaveBeenCalled();
  });

  it("submits register credentials in register mode", async () => {
    const snapshot = createStoreSnapshot();
    renderWithStore(snapshot);

    fireEvent.click(screen.getByRole("button", { name: /register/i }));

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "newuser@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "Password123!" },
    });

    fireEvent.click(screen.getByRole("button", { name: /^create account$/i }));

    await waitFor(() => {
      expect(snapshot.clearError).toHaveBeenCalled();
      expect(snapshot.register).toHaveBeenCalledWith({
        email: "newuser@example.com",
        password: "Password123!",
      });
    });

    expect(snapshot.login).not.toHaveBeenCalled();
  });

  it("does not submit when validation errors are present", async () => {
    const snapshot = createStoreSnapshot();
    renderWithStore(snapshot);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "bad-email" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "short" },
    });

    fireEvent.click(screen.getByRole("button", { name: /^sign in$/i }));

    expect(
      await screen.findByText(/enter a valid email address\./i),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/password must be at least 8 characters\./i),
    ).toBeInTheDocument();

    expect(snapshot.login).not.toHaveBeenCalled();
    expect(snapshot.register).not.toHaveBeenCalled();
  });

  it("renders auth error from the store", () => {
    const snapshot = createStoreSnapshot({
      error: "Email or password is incorrect.",
    });
    renderWithStore(snapshot);

    expect(screen.getByRole("alert")).toHaveTextContent(
      /email or password is incorrect\./i,
    );
  });

  it("disables controls while login is loading", () => {
    const snapshot = createStoreSnapshot({
      isLoginLoading: true,
    });
    renderWithStore(snapshot);

    expect(screen.getByLabelText(/email/i)).toBeDisabled();
    expect(screen.getByLabelText(/password/i)).toBeDisabled();
    expect(screen.getByRole("button", { name: /login/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /register/i })).toBeDisabled();
    expect(
      screen.getByRole("button", { name: /signing in\.\.\./i }),
    ).toBeDisabled();
  });

  it("disables controls while register is loading", () => {
    const snapshot = createStoreSnapshot({
      isRegisterLoading: true,
    });
    renderWithStore(snapshot);

    fireEvent.click(screen.getByRole("button", { name: /register/i }));

    expect(screen.getByLabelText(/email/i)).toBeDisabled();
    expect(screen.getByLabelText(/password/i)).toBeDisabled();
    expect(screen.getByRole("button", { name: /login/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /register/i })).toBeDisabled();
    expect(
      screen.getByRole("button", { name: /creating account\.\.\./i }),
    ).toBeDisabled();
  });
});
