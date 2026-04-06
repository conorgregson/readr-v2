import { create } from "zustand";
import type { EngagementSnapshotResponse } from "../../../../../shared/types/v2.4";
import type { PageError, PageState } from "../../../shared/types/ui-state";
import { EngagementService } from "../services/engagement.service";

export type EngagementState = {
  page: PageState;
  isBootstrapped: boolean;
  isLoading: boolean;

  snapshot: EngagementSnapshotResponse | null;

  loadEngagement: () => Promise<void>;
  setError: (error: PageError | undefined) => void;
  reset: () => void;
};

const initialState: Pick<
  EngagementState,
  "page" | "isBootstrapped" | "isLoading" | "snapshot"
> = {
  page: { mode: "results" },
  isBootstrapped: false,
  isLoading: false,
  snapshot: null,
};

export const useEngagementStore = create<EngagementState>((set) => ({
  ...initialState,

  loadEngagement: async () => {
    try {
      set({
        isLoading: true,
        page: { mode: "loading" },
      });

      const snapshot = await EngagementService.getSnapshot();

      set({
        snapshot,
        isBootstrapped: true,
        isLoading: false,
        page: { mode: "results" },
      });
    } catch (e) {
      set({
        isBootstrapped: true,
        isLoading: false,
        page: {
          mode: "error",
          error: {
            message: (e as Error)?.message ?? "Failed to load engagement data",
          },
        },
      });
    }
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
