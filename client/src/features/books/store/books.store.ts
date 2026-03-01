import { create } from "zustand";
import type { PageState, PageError } from "../../../shared/types/ui-state";

import type { Book, BookId, BooksFilters } from "../types";
import { defaultBooksFilters } from "../types";
import { applyFilters } from "../filters";

import { BooksService } from "../services/books.service";
import { smartSearch } from "../search/search.engine";

function reqTrim(label: string, value: unknown): string {
  const s = typeof value === "string" ? value.trim() : "";
  if (!s) throw new Error(`${label} is required`);
  return s;
}

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

type CreateBookInput = Omit<Book, "id" | "createdAt" | "updatedAt">;

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

  loadBooks: () => Promise<void>;

  page: PageState;
  setError: (error: PageError | undefined) => void;

  // domain
  books: Book[];

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

const initialState: Pick<
  BooksState,
  | "page"
  | "isBootstrapped"
  | "books"
  | "filters"
  | "searchQuery"
  | "searchFuzzyOverride"
> = {
  page: { mode: "results" },
  isBootstrapped: false,

  // Sprint 4: load from BooksService (local-first)
  books: [],

  filters: defaultBooksFilters(),
  searchQuery: "",
  searchFuzzyOverride: null,
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
    // Guardrail: implement store delete now, but UI + Undo later.
    const before = get().books;
    const next = before.filter((b) => b.id !== id);
    if (next.length === before.length) return false;

    set({ books: next, page: { mode: "results" } });

    try {
      const ok = await BooksService.remove(id);
      if (!ok) throw new Error("Delete failed");
      return true;
    } catch (e) {
      set({
        books: before,
        page: {
          mode: "error",
          error: { message: (e as Error)?.message ?? "Failed to delete book" },
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
    });

    // allow either engine shape: [{ref}] or [Book]
    return results.map((r) => r.ref);
  },

  reset: () => set(() => ({ ...initialState })),
}));
