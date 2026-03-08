import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
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
  it("does not commit search until Search is clicked", async () => {
    const user = userEvent.setup();
    const onCommitQuery = vi.fn();

    render(
      <BooksToolbar
        books={makeBooks()}
        booksTotal={2}
        visibleCount={2}
        filters={makeFilters()}
        searchQuery=""
        onCommitQuery={onCommitQuery}
        onFocusResults={vi.fn()}
        searchInputRef={createRef<HTMLInputElement>()}
        onAddBook={vi.fn()}
        addButtonRef={createRef<HTMLButtonElement>()}
      />,
    );

    const input = screen.getByRole("combobox", { name: /search books/i });
    const button = screen.getByRole("button", { name: /run search/i });

    await user.type(input, "dune");
    expect(onCommitQuery).not.toHaveBeenCalled();

    await user.click(button);
    expect(onCommitQuery).toHaveBeenCalledWith("dune");
  });

  it("commits search on Enter when no suggestion is actively selected", async () => {
    const user = userEvent.setup();
    const onCommitQuery = vi.fn();

    render(
      <BooksToolbar
        books={makeBooks()}
        booksTotal={2}
        visibleCount={2}
        filters={makeFilters()}
        searchQuery=""
        onCommitQuery={onCommitQuery}
        onFocusResults={vi.fn()}
        searchInputRef={createRef<HTMLInputElement>()}
        onAddBook={vi.fn()}
        addButtonRef={createRef<HTMLButtonElement>()}
      />,
    );

    const input = screen.getByRole("combobox", { name: /search books/i });

    await user.type(input, "zzz");
    await user.keyboard("{Enter}");

    expect(onCommitQuery).toHaveBeenCalledWith("zzz");
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

  it("commits a suggestion on Enter when one is active", async () => {
    const user = userEvent.setup();
    const onCommitQuery = vi.fn();

    render(
      <BooksToolbar
        books={makeBooks()}
        booksTotal={2}
        visibleCount={2}
        filters={makeFilters()}
        searchQuery=""
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

    expect(onCommitQuery).toHaveBeenCalledWith("Dune");
  });
});
