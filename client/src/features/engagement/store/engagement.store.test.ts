import { beforeEach, describe, expect, it, vi } from "vitest";
import { useEngagementStore } from "./engagement.store";
import { EngagementService } from "../services/engagement.service";

vi.mock("../services/engagement.service", () => ({
  EngagementService: {
    getSnapshot: vi.fn(),
  },
}));

const mockedEngagementService = vi.mocked(EngagementService);

function resetStore() {
  useEngagementStore.setState({
    page: { mode: "results" },
    isBootstrapped: false,
    isLoading: false,
    snapshot: null,
  });
}

describe("engagement store", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetStore();
  });

  it("loads engagement snapshot successfully", async () => {
    mockedEngagementService.getSnapshot.mockResolvedValue({
      goals: {
        yearlyBooksGoal: {
          target: 12,
          progress: 3,
          complete: false,
        },
        yearlyPagesGoal: {
          target: 5000,
          progress: 750,
          complete: false,
        },
        monthlyBooksGoal: {
          target: 2,
          progress: 1,
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
          tier: "bronze",
          unlocked: true,
          progress: 3,
          target: 1,
        },
      ],
    });

    await useEngagementStore.getState().loadEngagement();

    const state = useEngagementStore.getState();

    expect(mockedEngagementService.getSnapshot).toHaveBeenCalled();
    expect(state.isBootstrapped).toBe(true);
    expect(state.isLoading).toBe(false);
    expect(state.page.mode).toBe("results");
    expect(state.snapshot).toEqual({
      goals: {
        yearlyBooksGoal: {
          target: 12,
          progress: 3,
          complete: false,
        },
        yearlyPagesGoal: {
          target: 5000,
          progress: 750,
          complete: false,
        },
        monthlyBooksGoal: {
          target: 2,
          progress: 1,
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
          tier: "bronze",
          unlocked: true,
          progress: 3,
          target: 1,
        },
      ],
    });
  });

  it("stores load failure as page error", async () => {
    mockedEngagementService.getSnapshot.mockRejectedValue(
      new Error("Failed to load engagement data"),
    );

    await useEngagementStore.getState().loadEngagement();

    const state = useEngagementStore.getState();

    expect(state.isBootstrapped).toBe(true);
    expect(state.isLoading).toBe(false);
    expect(state.snapshot).toBeNull();
    expect(state.page.mode).toBe("error");
    expect(state.page.error?.message).toBe("Failed to load engagement data");
  });

  it("setError updates page state", () => {
    useEngagementStore.getState().setError({
      message: "Engagement exploded",
    });

    let state = useEngagementStore.getState();
    expect(state.page.mode).toBe("error");
    expect(state.page.error?.message).toBe("Engagement exploded");

    useEngagementStore.getState().setError(undefined);

    state = useEngagementStore.getState();
    expect(state.page.mode).toBe("results");
    expect(state.page.error).toBeUndefined();
  });

  it("reset clears snapshot and flags", async () => {
    useEngagementStore.setState({
      page: { mode: "error", error: { message: "Boom" } },
      isBootstrapped: true,
      isLoading: true,
      snapshot: {
        goals: {
          yearlyBooksGoal: {
            target: 12,
            progress: 6,
            complete: false,
          },
        },
        streaks: {
          currentStreakDays: 4,
          longestStreakDays: 10,
          graceWindowEnabled: false,
        },
        badges: [
          {
            key: "streak-3",
            title: "On a Roll",
            description: "Reach a 3-day reading streak.",
            tier: "bronze",
            unlocked: true,
            progress: 10,
            target: 3,
          },
        ],
      },
    });

    useEngagementStore.getState().reset();

    const state = useEngagementStore.getState();

    expect(state.page).toEqual({ mode: "results" });
    expect(state.isBootstrapped).toBe(false);
    expect(state.isLoading).toBe(false);
    expect(state.snapshot).toBeNull();
  });
});
