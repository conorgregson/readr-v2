import { create } from "zustand";
import type {
  PageError,
  PageMode,
  PageState,
} from "../../../shared/types/ui-state";
import type {
  Session,
  CreateSessionInput,
  SessionsFilters,
  SessionsSortKey,
} from "../types";
import { SessionsService } from "../services/sessions.service";
import { sortSessions } from "../services/sessions.sort";

const SESSIONS_UI_KEY = "readr.sessions.ui.v1";

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

type SessionsState = {
  // UI state
  page: PageState;
  isBootstrapped: boolean;

  // domain
  sessions: Session[];
  filters: SessionsFilters;
  sortKey: SessionsSortKey;

  // lifecycle
  loadSessions: () => Promise<void>;

  // CRUD (Sprint 6: start with add; edit/delete can come next)
  addSession: (input: CreateSessionInput) => Promise<Session | null>;
  updateSession: (
    id: string,
    patch: Partial<Omit<Session, "id" | "createdAt">>,
  ) => Promise<Session | null>;
  deleteSession: (id: string) => Promise<boolean>;

  // filters/sort (Sprint 6+)
  setFilters: (patch: Partial<SessionsFilters>) => void;
  clearFilters: () => void;
  setSortKey: (key: SessionsSortKey) => void;

  // actions
  setMode: (mode: PageMode) => void;
  setError: (error: PageError | undefined) => void;

  reset: () => void;
};

const persistedUI = safeParse<{
  filters?: SessionsFilters;
  sortKey?: SessionsSortKey;
}>(localStorage.getItem(SESSIONS_UI_KEY));

const initialState: Pick<
  SessionsState,
  "page" | "isBootstrapped" | "sessions" | "filters" | "sortKey"
> = {
  page: { mode: "results" },
  isBootstrapped: false,
  sessions: [],
  filters: persistedUI?.filters ?? {},
  sortKey: persistedUI?.sortKey ?? "date:desc",
};

function persistUI(next: {
  filters: SessionsFilters;
  sortKey: SessionsSortKey;
}) {
  localStorage.setItem(SESSIONS_UI_KEY, JSON.stringify(next));
}

export const useSessionsStore = create<SessionsState>((set) => ({
  ...initialState,

  setFilters: (patch) =>
    set((s) => {
      const nextFilters = { ...s.filters, ...patch };
      persistUI({ filters: nextFilters, sortKey: s.sortKey });
      return { filters: nextFilters };
    }),

  clearFilters: () =>
    set((s) => {
      persistUI({ filters: {}, sortKey: s.sortKey });
      return { filters: {} };
    }),

  setSortKey: (key) =>
    set((s) => {
      persistUI({ filters: s.filters, sortKey: key });
      return { sortKey: key };
    }),

  loadSessions: async () => {
    try {
      set({ page: { mode: "loading" } });

      const listed = SessionsService.list();
      const sorted = sortSessions(listed, "date:desc");

      set({
        sessions: sorted,
        isBootstrapped: true,
        page: { mode: sorted.length ? "results" : "empty" },
      });
    } catch (e) {
      set({
        isBootstrapped: true,
        page: {
          mode: "error",
          error: {
            message: (e as Error)?.message ?? "Failed to load sessions",
          },
        },
      });
    }
  },

  addSession: async (input) => {
    try {
      const created = SessionsService.create(input);

      // Keep store in sync (service already wrote it)
      set((s) => ({
        sessions: sortSessions([created, ...s.sessions], "date:desc"),
        page: { mode: "results" },
      }));

      return created;
    } catch (e) {
      set({
        page: {
          mode: "error",
          error: { message: (e as Error)?.message ?? "Failed to add session" },
        },
      });
      return null;
    }
  },

  updateSession: async (id, patch) => {
    try {
      const existing = (() => {
        let found: Session | undefined;
        set((s) => {
          found = s.sessions.find((x) => x.id === id);
          return s; // no-op state update
        });
        return found;
      })();

      if (!existing) throw new Error("Session not found.");

      const next: Session = {
        ...existing,
        ...patch,
        id: existing.id,
        createdAt: existing.createdAt,
        updatedAt: new Date().toISOString(),
      };

      const saved = SessionsService.update(next);

      set((s) => ({
        sessions: sortSessions(
          s.sessions.map((x) => (x.id === id ? saved : x)),
          "date:desc",
        ),
        page: { mode: "results" },
      }));

      return saved;
    } catch (e) {
      set({
        page: {
          mode: "error",
          error: {
            message: (e as Error)?.message ?? "Failed to update session",
          },
        },
      });
      return null;
    }
  },

  deleteSession: async (id) => {
    try {
      SessionsService.remove(id);

      set((s) => {
        const next = s.sessions.filter((x) => x.id !== id);
        return {
          sessions: next,
          page: { mode: next.length ? "results" : "empty" },
        };
      });

      return true;
    } catch (e) {
      set({
        page: {
          mode: "error",
          error: {
            message: (e as Error)?.message ?? "Failed to delete session",
          },
        },
      });
      return false;
    }
  },

  setMode: (mode) =>
    set((s) => ({
      page: { mode, error: mode === "error" ? s.page.error : undefined },
    })),

  setError: (error) =>
    set(() => ({
      page: { mode: error ? "error" : "results", error },
    })),

  reset: () => {
    persistUI({ filters: {}, sortKey: "date:desc" });
    set(() => ({ ...initialState, filters: {}, sortKey: "date:desc" }));
  },
}));
