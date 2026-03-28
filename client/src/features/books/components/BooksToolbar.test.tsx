import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { BooksToolbar } from "./BooksToolbar";
import type { BooksFilters, Book } from "../types";
import { useBooksStore } from "../store/books.store";

function makeFilters(overrides: Partial<BooksFilters> = {}): BooksFilters {
  return {
    status: overrides.status ?? [],
    authors: overrides.authors ?? [],
    genres: overrides.genres ?? [],
    series: overrides.series ?? [],
    tbrOnly: overrides.tbrOnly ?? false,
    tbrMonth: overrides.tbrMonth ?? "",
  };
}

function makeBooks(): Book[] {
  return [
    {
      id: "b1",
      title: "Dune",
      author: "Frank Herbert",
      status: "planned",
      createdAt: "2026-03-01T00:00:00.000Z",
      updatedAt: "2026-03-01T00:00:00.000Z",
      genre: "Sci-Fi",
      series: "Dune",
    },
    {
      id: "b2",
      title: "Hyperion",
      author: "Dan Simmons",
      status: "reading",
      createdAt: "2026-03-02T00:00:00.000Z",
      updatedAt: "2026-03-02T00:00:00.000Z",
      genre: "Sci-Fi",
      series: "Hyperion Cantos",
    },
  ];
}

beforeEach(() => {
  useBooksStore.getState().reset();
  vi.clearAllMocks();
});

describe("BooksToolbar committed search", () => {
  it("debounces preview search while typing", async () => {
    const user = userEvent.setup();
    const onPreviewQuery = vi.fn();
    const onCommitQuery = vi.fn();

    render(
      <BooksToolbar
        books={makeBooks()}
        booksTotal={2}
        visibleCount={2}
        filters={makeFilters()}
        searchQuery=""
        committedQuery=""
        onPreviewQuery={onPreviewQuery}
        onCommitQuery={onCommitQuery}
        onFocusResults={vi.fn()}
        searchInputRef={createRef<HTMLInputElement>()}
        onAddBook={vi.fn()}
        addButtonRef={createRef<HTMLButtonElement>()}
      />,
    );

    const input = screen.getByRole("combobox", { name: /search books/i });

    await user.type(input, "dune");

    expect(onPreviewQuery).not.toHaveBeenCalled();

    await waitFor(() => {
      expect(onPreviewQuery).toHaveBeenCalledWith("dune");
    });

    expect(onCommitQuery).not.toHaveBeenCalled();
  });

  it("keeps the Search button visible when preview query matches the draft but explicit commit has not happened", () => {
    render(
      <BooksToolbar
        books={makeBooks()}
        booksTotal={2}
        visibleCount={2}
        filters={makeFilters()}
        searchQuery="dune"
        committedQuery=""
        onPreviewQuery={vi.fn()}
        onCommitQuery={vi.fn()}
        onFocusResults={vi.fn()}
        searchInputRef={createRef<HTMLInputElement>()}
        onAddBook={vi.fn()}
        addButtonRef={createRef<HTMLButtonElement>()}
      />,
    );

    expect(
      screen.getByRole("button", { name: /run search/i }),
    ).toBeInTheDocument();
  });

  it("commits immediately when Search is clicked", async () => {
    const user = userEvent.setup();
    const onPreviewQuery = vi.fn();
    const onCommitQuery = vi.fn();

    render(
      <BooksToolbar
        books={makeBooks()}
        booksTotal={2}
        visibleCount={2}
        filters={makeFilters()}
        searchQuery=""
        committedQuery=""
        onPreviewQuery={onPreviewQuery}
        onCommitQuery={onCommitQuery}
        onFocusResults={vi.fn()}
        searchInputRef={createRef<HTMLInputElement>()}
        onAddBook={vi.fn()}
        addButtonRef={createRef<HTMLButtonElement>()}
      />,
    );

    const input = screen.getByRole("combobox", { name: /search books/i });

    await user.type(input, "dune");

    const button = await screen.findByRole("button", { name: /run search/i });
    await user.click(button);

    expect(onCommitQuery).toHaveBeenCalledWith("dune");
  });

  it("moves through suggestions on ArrowDown before sending focus to results", async () => {
    const user = userEvent.setup();
    const onFocusResults = vi.fn();

    render(
      <BooksToolbar
        books={makeBooks()}
        booksTotal={2}
        visibleCount={2}
        filters={makeFilters()}
        searchQuery=""
        committedQuery=""
        onPreviewQuery={vi.fn()}
        onCommitQuery={vi.fn()}
        onFocusResults={onFocusResults}
        searchInputRef={createRef<HTMLInputElement>()}
        onAddBook={vi.fn()}
        addButtonRef={createRef<HTMLButtonElement>()}
      />,
    );

    const input = screen.getByRole("combobox", { name: /search books/i });
    input.focus();

    await user.type(input, "du");
    await user.keyboard("{ArrowDown}");

    await waitFor(() => {
      expect(onFocusResults).not.toHaveBeenCalled();
    });
  });

  it("moves focus to results on ArrowDown when no suggestions are open", async () => {
    const user = userEvent.setup();
    const onFocusResults = vi.fn();

    render(
      <BooksToolbar
        books={makeBooks()}
        booksTotal={2}
        visibleCount={2}
        filters={makeFilters()}
        searchQuery=""
        committedQuery=""
        onPreviewQuery={vi.fn()}
        onCommitQuery={vi.fn()}
        onFocusResults={onFocusResults}
        searchInputRef={createRef<HTMLInputElement>()}
        onAddBook={vi.fn()}
        addButtonRef={createRef<HTMLButtonElement>()}
      />,
    );

    const input = screen.getByRole("combobox", { name: /search books/i });
    input.focus();

    await user.keyboard("{ArrowDown}");

    await waitFor(() => {
      expect(onFocusResults).toHaveBeenCalledTimes(1);
    });
  });

  it("commits a suggestion on Enter when one is actively selected", async () => {
    const user = userEvent.setup();
    const onCommitQuery = vi.fn();

    render(
      <BooksToolbar
        books={makeBooks()}
        booksTotal={2}
        visibleCount={2}
        filters={makeFilters()}
        searchQuery=""
        committedQuery=""
        onPreviewQuery={vi.fn()}
        onCommitQuery={onCommitQuery}
        onFocusResults={vi.fn()}
        searchInputRef={createRef<HTMLInputElement>()}
        onAddBook={vi.fn()}
        addButtonRef={createRef<HTMLButtonElement>()}
      />,
    );

    const input = screen.getByRole("combobox", { name: /search books/i });

    await user.type(input, "du");
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{Enter}");

    expect(onCommitQuery).toHaveBeenCalledWith("Dune");
  });

  it("commits the typed query on Enter when no suggestion is selected", async () => {
    const user = userEvent.setup();
    const onCommitQuery = vi.fn();

    render(
      <BooksToolbar
        books={makeBooks()}
        booksTotal={2}
        visibleCount={2}
        filters={makeFilters()}
        searchQuery=""
        committedQuery=""
        onPreviewQuery={vi.fn()}
        onCommitQuery={onCommitQuery}
        onFocusResults={vi.fn()}
        searchInputRef={createRef<HTMLInputElement>()}
        onAddBook={vi.fn()}
        addButtonRef={createRef<HTMLButtonElement>()}
      />,
    );

    const input = screen.getByRole("combobox", { name: /search books/i });

    await user.type(input, "du");
    await user.keyboard("{Enter}");

    expect(onCommitQuery).toHaveBeenCalledWith("du");
  });
});

describe("BooksToolbar bulk actions", () => {
  it("does not show bulk action row when nothing is selected", () => {
    render(
      <BooksToolbar
        books={makeBooks()}
        booksTotal={2}
        visibleCount={2}
        filters={makeFilters()}
        searchQuery=""
        committedQuery=""
        onPreviewQuery={vi.fn()}
        onCommitQuery={vi.fn()}
        onFocusResults={vi.fn()}
        searchInputRef={createRef<HTMLInputElement>()}
        onAddBook={vi.fn()}
        addButtonRef={createRef<HTMLButtonElement>()}
      />,
    );

    expect(screen.queryByText(/books selected/i)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /delete selected books/i }),
    ).not.toBeInTheDocument();
  });

  it("shows bulk action row when books are selected", () => {
    useBooksStore.setState({ selectedIds: ["b1", "b2"] });

    render(
      <BooksToolbar
        books={makeBooks()}
        booksTotal={2}
        visibleCount={2}
        filters={makeFilters()}
        searchQuery=""
        committedQuery=""
        onPreviewQuery={vi.fn()}
        onCommitQuery={vi.fn()}
        onFocusResults={vi.fn()}
        searchInputRef={createRef<HTMLInputElement>()}
        onAddBook={vi.fn()}
        addButtonRef={createRef<HTMLButtonElement>()}
      />,
    );

    expect(screen.getByText("2 books selected")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /mark selected books as planned/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /mark selected books as reading/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /mark selected books as finished/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /delete selected books/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /clear selected books/i }),
    ).toBeInTheDocument();
  });

  it("clears selection from the bulk action row", async () => {
    const user = userEvent.setup();

    useBooksStore.setState({ selectedIds: ["b1", "b2"] });

    render(
      <BooksToolbar
        books={makeBooks()}
        booksTotal={2}
        visibleCount={2}
        filters={makeFilters()}
        searchQuery=""
        committedQuery=""
        onPreviewQuery={vi.fn()}
        onCommitQuery={vi.fn()}
        onFocusResults={vi.fn()}
        searchInputRef={createRef<HTMLInputElement>()}
        onAddBook={vi.fn()}
        addButtonRef={createRef<HTMLButtonElement>()}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: /clear selected books/i }),
    );

    expect(useBooksStore.getState().selectedIds).toEqual([]);
  });

  it("runs bulk status update from the toolbar", async () => {
    const user = userEvent.setup();

    useBooksStore.setState({
      books: makeBooks(),
      selectedIds: ["b1", "b2"],
    });

    const bulkUpdateSpy = vi
      .spyOn(useBooksStore.getState(), "bulkUpdateSelectedBooks")
      .mockResolvedValue(true);

    render(
      <BooksToolbar
        books={makeBooks()}
        booksTotal={2}
        visibleCount={2}
        filters={makeFilters()}
        searchQuery=""
        committedQuery=""
        onPreviewQuery={vi.fn()}
        onCommitQuery={vi.fn()}
        onFocusResults={vi.fn()}
        searchInputRef={createRef<HTMLInputElement>()}
        onAddBook={vi.fn()}
        addButtonRef={createRef<HTMLButtonElement>()}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: /mark selected books as finished/i }),
    );

    expect(bulkUpdateSpy).toHaveBeenCalledWith({ status: "finished" });
  });

  it("runs bulk delete from the toolbar after confirm", async () => {
    const user = userEvent.setup();

    useBooksStore.setState({
      books: makeBooks(),
      selectedIds: ["b1", "b2"],
    });

    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    const bulkDeleteSpy = vi
      .spyOn(useBooksStore.getState(), "bulkDeleteSelectedBooks")
      .mockResolvedValue(true);

    render(
      <BooksToolbar
        books={makeBooks()}
        booksTotal={2}
        visibleCount={2}
        filters={makeFilters()}
        searchQuery=""
        committedQuery=""
        onPreviewQuery={vi.fn()}
        onCommitQuery={vi.fn()}
        onFocusResults={vi.fn()}
        searchInputRef={createRef<HTMLInputElement>()}
        onAddBook={vi.fn()}
        addButtonRef={createRef<HTMLButtonElement>()}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: /delete selected books/i }),
    );

    expect(confirmSpy).toHaveBeenCalled();
    expect(bulkDeleteSpy).toHaveBeenCalled();

    confirmSpy.mockRestore();
  });
});
