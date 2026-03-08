import { create } from "zustand";
import type { PageState, PageError } from "../../../shared/types/ui-state";

import type { Book, BookId, BooksFilters } from "../types";
import { defaultBooksFilters } from "../types";
import { applyFilters } from "../filters";

import { BooksService } from "../services/books.service";
import { smartSearch } from "../search/search.engine";

const UNDO_MS = 6000;

type UndoRecord = {
  createdAtMs: number;
  expiresAtMs: number;
  label: string;
  before: Book[]; // full snapshot for perfect restore
  meta?: { bookId: BookId; kind: "delete" | "finish" };
};

function reqTrim(label: string, value: unknown): string {
  const s = typeof value === "string" ? value.trim() : "";
  if (!s) throw new Error(`${label} is required`);
  return s;
}

type CreateBookInput = Omit<Book, "id" | "createdAt" | "updatedAt">;

function normalizeCreateInput(
  input: CreateBookInput,
): Omit<Book, "id" | "createdAt" | "updatedAt"> {
  return {
    ...input,
    title: reqTrim("Title", input.title),
    author: reqTrim("Author", input.author),
    genre: input.genre?.trim() || undefined,
    series: input.series?.trim() || undefined,
    isbn: input.isbn?.trim() || undefined,
    plannedMonth: input.plannedMonth?.trim() || undefined,
  };
}

type BooksState = {
  isBootstrapped: boolean;

  addBook: (
    input: Omit<Book, "id" | "createdAt" | "updatedAt">,
  ) => Promise<Book | null>;
  updateBook: (
    id: BookId,
    patch: Partial<Omit<Book, "id" | "createdAt">>,
  ) => Promise<Book | null>;
  deleteBook: (id: BookId) => Promise<boolean>;
  finishBook: (id: BookId) => Promise<Book | null>;

  loadBooks: () => Promise<void>;

  page: PageState;
  setError: (error: PageError | undefined) => void;

  // domain
  books: Book[];

  // undo (Sprint 5)
  undo: UndoRecord | null;
  undoLast: () => Promise<boolean>;
  clearUndo: () => void;

  // controls
  filters: BooksFilters;
  searchQuery: string;

  // v1.9-style fuzzy override (null = default; 2 = loosen once)
  searchFuzzyOverride: number | null;

  // actions
  setSearchQuery: (q: string) => void;
  enableLooserSearch: () => void;

  setFilters: (next: Partial<BooksFilters>) => void;
  clearFilters: () => void;

  // derived
  visibleBooks: () => Book[];

  reset: () => void;
};

type SearchResult = Book | { ref: Book };

let undoTimer: number | null = null;

function clearUndoTimer() {
  if (undoTimer !== null) {
    window.clearTimeout(undoTimer);
    undoTimer = null;
  }
}

const initialState: Pick<
  BooksState,
  | "page"
  | "isBootstrapped"
  | "books"
  | "filters"
  | "searchQuery"
  | "searchFuzzyOverride"
  | "undo"
> = {
  page: { mode: "results" },
  isBootstrapped: false,

  // Sprint 4: load from BooksService (local-first)
  books: [],

  filters: defaultBooksFilters(),
  searchQuery: "",
  searchFuzzyOverride: null,
  undo: null,
};

export const useBooksStore = create<BooksState>((set, get) => ({
  ...initialState,

  addBook: async (input) => {
    try {
      const clean = normalizeCreateInput(input);
      const created = await BooksService.create(clean);

      // Keep UI stable: insert new book at top
      set((s) => ({ books: [created, ...s.books], page: { mode: "results" } }));
      return created;
    } catch (e) {
      set({
        page: {
          mode: "error",
          error: { message: (e as Error)?.message ?? "Failed to add book" },
        },
      });
      return null;
    }
  },

  updateBook: async (id, patch) => {
    const before = get().books;
    const idx = before.findIndex((b) => b.id === id);
    if (idx === -1) return null;

    // Create optimistic merged draft and validate required fields
    const merged = {
      ...before[idx],
      ...patch,
    };

    try {
      const title = reqTrim("Title", merged.title);
      const author = reqTrim("Author", merged.author);

      const prev = before[idx];
      const nextStatus = (merged.status ?? prev.status) as Book["status"];
      const now = new Date().toISOString();

      const statusChanged = nextStatus !== prev.status;

      const startedAt =
        statusChanged && nextStatus === "reading" && !prev.startedAt
          ? now
          : prev.startedAt;

      const finishedAt =
        statusChanged && nextStatus === "finished" && !prev.finishedAt
          ? now
          : prev.finishedAt;

      const persistPatch = {
        ...patch,
        // only include these when needed
        ...(startedAt && prev.startedAt !== startedAt ? { startedAt } : {}),
        ...(finishedAt && prev.finishedAt !== finishedAt ? { finishedAt } : {}),
      };

      const optimistic: Book = {
        ...merged,
        title,
        author,
        genre: merged.genre?.trim() || undefined,
        series: merged.series?.trim() || undefined,
        isbn: merged.isbn?.trim() || undefined,
        plannedMonth: merged.plannedMonth?.trim() || undefined,
        updatedAt: now,
        startedAt,
        finishedAt,
      };

      const next = [...before];
      next[idx] = optimistic;
      set({ books: next, page: { mode: "results" } });

      const saved = await BooksService.update(id, persistPatch);
      if (!saved) throw new Error("Book not found");

      // Sync store to persisted record
      set((s) => ({
        books: s.books.map((b) => (b.id === id ? saved : b)),
      }));

      return saved;
    } catch (e) {
      // rollback
      set({
        books: before,
        page: {
          mode: "error",
          error: { message: (e as Error)?.message ?? "Failed to update book" },
        },
      });
      return null;
    }
  },

  deleteBook: async (id) => {
    const before = get().books;
    const next = before.filter((b) => b.id !== id);
    if (next.length === before.length) return false;

    // overwrite any previous undo
    clearUndoTimer();

    const nowMS = Date.now();
    const rec: UndoRecord = {
      createdAtMs: nowMS,
      expiresAtMs: nowMS + UNDO_MS,
      label: "Book deleted",
      before,
      meta: { bookId: id, kind: "delete" },
    };

    // optimistic UI update + set undo slot
    set({ books: next, undo: rec, page: { mode: "results" } });

    // start expiration timer (just clears the slot)
    undoTimer = window.setTimeout(() => {
      // only clear if it's still the same record and now expired
      const cur = get().undo;
      if (cur && Date.now() > cur.expiresAtMs) {
        set({ undo: null });
      }
      undoTimer = null;
    }, UNDO_MS + 50);

    try {
      const ok = await BooksService.remove(id);
      if (!ok) throw new Error("Delete failed");
      return true;
    } catch (e) {
      // rollback UI + clear undo (since delete didn't happen)
      clearUndoTimer();
      set({
        books: before,
        undo: null,
        page: {
          mode: "error",
          error: { message: (e as Error)?.message ?? "Failed to delete book" },
        },
      });
      return false;
    }
  },

  finishBook: async (id) => {
    const before = get().books;
    const idx = before.findIndex((b) => b.id === id);
    if (idx === -1) return null;

    const prev = before[idx];
    if (prev.status === "finished") return prev;

    clearUndoTimer();

    const nowIso = new Date().toISOString();

    const finished: Book = {
      ...prev,
      status: "finished",
      updatedAt: nowIso,
      finishedAt: prev.finishedAt ?? nowIso,
    };

    const next = [...before];
    next[idx] = finished;

    const nowMS = Date.now();
    const rec: UndoRecord = {
      createdAtMs: nowMS,
      expiresAtMs: nowMS + UNDO_MS,
      label: `Mark Finished ${prev.title}`,
      before,
      meta: { bookId: id, kind: "finish" },
    };

    set({ books: next, undo: rec, page: { mode: "results" } });

    undoTimer = window.setTimeout(() => {
      const cur = get().undo;
      if (cur && Date.now() > cur.expiresAtMs) {
        set({ undo: null });
      }
      undoTimer = null;
    }, UNDO_MS + 50);

    try {
      const saved = await BooksService.update(id, {
        status: "finished",
        ...(prev.finishedAt ? {} : { finishedAt: nowIso }),
      });

      if (!saved) throw new Error("Book not found");

      set((s) => ({
        books: s.books.map((b) => (b.id === id ? saved : b)),
      }));

      return saved;
    } catch (e) {
      clearUndoTimer();
      set({
        books: before,
        undo: null,
        page: {
          mode: "error",
          error: {
            message: (e as Error)?.message ?? "Failed to mark book as finished",
          },
        },
      });
      return null;
    }
  },

  clearUndo: () => {
    clearUndoTimer();
    set({ undo: null });
  },

  undoLast: async () => {
    const rec = get().undo;
    if (!rec) return false;

    // expired guard
    if (Date.now() > rec.expiresAtMs) {
      clearUndoTimer();
      set({ undo: null });
      return false;
    }

    // One-shot: clear undo immediately to avoid double-click races
    clearUndoTimer();
    set({ undo: null, page: { mode: "results" }, books: rec.before });

    try {
      // Persist exact snapshot (atomic restore)
      await BooksService.replaceAll(rec.before);
      return true;
    } catch (e) {
      set({
        page: {
          mode: "error",
          error: { message: (e as Error)?.message ?? "Failed to undo" },
        },
      });
      return false;
    }
  },

  loadBooks: async () => {
    try {
      set({ page: { mode: "loading" } });

      const books = await BooksService.list();

      set({
        books,
        isBootstrapped: true,
        page: { mode: "results" },
      });
    } catch (e) {
      set({
        isBootstrapped: true,
        page: {
          mode: "error",
          error: { message: (e as Error)?.message ?? "Failed to load books" },
        },
      });
    }
  },

  setError: (error) =>
    set(() => ({
      page: { mode: error ? "error" : "results", error },
    })),

  setSearchQuery: (q) =>
    set(() => ({
      searchQuery: q,
      // v1.9 parity: typing resets loosened override
      searchFuzzyOverride: null,
    })),

  enableLooserSearch: () => set(() => ({ searchFuzzyOverride: 2 })),

  setFilters: (next) =>
    set((s) => ({
      filters: { ...s.filters, ...next },
      searchFuzzyOverride: null,
    })),

  clearFilters: () =>
    set(() => ({
      filters: defaultBooksFilters(),
      searchFuzzyOverride: null,
    })),

  visibleBooks: () => {
    const { books, filters, searchQuery, searchFuzzyOverride } = get();

    // 1) facets first
    const base = applyFilters(books, filters);

    // 2) then search
    const q = searchQuery.trim();
    if (!q) return base;

    const results = smartSearch(base, q, {
      fuzzyMaxDistance: searchFuzzyOverride ?? undefined,
      limit: 500,
    }) as SearchResult[];

    return results.map((r) => ("ref" in r ? r.ref : r));
  },

  reset: () => set(() => ({ ...initialState })),
}));
