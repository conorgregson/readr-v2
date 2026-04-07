import { create } from "zustand";
import type { PageState, PageError } from "../../../shared/types/ui-state";

import type { Book, BookId, BooksFilters } from "../types";
import { defaultBooksFilters } from "../types";
import { applyFilters } from "../filters";

import { BooksService } from "../services/books.service";
import { smartSearch } from "../search/search.engine";
import { SavedViewsService } from "../services/saved-views.service";
import type {
  CreateSavedViewRequest,
  SavedLibraryView,
  SavedLibraryViewFilters,
  SavedLibraryViewSort,
  UpdateSavedViewRequest,
} from "../../../../../shared/types/v2.4";

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
    }
  | {
      createdAtMs: number;
      expiresAtMs: number;
      label: string;
      before: Book[];
      meta: {
        kind: "bulk-update";
        affectedIds: BookId[];
        restoreStatuses: Array<{
          id: BookId;
          status: Book["status"];
        }>;
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

function uniqueTrimmed(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function compareText(a: string | undefined, b: string | undefined): number {
  return (a ?? "").localeCompare(b ?? "", undefined, { sensitivity: "base" });
}

function compareDate(a: string | undefined, b: string | undefined): number {
  const at = a ? new Date(a).getTime() : 0;
  const bt = b ? new Date(b).getTime() : 0;
  return at - bt;
}

function sortBooks(books: Book[], sort: SavedLibraryViewSort): Book[] {
  const sorted = [...books];

  sorted.sort((a, b) => {
    let result = 0;

    switch (sort.key) {
      case "title":
        result = compareText(a.title, b.title);
        break;
      case "author":
        result = compareText(a.author, b.author);
        break;
      case "createdAt":
        result = compareDate(a.createdAt, b.createdAt);
        break;
      case "updatedAt":
        result = compareDate(a.updatedAt, b.updatedAt);
        break;
      case "finishedAt":
        result = compareDate(a.finishedAt, b.finishedAt);
        break;
      default:
        result = 0;
    }

    if (result === 0) {
      result = compareDate(a.createdAt, b.createdAt);
    }

    return sort.direction === "asc" ? result : -result;
  });

  return sorted;
}

function toSavedViewFilters(
  filters: BooksFilters,
  searchQuery: string,
): SavedLibraryViewFilters {
  const out: SavedLibraryViewFilters = {};

  if (filters.status.length > 0) out.status = [...filters.status];
  if (filters.authors.length > 0) out.authors = uniqueTrimmed(filters.authors);
  if (filters.genres.length > 0) out.genres = uniqueTrimmed(filters.genres);
  if (filters.series.length > 0) out.series = uniqueTrimmed(filters.series);
  if (filters.tbrOnly) out.tbrOnly = true;
  if (filters.tbrMonth.trim()) out.tbrMonth = filters.tbrMonth.trim();

  const q = searchQuery.trim();
  if (q) out.search = q;

  return out;
}

function toBooksFilters(filters?: SavedLibraryViewFilters): BooksFilters {
  return {
    status: filters?.status ? [...filters.status] : [],
    authors: filters?.authors ? [...filters.authors] : [],
    genres: filters?.genres ? [...filters.genres] : [],
    series: filters?.series ? [...filters.series] : [],
    tbrOnly: filters?.tbrOnly ?? false,
    tbrMonth: filters?.tbrMonth ?? "",
  };
}

function savedviewMatchesCurrentState(
  view: SavedLibraryView,
  state: {
    filters: BooksFilters;
    searchQuery: string;
    highlightQuery: string;
    sort: SavedLibraryViewSort;
  },
): boolean {
  const committedQuery =
    state.highlightQuery.trim() || state.searchQuery.trim();

  const currentFilters = toSavedViewFilters(state.filters, committedQuery);

  const sameArray = (a?: string[], b?: string[]) => {
    const aa = a ?? [];
    const bb = b ?? [];
    return (
      aa.length === bb.length && aa.every((value, index) => value === bb[index])
    );
  };

  return (
    sameArray(currentFilters.status, view.filters.status) &&
    sameArray(currentFilters.authors, view.filters.authors) &&
    sameArray(currentFilters.genres, view.filters.genres) &&
    sameArray(currentFilters.series, view.filters.series) &&
    (currentFilters.tbrOnly ?? false) === (view.filters.tbrOnly ?? false) &&
    (currentFilters.tbrMonth ?? "") === (view.filters.tbrMonth ?? "") &&
    (currentFilters.search ?? "") === (view.filters.search ?? "") &&
    state.sort.key === view.sort.key &&
    state.sort.direction === view.sort.direction
  );
}

function clearActiveViewIfDirty(state: {
  savedViews: SavedLibraryView[];
  activeViewId: string | null;
  filters: BooksFilters;
  searchQuery: string;
  highlightQuery: string;
  sort: SavedLibraryViewSort;
}): string | null {
  if (!state.activeViewId) return null;

  const activeView = state.savedViews.find(
    (view) => view.id === state.activeViewId,
  );
  if (!activeView) return null;

  return savedviewMatchesCurrentState(activeView, state)
    ? state.activeViewId
    : null;
}

export type BooksState = {
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

  sort: SavedLibraryViewSort;
  setSort: (sort: SavedLibraryViewSort) => void;

  savedViews: SavedLibraryView[];
  savedViewsLoaded: boolean;
  activeViewId: string | null;

  loadSavedViews: () => Promise<void>;
  createSavedView: (
    input: CreateSavedViewRequest,
  ) => Promise<SavedLibraryView | null>;
  saveCurrentView: (input: {
    name: string;
    isPinned?: boolean;
    isDefault?: boolean;
  }) => Promise<SavedLibraryView | null>;
  updateSavedView: (
    id: string,
    patch: UpdateSavedViewRequest,
  ) => Promise<SavedLibraryView | null>;
  deleteSavedView: (id: string) => Promise<boolean>;
  applySavedView: (id: string) => boolean;
  clearActiveView: () => void;
  captureCurrentViewPayload: (input: {
    name: string;
    isPinned?: boolean;
    isDefault?: boolean;
  }) => CreateSavedViewRequest;

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

const defaultSort = (): SavedLibraryViewSort => ({
  key: "createdAt",
  direction: "desc",
});

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
  | "sort"
  | "savedViews"
  | "savedViewsLoaded"
  | "activeViewId"
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
  sort: defaultSort(),
  savedViews: [],
  savedViewsLoaded: false,
  activeViewId: null,
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

    const restoreStatuses = before
      .filter((book) => ids.includes(book.id))
      .map((book) => ({
        id: book.id,
        status: book.status,
      }));

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

      clearUndoTimer();

      const nowMS = Date.now();
      const rec: UndoRecord = {
        createdAtMs: nowMS,
        expiresAtMs: nowMS + UNDO_MS,
        label:
          ids.length === 1 ? "1 book updated" : `${ids.length} books updated`,
        before,
        meta: {
          kind: "bulk-update",
          affectedIds: ids,
          restoreStatuses,
        },
      };

      set({
        books: refreshedBooks,
        selectedIds: [],
        undo: rec,
        page: { mode: "results" },
      });

      undoTimer = window.setTimeout(() => {
        const cur = get().undo;

        if (
          cur &&
          cur.meta.kind === "bulk-update" &&
          Date.now() > cur.expiresAtMs
        ) {
          set({ undo: null });
        }

        undoTimer = null;
      }, UNDO_MS + 50);

      return true;
    } catch (e) {
      clearUndoTimer();

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

  loadSavedViews: async () => {
    try {
      const savedViews = await SavedViewsService.list();

      set((s) => {
        let nextFilters = s.filters;
        let nextSearchQuery = s.searchQuery;
        let nextHighlightQuery = s.highlightQuery;
        let nextSort = s.sort;
        let nextActiveViewId = s.activeViewId;

        if (!s.activeViewId) {
          const defaultView = savedViews.find((view) => view.isDefault);
          if (defaultView) {
            nextFilters = toBooksFilters(defaultView.filters);
            nextSearchQuery = defaultView.filters.search ?? "";
            nextHighlightQuery = defaultView.filters.search ?? "";
            nextSort = defaultView.sort;
            nextActiveViewId = defaultView.id;
          }
        } else {
          const activeExists = savedViews.some(
            (view) => view.id === s.activeViewId,
          );
          if (!activeExists) {
            nextActiveViewId = null;
          }
        }

        return {
          savedViews,
          savedViewsLoaded: true,
          filters: nextFilters,
          searchQuery: nextSearchQuery,
          highlightQuery: nextHighlightQuery,
          sort: nextSort,
          activeViewId: nextActiveViewId,
          searchFuzzyOverride: null,
        };
      });
    } catch (e) {
      set({
        savedViewsLoaded: true,
        page: {
          mode: "error",
          error: {
            message: (e as Error)?.message ?? "Failed to load saved views",
          },
        },
      });
    }
  },

  createSavedView: async (input) => {
    try {
      const created = await SavedViewsService.create(input);

      set((s) => ({
        savedViews: [
          created,
          ...s.savedViews.filter((view) => view.id !== created.id),
        ],
        activeViewId: created.id,
        page: { mode: "results" },
      }));

      if (created.isDefault) {
        set((s) => ({
          savedViews: s.savedViews.map((view) =>
            view.id === created.id ? created : { ...view, isDefault: false },
          ),
        }));
      }

      return created;
    } catch (e) {
      set({
        page: {
          mode: "error",
          error: {
            message: (e as Error)?.message ?? "Failed to create saved view",
          },
        },
      });
      return null;
    }
  },

  saveCurrentView: async ({ name, isPinned, isDefault }) => {
    const payload = get().captureCurrentViewPayload({
      name,
      isPinned,
      isDefault,
    });
    return get().createSavedView(payload);
  },

  updateSavedView: async (id, patch) => {
    try {
      const updated = await SavedViewsService.update(id, patch);

      set((s) => ({
        savedViews: s.savedViews.map((view) =>
          view.id === updated.id
            ? updated
            : updated.isDefault
              ? { ...view, isDefault: false }
              : view,
        ),
        page: { mode: "results" },
      }));

      if (get().activeViewId === updated.id) {
        set({
          filters: toBooksFilters(updated.filters),
          searchQuery: updated.filters.search ?? "",
          highlightQuery: updated.filters.search ?? "",
          sort: updated.sort,
          searchFuzzyOverride: null,
        });
      }

      return updated;
    } catch (e) {
      set({
        page: {
          mode: "error",
          error: {
            message: (e as Error)?.message ?? "Failed to update saved view",
          },
        },
      });
      return null;
    }
  },

  deleteSavedView: async (id) => {
    try {
      await SavedViewsService.remove(id);

      set((s) => ({
        savedViews: s.savedViews.filter((view) => view.id !== id),
        activeViewId: s.activeViewId === id ? null : s.activeViewId,
        page: { mode: "results" },
      }));

      return true;
    } catch (e) {
      set({
        page: {
          mode: "error",
          error: {
            message: (e as Error)?.message ?? "Failed to delete saved view",
          },
        },
      });
      return false;
    }
  },

  applySavedView: (id) => {
    const view = get().savedViews.find((item) => item.id === id);
    if (!view) return false;

    set({
      filters: toBooksFilters(view.filters),
      searchQuery: view.filters.search ?? "",
      highlightQuery: view.filters.search ?? "",
      sort: view.sort,
      activeViewId: view.id,
      searchFuzzyOverride: null,
      selectedIds: [],
      page: { mode: "results" },
    });

    return true;
  },

  clearActiveView: () =>
    set({
      activeViewId: null,
    }),

  captureCurrentViewPayload: ({ name, isPinned, isDefault }) => {
    const state = get();
    const committedQuery =
      state.highlightQuery.trim() || state.searchQuery.trim();

    return {
      name: reqTrim("Name", name),
      filters: toSavedViewFilters(state.filters, committedQuery),
      sort: state.sort,
      ...(isPinned !== undefined ? { isPinned } : {}),
      ...(isDefault !== undefined ? { isDefault } : {}),
    };
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

    if (rec.meta.kind === "bulk-update") {
      set({
        books: rec.before,
        undo: null,
        selectedIds: [],
        page: { mode: "results" },
      });

      try {
        await Promise.all(
          rec.meta.restoreStatuses.map(({ id, status }) =>
            BooksService.update(id, { status }),
          ),
        );

        const refreshedBooks = await BooksService.list();

        set({
          books: refreshedBooks,
          selectedIds: [],
          undo: null,
          page: { mode: "results" },
        });

        return true;
      } catch (e) {
        try {
          const serverBooks = await BooksService.list();
          set({
            books: serverBooks,
            selectedIds: [],
            undo: null,
            page: {
              mode: "error",
              error: {
                message:
                  (e as Error)?.message ?? "Failed to restore bulk update",
              },
            },
          });
        } catch {
          set({
            selectedIds: [],
            undo: null,
            page: {
              mode: "error",
              error: {
                message:
                  (e as Error)?.message ?? "Failed to restore bulk update",
              },
            },
          });
        }

        return false;
      }
    }

    set({
      undo: null,
      page: { mode: "results" },
      books: rec.before,
      selectedIds: [],
    });

    return true;
  },

  setError: (error) =>
    set(() => ({
      page: { mode: error ? "error" : "results", error },
    })),

  setSort: (sort) =>
    set((s) => ({
      sort,
      activeViewId: clearActiveViewIfDirty({
        savedViews: s.savedViews,
        activeViewId: s.activeViewId,
        filters: s.filters,
        searchQuery: s.searchQuery,
        highlightQuery: s.highlightQuery,
        sort,
      }),
      searchFuzzyOverride: null,
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
    set((s) => ({
      searchQuery: q,
      activeViewId: clearActiveViewIfDirty({
        savedViews: s.savedViews,
        activeViewId: s.activeViewId,
        filters: s.filters,
        searchQuery: q,
        highlightQuery: s.highlightQuery,
        sort: s.sort,
      }),
      searchFuzzyOverride: null,
    })),

  setHighlightQuery: (q) =>
    set((s) => ({
      highlightQuery: q,
      activeViewId: clearActiveViewIfDirty({
        savedViews: s.savedViews,
        activeViewId: s.activeViewId,
        filters: s.filters,
        searchQuery: s.searchQuery,
        highlightQuery: q,
        sort: s.sort,
      }),
    })),

  enableLooserSearch: () => set(() => ({ searchFuzzyOverride: 2 })),

  setFilters: (next) =>
    set((s) => {
      const filters = { ...s.filters, ...next };

      return {
        filters,
        activeViewId: clearActiveViewIfDirty({
          savedViews: s.savedViews,
          activeViewId: s.activeViewId,
          filters,
          searchQuery: s.searchQuery,
          highlightQuery: s.highlightQuery,
          sort: s.sort,
        }),
        searchFuzzyOverride: null,
      };
    }),

  clearFilters: () =>
    set((s) => {
      const filters = defaultBooksFilters();

      return {
        filters,
        activeViewId: clearActiveViewIfDirty({
          savedViews: s.savedViews,
          activeViewId: s.activeViewId,
          filters,
          searchQuery: s.searchQuery,
          highlightQuery: s.highlightQuery,
          sort: s.sort,
        }),
        searchFuzzyOverride: null,
      };
    }),

  visibleBooks: () => {
    const { books, filters, searchQuery, searchFuzzyOverride, sort } = get();

    const base = applyFilters(books, filters);

    const q = searchQuery.trim();
    const searched = !q
      ? base
      : (
          smartSearch(base, q, {
            fuzzyMaxDistance: searchFuzzyOverride ?? undefined,
            limit: 500,
          }) as VisibleSearchResult[]
        ).map((r) => r.ref);

    return sortBooks(searched, sort);
  },

  reset: () => {
    clearUndoTimer();
    set(() => ({ ...initialState }));
  },
}));
