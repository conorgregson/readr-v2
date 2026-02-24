import { create } from "zustand";
import type { Book, BookId, BooksFilters } from "../types";
import { BooksService } from "../services/books.service";

type BooksState = {
  // data
  books: Book[];

  // UI state
  searchQuery: string;
  isLooserSearch: boolean;
  filters: BooksFilters;

  // request state
  isLoading: boolean;

  /** Used for non-row mutations (ex: add book) */
  isSaving: boolean;

  /** Global error (load/add) */
  error: string | null;

  /** Per-row saving + error */
  savingById: Record<BookId, boolean>;
  errorById: Record<BookId, string>;

  /** Undo delete: row removed immediately; finalize after 5s unless undone */
  pendingDeleteById: Record<
    BookId,
    {
      book: Book;
      index: number;
      timeoutId: ReturnType<typeof window.setTimeout>;
    }
  >;

  // actions
  loadBooks: () => Promise<void>;
  setSearchQuery: (q: string) => void;
  setLooserSearch: (enabled: boolean) => void;
  setStatusFilter: (status: BooksFilters["status"]) => void;

  addBook: (
    input: Omit<Book, "id" | "createdAt" | "updatedAt">,
  ) => Promise<void>;
  updateBook: (
    id: BookId,
    patch: Partial<Omit<Book, "id" | "createdAt">>,
  ) => Promise<void>;
  deleteBook: (id: BookId) => Promise<void>;
  undoDelete: (id: BookId) => void;

  resetSearch: () => void;
  clearError: () => void;
};

export const useBooksStore = create<BooksState>((set, get) => ({
  books: [],

  searchQuery: "",
  isLooserSearch: false,
  filters: { status: "All" },

  isLoading: false,
  isSaving: false,

  error: null,

  savingById: {},
  errorById: {},
  pendingDeleteById: {},

  clearError: () => set({ error: null, errorById: {} }),

  loadBooks: async () => {
    set({ isLoading: true, error: null });
    try {
      const books = await BooksService.list();
      set({ books });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to load books",
      });
    } finally {
      set({ isLoading: false });
    }
  },

  setSearchQuery: (q) => set({ searchQuery: q, isLooserSearch: false }),
  setLooserSearch: (enabled) => set({ isLooserSearch: enabled }),
  setStatusFilter: (status) =>
    set((s) => ({ filters: { ...s.filters, status } })),

  addBook: async (input) => {
    set({ error: null, isSaving: true });
    try {
      const created = await BooksService.create(input);
      set((state) => ({ books: [created, ...state.books] }));
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to create book",
      });
      // For addBook, usually don't need to throw; page can just show global error
    } finally {
      set({ isSaving: false });
    }
  },

  updateBook: async (id, patch) => {
    // clear row error + mark row saving
    set((s) => {
      const nextErrors = { ...s.errorById };
      delete nextErrors[id];
      return {
        errorById: nextErrors,
        savingById: { ...s.savingById, [id]: true },
      };
    });

    // Snapshot for rollback
    const prevBooks = get().books.map((b) => ({ ...b }));

    // Optimistic update
    set((state) => ({
      books: state.books.map((b) => (b.id === id ? { ...b, ...patch } : b)),
    }));

    try {
      const updated = await BooksService.update(id, patch);

      // Reconcile if service returns canonical updated book
      if (updated) {
        set((state) => ({
          books: state.books.map((b) => (b.id === id ? updated : b)),
        }));
      }
    } catch (err) {
      // Rollback
      set({ books: prevBooks });

      const msg = err instanceof Error ? err.message : "Failed to update book";
      set((s) => ({ errorById: { ...s.errorById, [id]: msg } }));

      // IMPORTANT: throw so page.tsx keeps edit open + draft intact
      throw new Error(msg);
    } finally {
      // clear row saving
      set((s) => {
        const next = { ...s.savingById };
        delete next[id];
        return { savingById: next };
      });
    }
  },

  deleteBook: async (id) => {
    // clear row error
    set((s) => {
      const nextErrors = { ...s.errorById };
      delete nextErrors[id];
      return { errorById: nextErrors };
    });

    const booksNow = get().books;
    const index = booksNow.findIndex((b) => b.id === id);
    if (index === -1) return;

    const book = booksNow[index];

    // Optimistically remove immediately
    set((s) => ({ books: s.books.filter((b) => b.id !== id) }));

    const timeoutId = window.setTimeout(async () => {
      try {
        // Mark row as saving during finalize
        set((s) => ({ savingById: { ...s.savingById, [id]: true } }));

        const ok = await BooksService.remove(id);
        if (!ok) throw new Error("Failed to delete book");

        // Remove pending entry + clear saving
        set((s) => {
          const nextPending = { ...s.pendingDeleteById };
          delete nextPending[id];

          const nextSaving = { ...s.savingById };
          delete nextSaving[id];

          return { pendingDeleteById: nextPending, savingById: nextSaving };
        });
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Failed to delete book";

        set((s) => {
          const nextPending = { ...s.pendingDeleteById };
          delete nextPending[id];

          const nextSaving = { ...s.savingById };
          delete nextSaving[id];

          // Restore at original index
          const restored = [...s.books];
          const restoreIndex = Math.min(index, restored.length);
          restored.splice(restoreIndex, 0, book);

          return {
            books: restored,
            pendingDeleteById: nextPending,
            savingById: nextSaving,
            errorById: { ...s.errorById, [id]: msg },
          };
        });
      }
    }, 6000);

    // Track pending delete so UI can show Undo toast
    set((s) => ({
      pendingDeleteById: {
        ...s.pendingDeleteById,
        [id]: { book, index, timeoutId },
      },
    }));
  },

  undoDelete: (id) => {
    const pending = get().pendingDeleteById[id];
    if (!pending) return;

    window.clearTimeout(pending.timeoutId);

    set((s) => {
      const nextPending = { ...s.pendingDeleteById };
      delete nextPending[id];

      const nextErrors = { ...s.errorById };
      delete nextErrors[id];

      // Restore at original index
      const restored = [...s.books];
      const restoreIndex = Math.min(pending.index, restored.length);
      restored.splice(restoreIndex, 0, pending.book);

      return {
        books: restored,
        pendingDeleteById: nextPending,
        errorById: nextErrors,
      };
    });
  },

  resetSearch: () => set({ searchQuery: "", isLooserSearch: false }),
}));
