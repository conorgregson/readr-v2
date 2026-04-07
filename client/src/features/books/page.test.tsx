import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BooksPage } from "./page";
import { useBooksStore } from "./store/books.store";
import { BooksService } from "./services/books.service";
import { SavedViewsService } from "./services/saved-views.service";
import type { Book } from "./types";

vi.mock("./services/books.service");
vi.mock("./services/saved-views.service");

vi.mock("./components/BooksFilters", () => ({
  BooksFiltersPanel: () => <div data-testid="books-filters-panel" />,
}));

vi.mock("./components/AddBookPanel", () => ({
  AddBookPanel: () => <div data-testid="add-book-panel" />,
}));

vi.mock("./components/BookList", () => ({
  BookList: ({ books }: { books: Book[] }) => {
    const store = useBooksStore.getState();

    return (
      <div data-testid="book-list">
        {books.map((book) => (
          <div key={book.id} data-testid={`book-${book.id}`}>
            <span>{book.title}</span>
            <button onClick={() => void store.deleteBook(book.id)}>
              Delete {book.title}
            </button>
          </div>
        ))}
      </div>
    );
  },
}));

function makeBook(overrides: Partial<Book> = {}): Book {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    title: overrides.title ?? "Untitled",
    author: overrides.author ?? "Unknown",
    status: overrides.status ?? "planned",
    createdAt: overrides.createdAt ?? "2026-03-01T10:00:00.000Z",
    updatedAt: overrides.updatedAt ?? "2026-03-01T10:00:00.000Z",
    genre: overrides.genre,
    series: overrides.series,
    seriesType: overrides.seriesType,
    format: overrides.format,
    formatSubtype: overrides.formatSubtype,
    isbn: overrides.isbn,
    plannedMonth: overrides.plannedMonth,
    startedAt: overrides.startedAt,
    finishedAt: overrides.finishedAt,
  };
}

beforeEach(() => {
  useBooksStore.getState().reset();
  vi.clearAllMocks();
  vi.mocked(SavedViewsService.list).mockResolvedValue([]);
});

describe("BooksPage bootstrapping", () => {
  it("loads books and saved views on first mount", async () => {
    vi.mocked(BooksService.list).mockResolvedValue([
      makeBook({ id: "a", title: "Dune" }),
    ]);
    vi.mocked(SavedViewsService.list).mockResolvedValue([]);

    render(<BooksPage />);

    await waitFor(() => {
      expect(BooksService.list).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(SavedViewsService.list).toHaveBeenCalledTimes(1);
    });

    expect(await screen.findByText("Dune")).toBeInTheDocument();
  });

  it("retries loading books after an error", async () => {
    const user = userEvent.setup();

    useBooksStore.setState({
      isBootstrapped: true,
      page: { mode: "error", error: { message: "Failed to load books" } },
      books: [],
      filters: {
        status: [],
        authors: [],
        genres: [],
        series: [],
        tbrOnly: false,
        tbrMonth: "",
      },
      searchQuery: "",
      highlightQuery: "",
      searchFuzzyOverride: null,
      undo: null,
      sort: { key: "createdAt", direction: "desc" },
      savedViews: [],
      savedViewsLoaded: false,
      activeViewId: null,
    });

    vi.mocked(BooksService.list).mockResolvedValue([
      makeBook({ id: "a", title: "Dune" }),
    ]);
    vi.mocked(SavedViewsService.list).mockResolvedValue([]);

    render(<BooksPage />);

    expect(screen.getByText("Failed to load books")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^retry$/i }));

    await waitFor(() => {
      expect(BooksService.list).toHaveBeenCalledTimes(1);
      expect(SavedViewsService.list).toHaveBeenCalledTimes(1);
    });

    expect(await screen.findByText("Dune")).toBeInTheDocument();
  });

  it("dismisses error without retrying", async () => {
    const user = userEvent.setup();

    useBooksStore.setState({
      isBootstrapped: true,
      page: { mode: "error", error: { message: "Failed to load books" } },
      books: [makeBook({ id: "a", title: "Dune" })],
      filters: {
        status: [],
        authors: [],
        genres: [],
        series: [],
        tbrOnly: false,
        tbrMonth: "",
      },
      searchQuery: "",
      highlightQuery: "",
      searchFuzzyOverride: null,
      undo: null,
      sort: { key: "createdAt", direction: "desc" },
      savedViews: [],
      savedViewsLoaded: true,
      activeViewId: null,
    });

    render(<BooksPage />);

    expect(screen.getByText("Failed to load books")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^dismiss$/i }));

    await waitFor(() => {
      expect(screen.getByText("Dune")).toBeInTheDocument();
    });

    expect(BooksService.list).not.toHaveBeenCalled();
    expect(SavedViewsService.list).not.toHaveBeenCalled();
  });
});

describe("BooksPage undo flow", () => {
  it("restores a deleted book when Undo is clicked", async () => {
    const user = userEvent.setup();

    vi.mocked(BooksService.remove).mockResolvedValue(undefined);

    useBooksStore.setState({
      isBootstrapped: true,
      page: { mode: "results" },
      books: [
        makeBook({ id: "a", title: "Dune" }),
        makeBook({ id: "b", title: "Hyperion" }),
      ],
      filters: {
        status: [],
        authors: [],
        genres: [],
        series: [],
        tbrOnly: false,
        tbrMonth: "",
      },
      searchQuery: "",
      highlightQuery: "",
      searchFuzzyOverride: null,
      undo: null,
      sort: { key: "createdAt", direction: "desc" },
      savedViews: [],
      savedViewsLoaded: true,
      activeViewId: null,
    });

    render(<BooksPage />);

    expect(screen.getByText("Dune")).toBeInTheDocument();
    expect(screen.getByText("Hyperion")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /delete dune/i }));

    expect(screen.queryByText("Dune")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^undo$/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^undo$/i }));

    expect(screen.getByText("Dune")).toBeInTheDocument();
    expect(screen.getByText("Hyperion")).toBeInTheDocument();
    expect(BooksService.remove).not.toHaveBeenCalled();
  });

  it("restores original statuses when bulk update is undone", async () => {
    const user = userEvent.setup();

    const originalBooks = [
      makeBook({ id: "a", title: "Dune", status: "planned" }),
      makeBook({
        id: "b",
        title: "Hyperion",
        status: "reading",
        startedAt: "2026-03-01T10:00:00.000Z",
      }),
    ];

    const finishedBooks = [
      makeBook({
        id: "a",
        title: "Dune",
        status: "finished",
        finishedAt: "2026-03-27T10:00:00.000Z",
        updatedAt: "2026-03-27T10:00:00.000Z",
      }),
      makeBook({
        id: "b",
        title: "Hyperion",
        status: "finished",
        startedAt: "2026-03-01T10:00:00.000Z",
        finishedAt: "2026-03-27T10:00:00.000Z",
        updatedAt: "2026-03-27T10:00:00.000Z",
      }),
    ];

    vi.mocked(BooksService.bulkUpdate).mockResolvedValue({
      ok: true,
      operationId: "bulk-update-1",
      operation: "update",
      affectedCount: 2,
      affectedIds: ["a", "b"],
    });

    vi.mocked(BooksService.list)
      .mockResolvedValueOnce(finishedBooks)
      .mockResolvedValueOnce(originalBooks);

    vi.mocked(BooksService.update)
      .mockResolvedValueOnce(originalBooks[0])
      .mockResolvedValueOnce(originalBooks[1]);

    useBooksStore.setState({
      isBootstrapped: true,
      page: { mode: "results" },
      books: originalBooks,
      filters: {
        status: [],
        authors: [],
        genres: [],
        series: [],
        tbrOnly: false,
        tbrMonth: "",
      },
      searchQuery: "",
      highlightQuery: "",
      searchFuzzyOverride: null,
      undo: null,
      selectedIds: ["a", "b"],
      sort: { key: "createdAt", direction: "desc" },
      savedViews: [],
      savedViewsLoaded: true,
      activeViewId: null,
    });

    render(<BooksPage />);

    expect(screen.getByText("Dune")).toBeInTheDocument();
    expect(screen.getByText("Hyperion")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /mark selected books as finished/i }),
    );

    await waitFor(() => {
      expect(useBooksStore.getState().undo?.meta.kind).toBe("bulk-update");
    });

    expect(screen.getByRole("button", { name: /^undo$/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^undo$/i }));

    await waitFor(() => {
      expect(BooksService.update).toHaveBeenNthCalledWith(1, "a", {
        status: "planned",
      });
      expect(BooksService.update).toHaveBeenNthCalledWith(2, "b", {
        status: "reading",
      });
    });

    await waitFor(() => {
      const state = useBooksStore.getState();
      expect(
        state.books.map((book) => ({ id: book.id, status: book.status })),
      ).toEqual([
        { id: "a", status: "planned" },
        { id: "b", status: "reading" },
      ]);
      expect(state.undo).toBeNull();
    });

    expect(screen.getByText("Dune")).toBeInTheDocument();
    expect(screen.getByText("Hyperion")).toBeInTheDocument();
  });
});
