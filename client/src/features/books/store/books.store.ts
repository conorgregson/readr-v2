// features/books/store/books.store.ts
import { create } from "zustand";
import type { PageState, PageError } from "../../../shared/types/ui-state";

import type { Book, BooksFilters } from "../types";
import { defaultBooksFilters } from "../types";
import { applyFilters } from "../filters";

import { smartSearch } from "../search/search.engine";

type BooksState = {
  isBootstrapped: boolean;
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

  // Sprint 3: local seed data; persistence/service later
  books: [
    {
      id: "1",
      title: "Dune",
      author: "Frank Herbert",
      status: "planned",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      genre: "Sci-Fi",
      series: "Dune",
      seriesType: "series",
      format: "physical",
      isbn: "978-0441013593",
      plannedMonth: "2026-02",
    },
    {
      id: "2",
      title: "Hyperion",
      author: "Dan Simmons",
      status: "reading",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      genre: "Sci-Fi",
      format: "digital",
    },
  ],

  filters: defaultBooksFilters(),
  searchQuery: "",
  searchFuzzyOverride: null,
};

export const useBooksStore = create<BooksState>((set, get) => ({
  ...initialState,

  loadBooks: async () => {
    // Sprint 3: stub only (BooksService later)
    set({ isBootstrapped: true });
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
