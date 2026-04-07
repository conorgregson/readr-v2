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

describe("BooksToolbar saved views and sort", () => {
  it("shows saved view and sort controls", () => {
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

    expect(
      screen.getByRole("combobox", { name: /saved view/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("combobox", { name: /sort books/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /save current view/i }),
    ).toBeInTheDocument();
  });

  it("applies a saved view from the selector", async () => {
    const user = userEvent.setup();

    useBooksStore.setState({
      savedViews: [
        {
          id: "view-1",
          name: "Sci-Fi TBR",
          filters: {
            genres: ["Sci-Fi"],
            status: ["planned"],
            search: "dune",
          },
          sort: { key: "title", direction: "asc" },
          isPinned: false,
          isDefault: false,
          createdAt: "2026-03-10T00:00:00.000Z",
          updatedAt: "2026-03-10T00:00:00.000Z",
        },
      ],
    });

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

    await user.selectOptions(
      screen.getByRole("combobox", { name: /saved view/i }),
      "view-1",
    );

    const state = useBooksStore.getState();

    expect(state.activeViewId).toBe("view-1");
    expect(state.filters.status).toEqual(["planned"]);
    expect(state.filters.genres).toEqual(["Sci-Fi"]);
    expect(state.searchQuery).toBe("dune");
    expect(state.sort).toEqual({ key: "title", direction: "asc" });
  });

  it("shows active saved view management actions when a saved view is selected", () => {
    useBooksStore.setState({
      savedViews: [
        {
          id: "view-1",
          name: "Sci-Fi TBR",
          filters: {
            genres: ["Sci-Fi"],
            status: ["planned"],
          },
          sort: { key: "title", direction: "asc" },
          isPinned: false,
          isDefault: false,
          createdAt: "2026-03-10T00:00:00.000Z",
          updatedAt: "2026-03-10T00:00:00.000Z",
        },
      ],
      activeViewId: "view-1",
    });

    render(
      <BooksToolbar
        books={makeBooks()}
        booksTotal={2}
        visibleCount={2}
        filters={makeFilters({ genres: ["Sci-Fi"], status: ["planned"] })}
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

    expect(screen.getByText(/active view:/i)).toBeInTheDocument();
    expect(screen.getAllByText("Sci-Fi TBR")).toHaveLength(2);
    expect(
      screen.getByRole("button", { name: /rename active saved view/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /pin active saved view/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /set default saved view/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /delete active saved view/i }),
    ).toBeInTheDocument();
  });

  it("toggles default on the active saved view", async () => {
    const user = userEvent.setup();

    useBooksStore.setState({
      savedViews: [
        {
          id: "view-1",
          name: "Sci-Fi TBR",
          filters: {},
          sort: { key: "createdAt", direction: "desc" },
          isPinned: false,
          isDefault: false,
          createdAt: "2026-03-10T00:00:00.000Z",
          updatedAt: "2026-03-10T00:00:00.000Z",
        },
      ],
      activeViewId: "view-1",
    });

    const updateSavedViewSpy = vi
      .spyOn(useBooksStore.getState(), "updateSavedView")
      .mockResolvedValue({
        id: "view-1",
        name: "Sci-Fi TBR",
        filters: {},
        sort: { key: "createdAt", direction: "desc" },
        isPinned: false,
        isDefault: true,
        createdAt: "2026-03-10T00:00:00.000Z",
        updatedAt: "2026-03-10T00:00:00.000Z",
      });

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
      screen.getByRole("button", { name: /set default saved view/i }),
    );

    expect(updateSavedViewSpy).toHaveBeenCalledWith("view-1", {
      isDefault: true,
    });
  });

  it("unsets default on the active saved view", async () => {
    const user = userEvent.setup();

    useBooksStore.setState({
      savedViews: [
        {
          id: "view-1",
          name: "Sci-Fi TBR",
          filters: {},
          sort: { key: "createdAt", direction: "desc" },
          isPinned: false,
          isDefault: true,
          createdAt: "2026-03-10T00:00:00.000Z",
          updatedAt: "2026-03-10T00:00:00.000Z",
        },
      ],
      activeViewId: "view-1",
    });

    const updateSavedViewSpy = vi
      .spyOn(useBooksStore.getState(), "updateSavedView")
      .mockResolvedValue({
        id: "view-1",
        name: "Sci-Fi TBR",
        filters: {},
        sort: { key: "createdAt", direction: "desc" },
        isPinned: false,
        isDefault: false,
        createdAt: "2026-03-10T00:00:00.000Z",
        updatedAt: "2026-03-10T00:00:00.000Z",
      });

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
      screen.getByRole("button", { name: /unset default saved view/i }),
    );

    expect(updateSavedViewSpy).toHaveBeenCalledWith("view-1", {
      isDefault: false,
    });
  });

  it("deletes the active saved view after confirm", async () => {
    const user = userEvent.setup();

    useBooksStore.setState({
      savedViews: [
        {
          id: "view-1",
          name: "Sci-Fi TBR",
          filters: {},
          sort: { key: "createdAt", direction: "desc" },
          isPinned: false,
          isDefault: false,
          createdAt: "2026-03-10T00:00:00.000Z",
          updatedAt: "2026-03-10T00:00:00.000Z",
        },
      ],
      activeViewId: "view-1",
    });

    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    const deleteSavedViewSpy = vi
      .spyOn(useBooksStore.getState(), "deleteSavedView")
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
      screen.getByRole("button", { name: /delete active saved view/i }),
    );

    expect(confirmSpy).toHaveBeenCalledWith('Delete saved view "Sci-Fi TBR"?');
    expect(deleteSavedViewSpy).toHaveBeenCalledWith("view-1");

    confirmSpy.mockRestore();
  });

  it("updates sort from the selector", async () => {
    const user = userEvent.setup();

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

    await user.selectOptions(
      screen.getByRole("combobox", { name: /sort books/i }),
      "title:asc",
    );

    expect(useBooksStore.getState().sort).toEqual({
      key: "title",
      direction: "asc",
    });
  });

  it("opens inline save view composer from the toolbar", async () => {
    const user = userEvent.setup();

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
      screen.getByRole("button", { name: /save current view/i }),
    );

    expect(screen.getByLabelText(/view name/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /confirm save current view/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /cancel save current view/i }),
    ).toBeInTheDocument();
  });

  it("opens inline rename composer for the active saved view", async () => {
    const user = userEvent.setup();

    useBooksStore.setState({
      savedViews: [
        {
          id: "view-1",
          name: "Sci-Fi TBR",
          filters: {},
          sort: { key: "createdAt", direction: "desc" },
          isPinned: false,
          isDefault: false,
          createdAt: "2026-03-10T00:00:00.000Z",
          updatedAt: "2026-03-10T00:00:00.000Z",
        },
      ],
      activeViewId: "view-1",
    });

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
      screen.getByRole("button", { name: /rename active saved view/i }),
    );

    expect(screen.getByLabelText(/rename view/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /confirm rename saved view/i }),
    ).toBeInTheDocument();
  });

  it("renames the active saved view inline", async () => {
    const user = userEvent.setup();

    useBooksStore.setState({
      savedViews: [
        {
          id: "view-1",
          name: "Sci-Fi TBR",
          filters: {},
          sort: { key: "createdAt", direction: "desc" },
          isPinned: false,
          isDefault: false,
          createdAt: "2026-03-10T00:00:00.000Z",
          updatedAt: "2026-03-10T00:00:00.000Z",
        },
      ],
      activeViewId: "view-1",
    });

    const updateSavedViewSpy = vi
      .spyOn(useBooksStore.getState(), "updateSavedView")
      .mockResolvedValue({
        id: "view-1",
        name: "Fantasy TBR",
        filters: {},
        sort: { key: "createdAt", direction: "desc" },
        isPinned: false,
        isDefault: false,
        createdAt: "2026-03-10T00:00:00.000Z",
        updatedAt: "2026-03-10T00:00:00.000Z",
      });

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
      screen.getByRole("button", { name: /rename active saved view/i }),
    );

    const input = screen.getByLabelText(/rename view/i);
    await user.clear(input);
    await user.type(input, "Fantasy TBR");

    await user.click(
      screen.getByRole("button", { name: /confirm rename saved view/i }),
    );

    expect(updateSavedViewSpy).toHaveBeenCalledWith("view-1", {
      name: "Fantasy TBR",
    });

    expect(await screen.findByText(/view renamed/i)).toBeInTheDocument();
  });

  it("shows feedback after saving a view from the inline composer", async () => {
    const user = userEvent.setup();

    vi.spyOn(useBooksStore.getState(), "saveCurrentView").mockResolvedValue({
      id: "view-1",
      name: "My View",
      filters: {},
      sort: { key: "createdAt", direction: "desc" },
      isPinned: false,
      isDefault: false,
      createdAt: "2026-03-10T00:00:00.000Z",
      updatedAt: "2026-03-10T00:00:00.000Z",
    });

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
      screen.getByRole("button", { name: /save current view/i }),
    );

    await user.type(screen.getByLabelText(/view name/i), "My View");

    await user.click(
      screen.getByRole("button", { name: /confirm save current view/i }),
    );

    expect(await screen.findByText(/view saved/i)).toBeInTheDocument();
  });

  it("toggles pinned on the active saved view", async () => {
    const user = userEvent.setup();

    useBooksStore.setState({
      savedViews: [
        {
          id: "view-1",
          name: "Sci-Fi TBR",
          filters: {},
          sort: { key: "createdAt", direction: "desc" },
          isPinned: false,
          isDefault: false,
          createdAt: "2026-03-10T00:00:00.000Z",
          updatedAt: "2026-03-10T00:00:00.000Z",
        },
      ],
      activeViewId: "view-1",
    });

    const updateSavedViewSpy = vi
      .spyOn(useBooksStore.getState(), "updateSavedView")
      .mockResolvedValue({
        id: "view-1",
        name: "Sci-Fi TBR",
        filters: {},
        sort: { key: "createdAt", direction: "desc" },
        isPinned: true,
        isDefault: false,
        createdAt: "2026-03-10T00:00:00.000Z",
        updatedAt: "2026-03-10T00:00:00.000Z",
      });

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
      screen.getByRole("button", { name: /pin active saved view/i }),
    );

    expect(updateSavedViewSpy).toHaveBeenCalledWith("view-1", {
      isPinned: true,
    });

    expect(await screen.findByText(/view pinned/i)).toBeInTheDocument();
  });

  it("shows feedback after setting the default saved view", async () => {
    const user = userEvent.setup();

    useBooksStore.setState({
      savedViews: [
        {
          id: "view-1",
          name: "Sci-Fi TBR",
          filters: {},
          sort: { key: "createdAt", direction: "desc" },
          isPinned: false,
          isDefault: false,
          createdAt: "2026-03-10T00:00:00.000Z",
          updatedAt: "2026-03-10T00:00:00.000Z",
        },
      ],
      activeViewId: "view-1",
    });

    vi.spyOn(useBooksStore.getState(), "updateSavedView").mockResolvedValue({
      id: "view-1",
      name: "Sci-Fi TBR",
      filters: {},
      sort: { key: "createdAt", direction: "desc" },
      isPinned: false,
      isDefault: true,
      createdAt: "2026-03-10T00:00:00.000Z",
      updatedAt: "2026-03-10T00:00:00.000Z",
    });

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
      screen.getByRole("button", { name: /set default saved view/i }),
    );

    expect(
      await screen.findByText(/default view updated/i),
    ).toBeInTheDocument();
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

  it("removes the bulk action row after clearing selection", async () => {
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

    expect(screen.getByText("2 books selected")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /clear selected books/i }),
    );

    await waitFor(() => {
      expect(screen.queryByText(/books selected/i)).not.toBeInTheDocument();
    });
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

  it("disables bulk status buttons while a bulk update is pending", async () => {
    const user = userEvent.setup();

    useBooksStore.setState({
      books: makeBooks(),
      selectedIds: ["b1", "b2"],
    });

    let resolveBulkUpdate: (value: boolean) => void = () => {};
    const pendingBulkUpdate = new Promise<boolean>((resolve) => {
      resolveBulkUpdate = resolve;
    });

    vi.spyOn(
      useBooksStore.getState(),
      "bulkUpdateSelectedBooks",
    ).mockReturnValue(pendingBulkUpdate);

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

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /mark selected books as planned/i }),
      ).toBeDisabled();
      expect(
        screen.getByRole("button", { name: /mark selected books as reading/i }),
      ).toBeDisabled();
      expect(
        screen.getByRole("button", {
          name: /mark selected books as finished/i,
        }),
      ).toBeDisabled();
      expect(
        screen.getByRole("button", { name: /delete selected books/i }),
      ).toBeDisabled();
      expect(
        screen.getByRole("button", { name: /clear selected books/i }),
      ).toBeDisabled();
    });

    resolveBulkUpdate(true);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /mark selected books as planned/i }),
      ).not.toBeDisabled();
    });
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

  it("disables delete and clear while bulk delete is pending", async () => {
    const user = userEvent.setup();

    useBooksStore.setState({
      books: makeBooks(),
      selectedIds: ["b1", "b2"],
    });

    vi.spyOn(window, "confirm").mockReturnValue(true);

    let resolveBulkDelete: (value: boolean) => void = () => {};
    const pendingBulkDelete = new Promise<boolean>((resolve) => {
      resolveBulkDelete = resolve;
    });

    vi.spyOn(
      useBooksStore.getState(),
      "bulkDeleteSelectedBooks",
    ).mockReturnValue(pendingBulkDelete);

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

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /mark selected books as planned/i }),
      ).toBeDisabled();
      expect(
        screen.getByRole("button", { name: /mark selected books as reading/i }),
      ).toBeDisabled();
      expect(
        screen.getByRole("button", {
          name: /mark selected books as finished/i,
        }),
      ).toBeDisabled();
      expect(
        screen.getByRole("button", { name: /delete selected books/i }),
      ).toBeDisabled();
      expect(
        screen.getByRole("button", { name: /clear selected books/i }),
      ).toBeDisabled();
    });

    resolveBulkDelete(true);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /delete selected books/i }),
      ).not.toBeDisabled();
    });
  });
});
