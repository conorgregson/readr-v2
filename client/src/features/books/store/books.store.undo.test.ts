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
  useBooksStore.getState().reset();
  vi.clearAllMocks();
});

describe("BooksStore Undo and Bulk Actions (Sprint 1)", () => {
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
    expect(state.undo?.meta.kind).toBe("delete");
    if (state.undo?.meta.kind === "delete") {
      expect(state.undo.meta.bookId).toBe("1");
    }
  });

  it("undo restores exact previous books snapshot", async () => {
    const books = seedBooks();

    useBooksStore.setState({ books });

    vi.mocked(BooksService.remove).mockResolvedValue(undefined);

    await useBooksStore.getState().deleteBook("1");
    await useBooksStore.getState().undoLast();

    const state = useBooksStore.getState();

    expect(state.books).toEqual(books);
    expect(state.undo).toBeNull();
    expect(BooksService.remove).not.toHaveBeenCalled();
  });

  it("undo fails after expiration", async () => {
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

  it("toggles selected ids", () => {
    const books = seedBooks();
    useBooksStore.setState({ books });

    const store = useBooksStore.getState();

    store.toggleSelected("1");
    expect(useBooksStore.getState().selectedIds).toEqual(["1"]);
    expect(useBooksStore.getState().isSelected("1")).toBe(true);

    store.toggleSelected("1");
    expect(useBooksStore.getState().selectedIds).toEqual([]);
    expect(useBooksStore.getState().isSelected("1")).toBe(false);
  });

  it("selectAllVisible selects visible books only", () => {
    const books = seedBooks();
    useBooksStore.setState({ books });

    useBooksStore.getState().selectAllVisible();

    expect(useBooksStore.getState().selectedIds).toEqual(["1", "2"]);
    expect(useBooksStore.getState().selectedCount()).toBe(2);
  });

  it("bulk update changes selected books and clears selection", async () => {
    const books = seedBooks();

    useBooksStore.setState({
      books,
      selectedIds: ["1", "2"],
    });

    vi.mocked(BooksService.bulkUpdate).mockResolvedValue({
      ok: true,
      operationId: "bulk-update-1",
      operation: "update",
      affectedCount: 2,
      affectedIds: ["1", "2"],
    });

    vi.mocked(BooksService.list).mockResolvedValue([
      {
        ...books[0],
        status: "finished",
        updatedAt: "2026-03-27T10:00:00.000Z",
        finishedAt: "2026-03-27T10:00:00.000Z",
      },
      {
        ...books[1],
        status: "finished",
        updatedAt: "2026-03-27T10:00:00.000Z",
        finishedAt: "2026-03-27T10:00:00.000Z",
      },
    ] as Book[]);

    const ok = await useBooksStore
      .getState()
      .bulkUpdateSelectedBooks({ status: "finished" });

    expect(ok).toBe(true);
    expect(BooksService.bulkUpdate).toHaveBeenCalledWith({
      ids: ["1", "2"],
      patch: { status: "finished" },
    });

    const state = useBooksStore.getState();

    expect(state.selectedIds).toEqual([]);
    expect(state.books.every((book) => book.status === "finished")).toBe(true);
    expect(state.undo).toBeNull();
  });

  it("bulk update restores previous books on failure", async () => {
    const books = seedBooks();

    useBooksStore.setState({
      books,
      selectedIds: ["1", "2"],
    });

    vi.mocked(BooksService.bulkUpdate).mockRejectedValue(
      new Error("Failed to bulk update books"),
    );

    const ok = await useBooksStore
      .getState()
      .bulkUpdateSelectedBooks({ status: "finished" });

    expect(ok).toBe(false);
    expect(useBooksStore.getState().books).toEqual(books);
  });

  it("bulk delete removes selected books, clears selection, and sets grouped undo", async () => {
    const books = seedBooks();

    useBooksStore.setState({
      books,
      selectedIds: ["1", "2"],
    });

    const ok = await useBooksStore.getState().bulkDeleteSelectedBooks();

    expect(ok).toBe(true);

    const state = useBooksStore.getState();

    expect(state.books).toEqual([]);
    expect(state.selectedIds).toEqual([]);
    expect(state.undo).not.toBeNull();
    expect(state.undo?.meta.kind).toBe("bulk-delete");

    if (state.undo?.meta.kind === "bulk-delete") {
      expect(state.undo.meta.affectedIds).toEqual(["1", "2"]);
    }

    expect(BooksService.bulkRemove).not.toHaveBeenCalled();
  });

  it("undo restores books after bulk delete before server commit", async () => {
    const books = seedBooks();

    useBooksStore.setState({
      books,
      selectedIds: ["1", "2"],
    });

    await useBooksStore.getState().bulkDeleteSelectedBooks();

    expect(useBooksStore.getState().books).toEqual([]);

    const undoOk = await useBooksStore.getState().undoLast();

    expect(undoOk).toBe(true);
    expect(useBooksStore.getState().books).toEqual(books);
    expect(useBooksStore.getState().undo).toBeNull();
    expect(BooksService.bulkRemove).not.toHaveBeenCalled();
  });

  it("bulk delete restores books on immediate setup failure before timer commit", async () => {
    const books = seedBooks();

    useBooksStore.setState({
      books,
      selectedIds: ["1", "2"],
    });

    const ok = await useBooksStore.getState().bulkDeleteSelectedBooks();

    expect(ok).toBe(true);
    expect(useBooksStore.getState().books).toEqual([]);

    await useBooksStore.getState().undoLast();

    expect(useBooksStore.getState().books).toEqual(books);
  });
});
