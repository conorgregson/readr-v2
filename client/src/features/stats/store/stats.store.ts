import { create } from "zustand";
import type {
  DashboardSummaryResponse,
  ReadingTrendMetric,
  ReadingTrendResponse,
} from "../../../../../shared/types/v2.4";
import type { PageError, PageState } from "../../../shared/types/ui-state";
import { StatsService } from "../services/stats.service";

type StatsState = {
  page: PageState;
  isBootstrapped: boolean;
  isLoadingSummary: boolean;
  isLoadingTrend: boolean;

  summary: DashboardSummaryResponse | null;
  trend: ReadingTrendResponse | null;
  selectedMetric: ReadingTrendMetric;

  loadStats: () => Promise<void>;
  loadSummary: () => Promise<void>;
  loadTrend: (metric?: ReadingTrendMetric) => Promise<void>;
  setSelectedMetric: (metric: ReadingTrendMetric) => Promise<void>;

  setError: (error: PageError | undefined) => void;
  reset: () => void;
};

const initialState: Pick<
  StatsState,
  | "page"
  | "isBootstrapped"
  | "isLoadingSummary"
  | "isLoadingTrend"
  | "summary"
  | "trend"
  | "selectedMetric"
> = {
  page: { mode: "results" },
  isBootstrapped: false,
  isLoadingSummary: false,
  isLoadingTrend: false,
  summary: null,
  trend: null,
  selectedMetric: "pages",
};

function resolvePageMode(input: {
  summary: DashboardSummaryResponse | null;
  trend: ReadingTrendResponse | null;
  error?: PageError;
}): PageState {
  if (input.error) {
    return { mode: "error", error: input.error };
  }

  if (!input.summary || !input.trend) {
    return { mode: "loading" };
  }

  return { mode: "results" };
}

export const useStatsStore = create<StatsState>((set, get) => ({
  ...initialState,

  loadSummary: async () => {
    try {
      set({
        isLoadingSummary: true,
        page: get().isBootstrapped ? get().page : { mode: "loading" },
      });

      const summary = await StatsService.getSummary();

      set((s) => ({
        summary,
        isLoadingSummary: false,
        isBootstrapped: true,
        page: resolvePageMode({
          summary,
          trend: s.trend,
        }),
      }));
    } catch (e) {
      set({
        isLoadingSummary: false,
        isBootstrapped: true,
        page: {
          mode: "error",
          error: {
            message:
              (e as Error)?.message ?? "Failed to load dashboard summary",
          },
        },
      });
    }
  },

  loadTrend: async (metric) => {
    const nextMetric = metric ?? get().selectedMetric;

    try {
      set({
        isLoadingTrend: true,
        selectedMetric: nextMetric,
        page: get().isBootstrapped ? get().page : { mode: "loading" },
      });

      const trend = await StatsService.getTrend(nextMetric);

      set((s) => ({
        trend,
        isLoadingTrend: false,
        selectedMetric: nextMetric,
        isBootstrapped: true,
        page: resolvePageMode({
          summary: s.summary,
          trend,
        }),
      }));
    } catch (e) {
      set({
        isLoadingTrend: false,
        selectedMetric: nextMetric,
        isBootstrapped: true,
        page: {
          mode: "error",
          error: {
            message: (e as Error)?.message ?? "Failed to load reading trend",
          },
        },
      });
    }
  },

  loadStats: async () => {
    const metric = get().selectedMetric;

    try {
      set({
        isLoadingSummary: true,
        isLoadingTrend: true,
        page: { mode: "loading" },
      });

      const [summary, trend] = await Promise.all([
        StatsService.getSummary(),
        StatsService.getTrend(metric),
      ]);

      set({
        summary,
        trend,
        selectedMetric: metric,
        isLoadingSummary: false,
        isLoadingTrend: false,
        isBootstrapped: true,
        page: { mode: "results" },
      });
    } catch (e) {
      set({
        isLoadingSummary: false,
        isLoadingTrend: false,
        isBootstrapped: true,
        page: {
          mode: "error",
          error: {
            message: (e as Error)?.message ?? "Failed to load dashboard",
          },
        },
      });
    }
  },

  setSelectedMetric: async (metric) => {
    await get().loadTrend(metric);
  },

  setError: (error) =>
    set({
      page: { mode: error ? "error" : "results", error },
    }),

  reset: () =>
    set({
      ...initialState,
    }),
}));
