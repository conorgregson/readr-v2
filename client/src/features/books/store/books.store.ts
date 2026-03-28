import { create } from "zustand";
import type { PageState, PageError } from "../../../shared/types/ui-state";

import type { Book, BookId, BooksFilters } from "../types";
import { defaultBooksFilters } from "../types";
import { applyFilters } from "../filters";

import { BooksService } from "../services/books.service";
import { smartSearch } from "../search/search.engine";

const UNDO_MS = 6000;

type UndoRecord =
  | {
      createdAtMs: number;
      expiresAtMs: number;
      label: string;
      before: Book[];
      meta: { kind: "delete"; bookId: BookId };
    }
  | {
      createdAtMs: number;
      expiresAtMs: number;
      label: string;
      before: Book[];
      meta: {
        kind: "bulk-delete";
        affectedIds: BookId[];
      };
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

function normalizeSelectedIds(ids: BookId[]): BookId[] {
  return [...new Set(ids)];
}

type BooksState = {
  isBootstrapped: boolean;
  isLoading: boolean;

  addBook: (
    input: Omit<Book, "id" | "createdAt" | "updatedAt">,
  ) => Promise<Book | null>;
  updateBook: (
    id: BookId,
    patch: Partial<Omit<Book, "id" | "createdAt">>,
  ) => Promise<Book | null>;
  deleteBook: (id: BookId) => Promise<boolean>;
  finishBook: (id: BookId) => Promise<Book | null>;

  bulkUpdateSelectedBooks: (patch: {
    status?: Book["status"];
  }) => Promise<boolean>;
  bulkDeleteSelectedBooks: () => Promise<boolean>;

  loadBooks: () => Promise<void>;

  page: PageState;
  setError: (error: PageError | undefined) => void;

  books: Book[];

  undo: UndoRecord | null;
  undoLast: () => Promise<boolean>;
  clearUndo: () => void;

  filters: BooksFilters;
  searchQuery: string;
  highlightQuery: string;
  searchFuzzyOverride: number | null;

  selectedIds: BookId[];
  isSelected: (id: BookId) => boolean;
  toggleSelected: (id: BookId) => void;
  selectBook: (id: BookId) => void;
  deselectBook: (id: BookId) => void;
  clearSelection: () => void;
  selectAllVisible: () => void;
  selectedCount: () => number;

  setSearchQuery: (q: string) => void;
  setHighlightQuery: (q: string) => void;
  enableLooserSearch: () => void;

  setFilters: (next: Partial<BooksFilters>) => void;
  clearFilters: () => void;

  visibleBooks: () => Book[];

  reset: () => void;
};

type VisibleSearchResult = { ref: Book; score: number };

let undoTimer: number | null = null;
let pendingDeleteBookId: BookId | null = null;
let pendingBulkDeleteIds: BookId[] | null = null;

function clearUndoTimer() {
  if (undoTimer !== null) {
    window.clearTimeout(undoTimer);
    undoTimer = null;
  }
  pendingDeleteBookId = null;
  pendingBulkDeleteIds = null;
}

const initialState: Pick<
  BooksState,
  | "page"
  | "isBootstrapped"
  | "isLoading"
  | "books"
  | "filters"
  | "searchQuery"
  | "highlightQuery"
  | "searchFuzzyOverride"
  | "undo"
  | "selectedIds"
> = {
  page: { mode: "results" },
  isBootstrapped: false,
  isLoading: false,
  books: [],
  filters: defaultBooksFilters(),
  searchQuery: "",
  highlightQuery: "",
  searchFuzzyOverride: null,
  undo: null,
  selectedIds: [],
};

export const useBooksStore = create<BooksState>((set, get) => ({
  ...initialState,

  addBook: async (input) => {
    try {
      const clean = normalizeCreateInput(input);
      const created = await BooksService.create(clean);

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

      set((s) => ({
        books: s.books.map((b) => (b.id === id ? saved : b)),
      }));

      return saved;
    } catch (e) {
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

    clearUndoTimer();

    const nowMS = Date.now();
    const rec: UndoRecord = {
      createdAtMs: nowMS,
      expiresAtMs: nowMS + UNDO_MS,
      label: "Book deleted",
      before,
      meta: { bookId: id, kind: "delete" },
    };

    set((s) => ({
      books: next,
      undo: rec,
      page: { mode: "results" },
      selectedIds: s.selectedIds.filter((selectedId) => selectedId !== id),
    }));

    pendingDeleteBookId = id;

    undoTimer = window.setTimeout(async () => {
      const cur = get().undo;
      const deleteId = pendingDeleteBookId;

      if (
        cur &&
        deleteId &&
        cur.meta.kind === "delete" &&
        cur.meta.bookId === deleteId &&
        Date.now() > cur.expiresAtMs
      ) {
        try {
          await BooksService.remove(deleteId);
          set({ undo: null });
        } catch (e) {
          set({
            books: cur.before,
            undo: null,
            page: {
              mode: "error",
              error: {
                message: (e as Error)?.message ?? "Failed to delete book",
              },
            },
          });
        }
      }

      undoTimer = null;
      pendingDeleteBookId = null;
    }, UNDO_MS + 50);

    return true;
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

    set({ books: next, page: { mode: "results" } });

    try {
      const saved = await BooksService.update(id, {
        status: "finished",
        ...(prev.finishedAt ? {} : { finishedAt: nowIso }),
      });

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

  bulkUpdateSelectedBooks: async (patch) => {
    const ids = normalizeSelectedIds(get().selectedIds);
    if (ids.length === 0) return false;

    const before = get().books;
    const nowIso = new Date().toISOString();

    const optimisticBooks = before.map((book) => {
      if (!ids.includes(book.id)) return book;

      const nextStatus = patch.status ?? book.status;
      const statusChanged = nextStatus !== book.status;

      const startedAt =
        statusChanged && nextStatus === "reading" && !book.startedAt
          ? nowIso
          : nextStatus === "planned"
            ? undefined
            : book.startedAt;

      const finishedAt =
        nextStatus === "planned"
          ? undefined
          : statusChanged && nextStatus === "finished" && !book.finishedAt
            ? nowIso
            : nextStatus === "reading"
              ? undefined
              : book.finishedAt;

      return {
        ...book,
        ...patch,
        updatedAt: nowIso,
        startedAt,
        finishedAt,
      };
    });

    set({
      books: optimisticBooks,
      page: { mode: "results" },
    });

    try {
      await BooksService.bulkUpdate({
        ids,
        patch,
      });

      const refreshedBooks = await BooksService.list();

      set({
        books: refreshedBooks,
        selectedIds: [],
        undo: null,
        page: { mode: "results" },
      });

      return true;
    } catch (e) {
      set({
        books: before,
        page: {
          mode: "error",
          error: {
            message: (e as Error)?.message ?? "Failed to bulk update books",
          },
        },
      });
      return false;
    }
  },

  bulkDeleteSelectedBooks: async () => {
    const ids = normalizeSelectedIds(get().selectedIds);
    if (ids.length === 0) return false;

    const before = get().books;
    const remaining = before.filter((book) => !ids.includes(book.id));

    clearUndoTimer();

    const nowMS = Date.now();
    const rec: UndoRecord = {
      createdAtMs: nowMS,
      expiresAtMs: nowMS + UNDO_MS,
      label:
        ids.length === 1 ? "1 book deleted" : `${ids.length} books deleted`,
      before,
      meta: {
        kind: "bulk-delete",
        affectedIds: ids,
      },
    };

    set({
      books: remaining,
      undo: rec,
      selectedIds: [],
      page: { mode: "results" },
    });

    pendingBulkDeleteIds = ids;

    undoTimer = window.setTimeout(async () => {
      const cur = get().undo;
      const deleteIds = pendingBulkDeleteIds;

      if (
        cur &&
        deleteIds &&
        cur.meta.kind === "bulk-delete" &&
        cur.meta.affectedIds.length === deleteIds.length &&
        cur.meta.affectedIds.every((id, index) => id === deleteIds[index]) &&
        Date.now() > cur.expiresAtMs
      ) {
        try {
          await BooksService.bulkRemove({ ids: deleteIds });
          set({ undo: null });
        } catch (e) {
          set({
            books: cur.before,
            undo: null,
            page: {
              mode: "error",
              error: {
                message: (e as Error)?.message ?? "Failed to bulk delete books",
              },
            },
          });
        }
      }

      undoTimer = null;
      pendingBulkDeleteIds = null;
    }, UNDO_MS + 50);

    return true;
  },

  clearUndo: () => {
    clearUndoTimer();
    set({ undo: null });
  },

  undoLast: async () => {
    const rec = get().undo;
    if (!rec) return false;

    if (Date.now() > rec.expiresAtMs) {
      clearUndoTimer();
      set({ undo: null });
      return false;
    }

    clearUndoTimer();

    set({
      undo: null,
      page: { mode: "results" },
      books: rec.before,
      selectedIds: [],
    });

    return true;
  },

  loadBooks: async () => {
    try {
      set({
        isLoading: true,
        page: { mode: "loading" },
      });

      const books = await BooksService.list();

      set({
        books,
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
          error: { message: (e as Error)?.message ?? "Failed to load books" },
        },
      });
    }
  },

  setError: (error) =>
    set(() => ({
      page: { mode: error ? "error" : "results", error },
    })),

  isSelected: (id) => get().selectedIds.includes(id),

  toggleSelected: (id) =>
    set((s) => ({
      selectedIds: s.selectedIds.includes(id)
        ? s.selectedIds.filter((selectedId) => selectedId !== id)
        : [...s.selectedIds, id],
    })),

  selectBook: (id) =>
    set((s) => ({
      selectedIds: s.selectedIds.includes(id)
        ? s.selectedIds
        : [...s.selectedIds, id],
    })),

  deselectBook: (id) =>
    set((s) => ({
      selectedIds: s.selectedIds.filter((selectedId) => selectedId !== id),
    })),

  clearSelection: () => set({ selectedIds: [] }),

  selectAllVisible: () =>
    set(() => ({
      selectedIds: get()
        .visibleBooks()
        .map((book) => book.id),
    })),

  selectedCount: () => get().selectedIds.length,

  setSearchQuery: (q) =>
    set(() => ({
      searchQuery: q,
      searchFuzzyOverride: null,
    })),

  setHighlightQuery: (q) =>
    set(() => ({
      highlightQuery: q,
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

    const base = applyFilters(books, filters);

    const q = searchQuery.trim();
    if (!q) return base;

    const results = smartSearch(base, q, {
      fuzzyMaxDistance: searchFuzzyOverride ?? undefined,
      limit: 500,
    }) as VisibleSearchResult[];

    return results.map((r) => r.ref);
  },

  reset: () => {
    clearUndoTimer();
    set(() => ({ ...initialState }));
  },
}));
