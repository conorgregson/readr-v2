import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BookList } from "./BookList";
import type { Book } from "../types";
import { useBooksStore } from "../store/books.store";

vi.mock("./BookCard", () => ({
  BookCard: ({
    book,
    isSelected,
    onToggleSelected,
  }: {
    book: Book;
    isSelected: boolean;
    onToggleSelected: () => void;
  }) => (
    <div>
      <span>{book.title}</span>
      <button onClick={onToggleSelected}>
        {isSelected ? `Deselect ${book.title}` : `Select ${book.title}`}
      </button>
    </div>
  ),
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
});

describe("BookList keyboard navigation", () => {
  it("moves active index with ArrowDown, ArrowUp, Home, and End", async () => {
    const user = userEvent.setup();
    const onActiveIndex = vi.fn();
    const onEscapeToSearch = vi.fn();

    render(
      <BookList
        id="books-results"
        books={[
          makeBook({ id: "a", title: "Dune" }),
          makeBook({ id: "b", title: "Hyperion" }),
          makeBook({ id: "c", title: "Foundation" }),
        ]}
        searchQuery=""
        activeIndex={-1}
        onActiveIndex={onActiveIndex}
        onEscapeToSearch={onEscapeToSearch}
      />,
    );

    const list = screen.getByRole("listbox", { name: /books results/i });
    list.focus();

    await user.keyboard("{ArrowDown}");
    expect(onActiveIndex).toHaveBeenLastCalledWith(0);

    await user.keyboard("{End}");
    expect(onActiveIndex).toHaveBeenLastCalledWith(2);

    await user.keyboard("{Home}");
    expect(onActiveIndex).toHaveBeenLastCalledWith(0);
  });

  it("escapes back to search when ArrowUp is pressed from the first row", async () => {
    const user = userEvent.setup();
    const onActiveIndex = vi.fn();
    const onEscapeToSearch = vi.fn();

    render(
      <BookList
        id="books-results"
        books={[
          makeBook({ id: "a", title: "Dune" }),
          makeBook({ id: "b", title: "Hyperion" }),
        ]}
        searchQuery=""
        activeIndex={0}
        onActiveIndex={onActiveIndex}
        onEscapeToSearch={onEscapeToSearch}
      />,
    );

    const list = screen.getByRole("listbox", { name: /books results/i });
    list.focus();

    await user.keyboard("{ArrowUp}");

    expect(onEscapeToSearch).toHaveBeenCalledTimes(1);
    expect(onActiveIndex).not.toHaveBeenCalled();
  });

  it("page jumps by five results", async () => {
    const user = userEvent.setup();
    const onActiveIndex = vi.fn();
    const onEscapeToSearch = vi.fn();

    const books = Array.from({ length: 8 }, (_, i) =>
      makeBook({ id: `b${i}`, title: `Book ${i}` }),
    );

    const { rerender } = render(
      <BookList
        id="books-results"
        books={books}
        searchQuery=""
        activeIndex={0}
        onActiveIndex={onActiveIndex}
        onEscapeToSearch={onEscapeToSearch}
      />,
    );

    const list = screen.getByRole("listbox", { name: /books results/i });
    list.focus();

    await user.keyboard("{PageDown}");
    expect(onActiveIndex).toHaveBeenLastCalledWith(5);

    rerender(
      <BookList
        id="books-results"
        books={books}
        searchQuery=""
        activeIndex={5}
        onActiveIndex={onActiveIndex}
        onEscapeToSearch={onEscapeToSearch}
      />,
    );

    await user.keyboard("{PageUp}");
    expect(onActiveIndex).toHaveBeenLastCalledWith(0);
  });

  it("passes selection state into BookCard and toggles selected ids", async () => {
    const user = userEvent.setup();

    render(
      <BookList
        id="books-results"
        books={[
          makeBook({ id: "a", title: "Dune" }),
          makeBook({ id: "b", title: "Hyperion" }),
        ]}
        searchQuery=""
        activeIndex={-1}
        onActiveIndex={vi.fn()}
        onEscapeToSearch={vi.fn()}
      />,
    );

    expect(useBooksStore.getState().selectedIds).toEqual([]);

    const toggleButton = screen.getByRole("button", { name: /select dune/i });

    await user.click(toggleButton);
    expect(useBooksStore.getState().selectedIds).toEqual(["a"]);

    await user.click(toggleButton);
    expect(useBooksStore.getState().selectedIds).toEqual([]);
  });

  it("applies selected styling to selected rows", () => {
    useBooksStore.setState({ selectedIds: ["b"] });

    render(
      <BookList
        id="books-results"
        books={[
          makeBook({ id: "a", title: "Dune" }),
          makeBook({ id: "b", title: "Hyperion" }),
        ]}
        searchQuery=""
        activeIndex={-1}
        onActiveIndex={vi.fn()}
        onEscapeToSearch={vi.fn()}
      />,
    );

    const selectedRow = screen
      .getByText("Hyperion")
      .closest("li")
      ?.querySelector(".bg-blue-50\\/40");

    expect(selectedRow).toBeTruthy();
  });
});
