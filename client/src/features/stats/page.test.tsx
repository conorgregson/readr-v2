import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StatsPage } from "./page";
import { type StatsState, useStatsStore } from "./store/stats.store";
import {
  type EngagementState,
  useEngagementStore,
} from "../engagement/store/engagement.store";

vi.mock("./store/stats.store", () => ({
  useStatsStore: vi.fn(),
}));

vi.mock("../engagement/store/engagement.store", () => ({
  useEngagementStore: vi.fn(),
}));

vi.mock("../../shared/ui/states/LoadingState", () => ({
  LoadingState: ({ label }: { label: string }) => <div>{label}</div>,
}));

vi.mock("../../shared/ui/states/ErrorState", () => ({
  ErrorState: ({
    message,
    action,
  }: {
    message: string;
    action?: React.ReactNode;
  }) => (
    <div>
      <div>{message}</div>
      {action}
    </div>
  ),
}));

vi.mock("../../shared/ui/Button", () => ({
  Button: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => <button onClick={onClick}>{children}</button>,
}));

vi.mock("../engagement/components/EngagementPanel", () => ({
  EngagementPanel: ({
    snapshot,
  }: {
    snapshot: { badges: Array<{ key: string }> };
  }) => (
    <div data-testid="engagement-panel">
      Engagement panel with {snapshot.badges.length} badges
    </div>
  ),
}));

const mockedUseStatsStore = vi.mocked(useStatsStore);
const mockedUseEngagementStore = vi.mocked(useEngagementStore);

function createStatsState(overrides: Partial<StatsState> = {}): StatsState {
  return {
    page: { mode: "results" },
    isBootstrapped: true,
    isLoadingSummary: false,
    isLoadingTrend: false,
    summary: {
      totals: {
        books: 10,
        finishedBooks: 4,
        pagesRead: 1200,
        sessionsLogged: 8,
        avgSessionMinutes: 25.5,
      },
      currentPeriod: {
        booksFinishedThisMonth: 2,
        pagesReadThisMonth: 340,
      },
    },
    trend: {
      metric: "pages" as const,
      points: [
        { date: "2026-04-01", value: 10 },
        { date: "2026-04-02", value: 20 },
        { date: "2026-04-03", value: 0 },
      ],
    },
    selectedMetric: "pages",
    loadStats: vi.fn().mockResolvedValue(undefined),
    loadSummary: vi.fn().mockResolvedValue(undefined),
    loadTrend: vi.fn().mockResolvedValue(undefined),
    setSelectedMetric: vi.fn().mockResolvedValue(undefined),
    setError: vi.fn(),
    reset: vi.fn(),
    ...overrides,
  };
}

function createEngagementState(
  overrides: Partial<EngagementState> = {},
): EngagementState {
  return {
    page: { mode: "results" },
    isBootstrapped: true,
    isLoading: false,
    snapshot: {
      goals: {
        yearlyBooksGoal: {
          target: 12,
          progress: 4,
          complete: false,
        },
      },
      streaks: {
        currentStreakDays: 2,
        longestStreakDays: 5,
        graceWindowEnabled: false,
      },
      badges: [
        {
          key: "books-1",
          title: "First Finish",
          description: "Finish 1 book.",
          tier: "bronze" as const,
          unlocked: true,
          progress: 4,
          target: 1,
        },
      ],
    },
    loadEngagement: vi.fn().mockResolvedValue(undefined),
    setError: vi.fn(),
    reset: vi.fn(),
    ...overrides,
  };
}

function wireStores(statsState: StatsState, engagementState: EngagementState) {
  mockedUseStatsStore.mockImplementation((selector) => selector(statsState));
  mockedUseEngagementStore.mockImplementation((selector) =>
    selector(engagementState),
  );
}

describe("StatsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading while dashboard data is bootstrapping", () => {
    const statsState = createStatsState({
      isBootstrapped: false,
      isLoadingSummary: true,
      isLoadingTrend: true,
      summary: null,
      trend: null,
    });

    const engagementState = createEngagementState({
      isBootstrapped: false,
      isLoading: true,
      snapshot: null,
    });

    wireStores(statsState, engagementState);

    render(<StatsPage />);

    expect(screen.getByText("Loading dashboard...")).toBeInTheDocument();
  });

  it("renders stats cards, trend controls, and engagement section when ready", () => {
    const statsState = createStatsState();
    const engagementState = createEngagementState();

    wireStores(statsState, engagementState);

    render(<StatsPage />);

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Total Books")).toBeInTheDocument();
    expect(screen.getByText("Finished Books")).toBeInTheDocument();
    expect(screen.getByText("Pages Read")).toBeInTheDocument();
    expect(screen.getByText("Sessions Logged")).toBeInTheDocument();
    expect(screen.getByText("Avg Session Minutes")).toBeInTheDocument();
    expect(screen.getByText("Books Finished This Month")).toBeInTheDocument();

    expect(screen.getByRole("button", { name: "Pages" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Sessions" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Books Finished" }),
    ).toBeInTheDocument();

    expect(screen.getByText("Engagement")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Goals, streaks, and badge progress derived from your reading activity.",
      ),
    ).toBeInTheDocument();

    expect(screen.getByTestId("engagement-panel")).toBeInTheDocument();
    expect(
      screen.getByText("Engagement panel with 1 badges"),
    ).toBeInTheDocument();
  });

  it("renders error state for stats error", () => {
    const statsState = createStatsState({
      page: {
        mode: "error",
        error: { message: "Failed to load dashboard" },
      },
    });

    const engagementState = createEngagementState();

    wireStores(statsState, engagementState);

    render(<StatsPage />);

    expect(screen.getByText("Failed to load dashboard")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Dismiss" })).toBeInTheDocument();
  });

  it("renders error state for engagement error", () => {
    const statsState = createStatsState();

    const engagementState = createEngagementState({
      page: {
        mode: "error",
        error: { message: "Failed to load engagement data" },
      },
    });

    wireStores(statsState, engagementState);

    render(<StatsPage />);

    expect(
      screen.getByText("Failed to load engagement data"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Dismiss" })).toBeInTheDocument();
  });

  it("dismiss clears both stats and engagement errors", () => {
    const statsSetError = vi.fn();
    const engagementSetError = vi.fn();

    const statsState = createStatsState({
      page: {
        mode: "error",
        error: { message: "Stats broke" },
      },
      setError: statsSetError,
    });

    const engagementState = createEngagementState({
      page: {
        mode: "error",
        error: { message: "Engagement broke" },
      },
      setError: engagementSetError,
    });

    wireStores(statsState, engagementState);

    render(<StatsPage />);

    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));

    expect(statsSetError).toHaveBeenCalledWith(undefined);
    expect(engagementSetError).toHaveBeenCalledWith(undefined);
  });

  it("retry reloads both stats and engagement data", async () => {
    const user = userEvent.setup();

    const loadStats = vi.fn().mockResolvedValue(undefined);
    const loadEngagement = vi.fn().mockResolvedValue(undefined);
    const statsSetError = vi.fn();
    const engagementSetError = vi.fn();

    const statsState = createStatsState({
      page: {
        mode: "error",
        error: { message: "Failed to load dashboard" },
      },
      loadStats,
      setError: statsSetError,
    });

    const engagementState = createEngagementState({
      loadEngagement,
      setError: engagementSetError,
    });

    wireStores(statsState, engagementState);

    render(<StatsPage />);

    await user.click(screen.getByRole("button", { name: "Retry" }));

    await waitFor(() => {
      expect(statsSetError).toHaveBeenCalledWith(undefined);
      expect(engagementSetError).toHaveBeenCalledWith(undefined);
      expect(loadStats).toHaveBeenCalledTimes(1);
      expect(loadEngagement).toHaveBeenCalledTimes(1);
    });
  });

  it("clicking a metric button calls setSelectedMetric", () => {
    const setSelectedMetric = vi.fn().mockResolvedValue(undefined);

    const statsState = createStatsState({
      setSelectedMetric,
    });

    const engagementState = createEngagementState();

    wireStores(statsState, engagementState);

    render(<StatsPage />);

    fireEvent.click(screen.getByRole("button", { name: "Sessions" }));

    expect(setSelectedMetric).toHaveBeenCalledWith("sessions");
  });

  it("shows loading if summary/trend or engagement snapshot is still missing", () => {
    const statsState = createStatsState({
      summary: null,
    });

    const engagementState = createEngagementState();

    wireStores(statsState, engagementState);

    render(<StatsPage />);

    expect(screen.getByText("Loading dashboard...")).toBeInTheDocument();
  });
});
