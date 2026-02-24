import { create } from "zustand";
import type {
  PageState,
  PageMode,
  PageError,
} from "../../../shared/types/ui-state";

type SessionsState = {
  // Sprint 2: UI state only
  page: PageState;

  // Sprint 2: lifecycle stub (persistence later)
  isBootstrapped: boolean;
  loadSessions: () => Promise<void>;

  // Actions
  setMode: (mode: PageMode) => void;
  setError: (error: PageError | undefined) => void;
  reset: () => void;
};

const initialState: Pick<SessionsState, "page" | "isBootstrapped"> = {
  page: { mode: "results" },
  isBootstrapped: false,
};

export const useSessionsStore = create<SessionsState>((set) => ({
  ...initialState,

  loadSessions: async () => {
    // Sprint 2: stub only. Persistence comes later.
    set({ isBootstrapped: true });
  },

  setMode: (mode) =>
    set((s) => ({
      page: { mode, error: mode === "error" ? s.page.error : undefined },
    })),

  setError: (error) =>
    set(() => ({
      page: { mode: error ? "error" : "results", error },
    })),

  reset: () => set(() => ({ ...initialState })),
}));
