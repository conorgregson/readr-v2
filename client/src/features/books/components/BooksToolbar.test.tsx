import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { BooksToolbar } from "./BooksToolbar";
import type { BooksFilters } from "../types";

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

describe("BooksToolbar committed search", () => {
  it("does not commit search until Search is clicked", async () => {
    const user = userEvent.setup();
    const onCommitQuery = vi.fn();

    render(
      <BooksToolbar
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

    const input = screen.getByRole("searchbox", { name: /search books/i });
    const button = screen.getByRole("button", { name: /run search/i });

    await user.type(input, "dune");
    expect(onCommitQuery).not.toHaveBeenCalled();

    await user.click(button);
    expect(onCommitQuery).toHaveBeenCalledWith("dune");
  });

  it("commits search on Enter", async () => {
    const user = userEvent.setup();
    const onCommitQuery = vi.fn();

    render(
      <BooksToolbar
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

    const input = screen.getByRole("searchbox", { name: /search books/i });

    await user.type(input, "hyperion");
    await user.keyboard("{Enter}");

    expect(onCommitQuery).toHaveBeenCalledWith("hyperion");
  });

  it("moves focus flow into results on ArrowDown", async () => {
    const user = userEvent.setup();
    const onFocusResults = vi.fn();

    render(
      <BooksToolbar
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

    const input = screen.getByRole("searchbox", { name: /search books/i });
    input.focus();

    await user.keyboard("{ArrowDown}");

    expect(onFocusResults).toHaveBeenCalledTimes(1);
  });
});
