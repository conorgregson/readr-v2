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
});
