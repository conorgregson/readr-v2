import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { AppShell } from "./AppShell";
import {
  type AuthState,
  useAuthStore,
} from "../features/auth/store/auth.store";
import {
  type BooksState,
  useBooksStore,
} from "../features/books/store/books.store";
import {
  type SessionsState,
  useSessionsStore,
} from "../features/sessions/store/sessions.store";
import {
  type StatsState,
  useStatsStore,
} from "../features/stats/store/stats.store";
import {
  type EngagementState,
  useEngagementStore,
} from "../features/engagement/store/engagement.store";

const mockLogout = vi.fn();
const mockRestoreAuth = vi.fn();

const mockResetBooks = vi.fn();
const mockResetSessions = vi.fn();
const mockResetStats = vi.fn();
const mockResetEngagement = vi.fn();

vi.mock("react-router-dom", () => ({
  NavLink: ({ children }: { children: ReactNode }) => <a>{children}</a>,
  Outlet: () => <div>Outlet Content</div>,
}));

vi.mock("../features/auth/page", () => ({
  AuthPage: () => <div>Auth Page</div>,
}));

vi.mock("../features/auth/store/auth.store", () => ({
  useAuthStore: vi.fn(),
}));

vi.mock("../features/books/store/books.store", () => ({
  useBooksStore: vi.fn(),
}));

vi.mock("../features/sessions/store/sessions.store", () => ({
  useSessionsStore: vi.fn(),
}));

vi.mock("../features/stats/store/stats.store", () => ({
  useStatsStore: vi.fn(),
}));

vi.mock("../features/engagement/store/engagement.store", () => ({
  useEngagementStore: vi.fn(),
}));

const mockedUseAuthStore = vi.mocked(useAuthStore);
const mockedUseBooksStore = vi.mocked(useBooksStore);
const mockedUseSessionsStore = vi.mocked(useSessionsStore);
const mockedUseStatsStore = vi.mocked(useStatsStore);
const mockedUseEngagementStore = vi.mocked(useEngagementStore);

function wireStores(input?: {
  auth?: Partial<AuthState>;
  books?: Partial<BooksState>;
  sessions?: Partial<SessionsState>;
  stats?: Partial<StatsState>;
  engagement?: Partial<EngagementState>;
}) {
  const authState = {
    user: { id: "user-1", email: "test@example.com" },
    isAuthenticated: true,
    isBootstrapping: false,
    isLoginLoading: false,
    isRegisterLoading: false,
    error: null,
    setAuth: vi.fn(),
    login: vi.fn(),
    register: vi.fn(),
    restoreAuth: mockRestoreAuth,
    clearError: vi.fn(),
    logout: mockLogout,
    ...input?.auth,
  } as unknown as AuthState;

  const booksState = {
    reset: mockResetBooks,
    ...input?.books,
  } as unknown as BooksState;

  const sessionsState = {
    reset: mockResetSessions,
    ...input?.sessions,
  } as unknown as SessionsState;

  const statsState = {
    reset: mockResetStats,
    ...input?.stats,
  } as unknown as StatsState;

  const engagementState = {
    reset: mockResetEngagement,
    ...input?.engagement,
  } as unknown as EngagementState;

  mockedUseAuthStore.mockImplementation(
    (selector: (state: AuthState) => unknown) => selector(authState),
  );

  mockedUseBooksStore.mockImplementation(
    (selector: (state: BooksState) => unknown) => selector(booksState),
  );

  mockedUseSessionsStore.mockImplementation(
    (selector: (state: SessionsState) => unknown) => selector(sessionsState),
  );

  mockedUseStatsStore.mockImplementation(
    (selector: (state: StatsState) => unknown) => selector(statsState),
  );

  mockedUseEngagementStore.mockImplementation(
    (selector: (state: EngagementState) => unknown) =>
      selector(engagementState),
  );
}

describe("AppShell", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders authenticated shell content", () => {
    wireStores();

    render(<AppShell />);

    expect(screen.getByText("Readr")).toBeInTheDocument();
    expect(screen.getByText("Books")).toBeInTheDocument();
    expect(screen.getByText("Sessions")).toBeInTheDocument();
    expect(screen.getByText("Stats")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(screen.getByText("Outlet Content")).toBeInTheDocument();
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
  });

  it("renders bootstrap screen while restoring auth", () => {
    wireStores({
      auth: {
        isBootstrapping: true,
      },
    });

    render(<AppShell />);

    expect(screen.getByText("Restoring your session...")).toBeInTheDocument();
  });

  it("renders auth page when unauthenticated", () => {
    wireStores({
      auth: {
        user: null,
        isAuthenticated: false,
        isBootstrapping: false,
      },
    });

    render(<AppShell />);

    expect(screen.getByText("Auth Page")).toBeInTheDocument();
  });

  it("clicking logout resets all feature stores and logs out", () => {
    wireStores();

    render(<AppShell />);

    fireEvent.click(screen.getByRole("button", { name: "Logout" }));

    expect(mockResetBooks).toHaveBeenCalled();
    expect(mockResetSessions).toHaveBeenCalled();
    expect(mockResetStats).toHaveBeenCalled();
    expect(mockResetEngagement).toHaveBeenCalled();
    expect(mockLogout).toHaveBeenCalled();
  });
});
