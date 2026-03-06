import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BooksPage } from "./page";
import { useBooksStore } from "./store/books.store";
import { BooksService } from "./services/books.service";
import type { Book } from "./types";

vi.mock("./services/books.service");

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
  localStorage.clear();
  useBooksStore.getState().reset();
  vi.clearAllMocks();
});

describe("BooksPage undo flow", () => {
  it("restores a deleted book when Undo is clicked", async () => {
    const user = userEvent.setup();

    vi.mocked(BooksService.remove).mockResolvedValue(true);
    vi.mocked(BooksService.replaceAll).mockResolvedValue(undefined);

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
      searchFuzzyOverride: null,
      undo: null,
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
    expect(BooksService.replaceAll).toHaveBeenCalledTimes(1);
  });
});
