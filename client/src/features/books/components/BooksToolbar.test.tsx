import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { BooksToolbar } from "./BooksToolbar";
import type { BooksFilters, Book } from "../types";

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

    expect(onFocusResults).not.toHaveBeenCalled();
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

    expect(onFocusResults).toHaveBeenCalledTimes(1);
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
