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

function safeParse<T>(raw: string | null, keyToClear?: string): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    if (keyToClear) safeRemoveItem(keyToClear);
    return null;
  }
}

function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetItem(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore (Safari private mode, quota, blocked storage)
  }
}

function safeRemoveItem(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

type UndoDeleteSession = {
  kind: "delete-session";
  session: Session;
  // selection before delete (so undo restores parity)
  prevSelectedId: string | null;
  // for a stable restore under active sort/filter
  prevSortKey: SessionsSortKey;
  prevFilters: SessionsFilters;
  expiresAt: number; // ms epoch
};

type SessionsState = {
  // UI state
  page: PageState;
  isBootstrapped: boolean;

  // domain
  sessions: Session[];
  filters: SessionsFilters;
  sortKey: SessionsSortKey;

  // selection (Sprint 7)
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  clearSelection: () => void;

  // keyboard nav helpers (Sprint 7)
  moveSelection: (
    orderedIds: string[],
    dir: "next" | "prev" | "first" | "last",
  ) => void;

  // live region (Sprint 7)
  liveMessage: string;
  announce: (msg: string) => void;

  // undo (Sprint 7)
  undo: UndoDeleteSession | null;
  undoDelete: () => Promise<void>;
  canUndo: () => boolean;

  // lifecycle
  loadSessions: () => Promise<void>;

  // CRUD
  addSession: (input: CreateSessionInput) => Promise<Session | null>;
  updateSession: (
    id: string,
    patch: Partial<Omit<Session, "id" | "createdAt">>,
  ) => Promise<Session | null>;
  deleteSession: (id: string) => Promise<boolean>;

  // filters/sort
  setFilters: (patch: Partial<SessionsFilters>) => void;
  clearFilters: () => void;
  setSortKey: (key: SessionsSortKey) => void;

  // actions
  setMode: (mode: PageMode) => void;
  setError: (error: PageError | undefined) => void;

  reset: () => void;
};

// UI-only persistence: view preferences survive refresh, but session data is API-backed.
const persistedUI = safeParse<{
  filters?: SessionsFilters;
  sortKey?: SessionsSortKey;
}>(safeGetItem(SESSIONS_UI_KEY), SESSIONS_UI_KEY);

const initialState: Pick<
  SessionsState,
  | "page"
  | "isBootstrapped"
  | "sessions"
  | "filters"
  | "sortKey"
  | "selectedId"
  | "liveMessage"
  | "undo"
> = {
  page: { mode: "results" },
  isBootstrapped: false,
  sessions: [],
  filters: persistedUI?.filters ?? {},
  sortKey: persistedUI?.sortKey ?? "date:desc",

  selectedId: null,
  liveMessage: "",
  undo: null,
};

function persistUI(next: {
  filters: SessionsFilters;
  sortKey: SessionsSortKey;
}) {
  safeSetItem(SESSIONS_UI_KEY, JSON.stringify(next));
}

// local (module) timer handle — not in zustand state
let undoTimer: ReturnType<typeof setTimeout> | null = null;

function clearUndoTimer() {
  if (undoTimer) {
    clearTimeout(undoTimer);
    undoTimer = null;
  }
}

export const useSessionsStore = create<SessionsState>((set, get) => ({
  ...initialState,

  // ---------- selection ----------
  setSelectedId: (id) =>
    set(() => ({
      selectedId: id,
    })),

  clearSelection: () =>
    set(() => ({
      selectedId: null,
    })),

  moveSelection: (orderedIds, dir) => {
    const { selectedId } = get();
    if (!orderedIds.length) {
      set({ selectedId: null });
      return;
    }

    const idx = selectedId ? orderedIds.indexOf(selectedId) : -1;

    let nextIdx = idx;
    if (dir === "first") nextIdx = 0;
    if (dir === "last") nextIdx = orderedIds.length - 1;

    if (dir === "next") {
      nextIdx = idx === -1 ? 0 : Math.min(idx + 1, orderedIds.length - 1);
    }
    if (dir === "prev") {
      nextIdx = idx === -1 ? 0 : Math.max(idx - 1, 0);
    }

    const nextId = orderedIds[nextIdx] ?? null;
    if (nextId === selectedId) return;

    set({ selectedId: nextId });
    if (nextId) {
      get().announce("Selection changed.");
    }
  },

  // ---------- live region ----------
  // NOTE: many SRs ignore identical strings; add a tiny nonce
  announce: (msg) =>
    set(() => ({
      liveMessage: `${msg} (${Date.now()})`,
    })),

  // ---------- undo ----------
  canUndo: () => {
    const u = get().undo;
    return !!u && Date.now() < u.expiresAt;
  },

  undoDelete: async () => {
    const u = get().undo;
    if (!u) return;

    if (Date.now() >= u.expiresAt) {
      set({ undo: null });
      get().announce("Undo expired.");
      return;
    }

    clearUndoTimer();

    try {
      const restored = await SessionsService.restore(u.session);

      persistUI({ filters: u.prevFilters, sortKey: u.prevSortKey });

      set((s) => {
        const exists = s.sessions.some((x) => x.id === restored.id);
        const merged = exists ? s.sessions : [restored, ...s.sessions];

        const sorted = sortSessions(merged, u.prevSortKey);
        const restoredId = restored.id;
        const nextSelectedId = u.prevSelectedId ?? restoredId;

        return {
          sessions: sorted,
          undo: null,
          selectedId: nextSelectedId,
          sortKey: u.prevSortKey,
          filters: u.prevFilters,
          page: { mode: sorted.length ? "results" : "empty" },
        };
      });

      get().announce("Undo complete. Session restored.");
    } catch (e) {
      set({
        undo: null,
        page: {
          mode: "error",
          error: {
            message: (e as Error)?.message ?? "Failed to restore session",
          },
        },
      });
    }
  },

  // ---------- filters/sort ----------
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
      return {
        sortKey: key,
        sessions: sortSessions(s.sessions, key),
      };
    }),

  // ---------- lifecycle ----------
  loadSessions: async () => {
    try {
      set({ page: { mode: "loading" } });

      const listed = await SessionsService.list();
      const sorted = sortSessions(listed, get().sortKey);

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

  // ---------- CRUD ----------
  addSession: async (input) => {
    try {
      const created = await SessionsService.create(input);

      set((s) => ({
        sessions: sortSessions([created, ...s.sessions], s.sortKey),
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
      const saved = await SessionsService.update(id, patch);

      set((s) => ({
        sessions: sortSessions(
          s.sessions.map((x) => (x.id === id ? saved : x)),
          s.sortKey,
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
      const snapshot = get().sessions.find((x) => x.id === id);
      if (!snapshot) return true; // already gone

      clearUndoTimer();
      set({ undo: null });

      await SessionsService.remove(id);

      const prevSelectedId = get().selectedId;
      const prevSortKey = get().sortKey;
      const prevFilters = get().filters;

      // Remove from store after successful API delete
      set((s) => {
        const next = s.sessions.filter((x) => x.id !== id);
        const nextSorted = sortSessions(next, s.sortKey);
        const nextSelected = s.selectedId === id ? null : s.selectedId;

        return {
          sessions: nextSorted,
          selectedId: nextSelected,
          page: { mode: nextSorted.length ? "results" : "empty" },
          undo: {
            kind: "delete-session",
            session: snapshot,
            prevSelectedId,
            prevSortKey,
            prevFilters,
            expiresAt: Date.now() + 6000,
          },
        };
      });

      get().announce("Session deleted. Undo available for 6 seconds.");

      // Auto-expire undo
      undoTimer = setTimeout(() => {
        const u = get().undo;
        if (!u) return;
        if (Date.now() >= u.expiresAt) {
          set({ undo: null });
          get().announce("Undo expired.");
        }
        undoTimer = null;
      }, 6100);

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

  // ---------- actions ----------
  setMode: (mode) =>
    set((s) => ({
      page: { mode, error: mode === "error" ? s.page.error : undefined },
    })),

  setError: (error) =>
    set(() => ({
      page: { mode: error ? "error" : "results", error },
    })),

  reset: () => {
    clearUndoTimer();
    persistUI({ filters: {}, sortKey: "date:desc" });
    set(() => ({
      ...initialState,
      filters: {},
      sortKey: "date:desc",
      undo: null,
      selectedId: null,
      liveMessage: "",
    }));
  },
}));
