import { describe, it, expect, beforeEach, vi } from "vitest";
import { useBooksStore } from "./books.store";
import { BooksService } from "../services/books.service";
import type { Book } from "../types";

vi.mock("../services/books.service");

function seedBooks(): Book[] {
  return [
    {
      id: "1",
      title: "Book A",
      author: "Author A",
      status: "planned",
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    },
    {
      id: "2",
      title: "Book B",
      author: "Author B",
      status: "reading",
      createdAt: "2024-01-02",
      updatedAt: "2024-01-02",
    },
  ] as Book[];
}

beforeEach(() => {
  // reset Zustand store to initialState
  useBooksStore.getState().reset();
  vi.clearAllMocks();
});

describe("BooksStore Undo (Sprint 5)", () => {
  it("delete removes book and sets undo record", async () => {
    const books = seedBooks();

    useBooksStore.setState({ books });

    vi.mocked(BooksService.remove).mockResolvedValue(undefined);

    const ok = await useBooksStore.getState().deleteBook("1");

    expect(ok).toBe(true);

    const state = useBooksStore.getState();
    expect(state.books).toHaveLength(1);
    expect(state.books[0].id).toBe("2");

    expect(state.undo).not.toBeNull();
    expect(state.undo?.meta?.bookId).toBe("1");
  });

  it("undo restores exact previous books snapshot", async () => {
    const books = seedBooks();

    useBooksStore.setState({ books });

    vi.mocked(BooksService.remove).mockResolvedValue(undefined);

    await useBooksStore.getState().deleteBook("1");

    await useBooksStore.getState().undoLast();

    const state = useBooksStore.getState();

    expect(state.books).toEqual(books); // exact deep equality
    expect(state.undo).toBeNull();
    expect(BooksService.remove).not.toHaveBeenCalled();
  });

  it("undo fail after expiration", async () => {
    const books = seedBooks();

    useBooksStore.setState({ books });

    vi.mocked(BooksService.remove).mockResolvedValue(undefined);

    await useBooksStore.getState().deleteBook("1");

    const expireUndo = {
      ...useBooksStore.getState().undo!,
      expiresAtMs: Date.now() - 1000,
    };

    useBooksStore.setState({ undo: expireUndo });

    const result = await useBooksStore.getState().undoLast();

    expect(result).toBe(false);
  });

  it("returns true immediately and sets undo for delayed delete", async () => {
    const books = seedBooks();

    useBooksStore.setState({ books });

    vi.mocked(BooksService.remove).mockResolvedValue(undefined);

    const ok = await useBooksStore.getState().deleteBook("1");

    expect(ok).toBe(true);

    const state = useBooksStore.getState();
    expect(state.books).toHaveLength(1);
    expect(state.books[0].id).toBe("2");
    expect(state.undo).not.toBeNull();
  });

  it("does not call remove when undo happens before expiration", async () => {
    const books = seedBooks();

    useBooksStore.setState({ books });

    vi.mocked(BooksService.remove).mockResolvedValue(undefined);

    await useBooksStore.getState().deleteBook("1");
    await useBooksStore.getState().undoLast();

    expect(BooksService.remove).not.toHaveBeenCalled();
  });
});
