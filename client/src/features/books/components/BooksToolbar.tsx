import { useEffect, useMemo, useRef, useState } from "react";
import type React from "react";
import { Button } from "../../../shared/ui/Button";
import { SearchStatus } from "../../../shared/ui/SearchStatus";
import type { BooksFilters, Book } from "../types";
import { useBooksStore } from "../store/books.store";
import type {
  LibrarySortKey,
  SavedLibraryViewSort,
} from "../../../../../shared/types/v2.4";

function uniqueValues(arr: string[]) {
  return Array.from(new Set(arr.filter(Boolean))).sort((a, b) =>
    a.localeCompare(b),
  );
}

const SORT_OPTIONS: Array<{
  value: `${LibrarySortKey}:${SavedLibraryViewSort["direction"]}`;
  label: string;
  sort: SavedLibraryViewSort;
}> = [
  {
    value: "createdAt:desc",
    label: "Newest added",
    sort: { key: "createdAt", direction: "desc" },
  },
  {
    value: "createdAt:asc",
    label: "Oldest added",
    sort: { key: "createdAt", direction: "asc" },
  },
  {
    value: "updatedAt:desc",
    label: "Recently updated",
    sort: { key: "updatedAt", direction: "desc" },
  },
  {
    value: "title:asc",
    label: "Title (A–Z)",
    sort: { key: "title", direction: "asc" },
  },
  {
    value: "title:desc",
    label: "Title (Z–A)",
    sort: { key: "title", direction: "desc" },
  },
  {
    value: "author:asc",
    label: "Author (A–Z)",
    sort: { key: "author", direction: "asc" },
  },
  {
    value: "author:desc",
    label: "Author (Z–A)",
    sort: { key: "author", direction: "desc" },
  },
  {
    value: "finishedAt:desc",
    label: "Recently finished",
    sort: { key: "finishedAt", direction: "desc" },
  },
];

function sortToValue(sort: SavedLibraryViewSort): string {
  return `${sort.key}:${sort.direction}`;
}

function valueToSort(value: string): SavedLibraryViewSort {
  const matched = SORT_OPTIONS.find((option) => option.value === value);
  return matched?.sort ?? { key: "createdAt", direction: "desc" };
}

export function BooksToolbar({
  books,
  booksTotal,
  visibleCount,
  filters,
  searchQuery,
  committedQuery,
  onPreviewQuery,
  onCommitQuery,
  onFocusResults,
  searchInputRef,
  onAddBook,
  addButtonRef,
}: {
  books: Book[];
  booksTotal: number;
  visibleCount: number;
  filters: BooksFilters;
  searchQuery: string;
  committedQuery: string;
  onPreviewQuery: (q: string) => void;
  onCommitQuery: (q: string) => void;
  onFocusResults: () => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  onAddBook: () => void;
  addButtonRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const suggestionsId = "books-search-suggestions";

  const selectedCount = useBooksStore((s) => s.selectedCount());
  const clearSelection = useBooksStore((s) => s.clearSelection);
  const bulkUpdateSelectedBooks = useBooksStore(
    (s) => s.bulkUpdateSelectedBooks,
  );
  const bulkDeleteSelectedBooks = useBooksStore(
    (s) => s.bulkDeleteSelectedBooks,
  );

  const sort = useBooksStore((s) => s.sort);
  const setSort = useBooksStore((s) => s.setSort);

  const savedViews = useBooksStore((s) => s.savedViews);
  const activeViewId = useBooksStore((s) => s.activeViewId);
  const applySavedView = useBooksStore((s) => s.applySavedView);
  const clearActiveView = useBooksStore((s) => s.clearActiveView);
  const saveCurrentView = useBooksStore((s) => s.saveCurrentView);
  const updateSavedView = useBooksStore((s) => s.updateSavedView);
  const deleteSavedView = useBooksStore((s) => s.deleteSavedView);

  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const renameInputRef = useRef<HTMLInputElement | null>(null);

  const [viewFeedback, setViewFeedback] = useState<{
    tone: "success" | "info";
    message: string;
  } | null>(null);

  const activeView = activeViewId
    ? (savedViews.find((view) => view.id === activeViewId) ?? null)
    : null;

  const [draftQuery, setDraftQuery] = useState(searchQuery);

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [showSuggest, setShowSuggest] = useState(false);
  const commitTimerRef = useRef<number | null>(null);

  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isSavingView, setIsSavingView] = useState(false);

  const [isSaveViewOpen, setIsSaveViewOpen] = useState(false);
  const [viewName, setViewName] = useState("");
  const [saveAsDefault, setSaveAsDefault] = useState(false);
  const [saveAsPinned, setSaveAsPinned] = useState(false);
  const saveViewInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setDraftQuery(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    if (!isSaveViewOpen) return;
    window.setTimeout(() => {
      saveViewInputRef.current?.focus();
    }, 0);
  }, [isSaveViewOpen]);

  useEffect(() => {
    if (!viewFeedback) return;

    const timer = window.setTimeout(() => {
      setViewFeedback(null);
    }, 2200);

    return () => window.clearTimeout(timer);
  }, [viewFeedback]);

  useEffect(() => {
    if (!isRenameOpen) return;

    window.setTimeout(() => {
      renameInputRef.current?.focus();
      renameInputRef.current?.select();
    }, 0);
  }, [isRenameOpen]);

  const hasUncommittedChange = useMemo(() => {
    return draftQuery.trim() !== committedQuery.trim();
  }, [draftQuery, committedQuery]);

  useEffect(() => {
    const next = draftQuery.trim();
    const prev = searchQuery.trim();

    if (next === prev) return;

    if (commitTimerRef.current !== null) {
      window.clearTimeout(commitTimerRef.current);
    }

    commitTimerRef.current = window.setTimeout(() => {
      onPreviewQuery(next);
      commitTimerRef.current = null;
    }, 200);

    return () => {
      if (commitTimerRef.current !== null) {
        window.clearTimeout(commitTimerRef.current);
        commitTimerRef.current = null;
      }
    };
  }, [draftQuery, searchQuery, onPreviewQuery]);

  const flushPendingCommit = () => {
    if (commitTimerRef.current !== null) {
      window.clearTimeout(commitTimerRef.current);
      commitTimerRef.current = null;
    }
  };

  const filtersActive =
    filters.status.length > 0 ||
    filters.authors.length > 0 ||
    filters.genres.length > 0 ||
    filters.series.length > 0 ||
    filters.tbrOnly ||
    !!filters.tbrMonth;

  const statusText = (() => {
    const q = searchQuery.trim();
    const x = visibleCount;
    const y = booksTotal;

    if (q) {
      if (x === 0) return `No results for "${q}"`;
      if (filtersActive) {
        return (
          <>
            {x === 1 ? "1 result" : `${x} results`}{" "}
            <span className="text-slate-500">(filtered from {y})</span>
          </>
        );
      }
      return x === 1 ? "1 result" : `${x} results`;
    }

    if (filtersActive) {
      return (
        <>
          Showing {x} <span className="text-slate-500">of {y}</span>
        </>
      );
    }

    return "";
  })();

  function buildSuggestions(q: string) {
    const needle = q.trim().toLowerCase();
    if (!needle) {
      setSuggestions([]);
      setActiveSuggestion(-1);
      return;
    }

    const titles = uniqueValues(books.map((b) => b.title));
    const authors = uniqueValues(books.map((b) => b.author));
    const series = uniqueValues(books.map((b) => b.series || ""));
    const genres = uniqueValues(books.map((b) => b.genre || ""));

    const pool = uniqueValues([...titles, ...authors, ...series, ...genres]);

    const filtered = pool
      .filter((v) => v.toLowerCase().includes(needle))
      .sort((a, b) => {
        const ap = a.toLowerCase().startsWith(needle) ? 0 : 1;
        const bp = b.toLowerCase().startsWith(needle) ? 0 : 1;
        return ap - bp || a.localeCompare(b);
      })
      .slice(0, 8);

    setSuggestions(filtered);
    setActiveSuggestion(-1);
  }

  const commitNow = () => {
    flushPendingCommit();
    setShowSuggest(false);
    onCommitQuery(draftQuery.trim());
  };

  const clearQuery = () => {
    flushPendingCommit();
    setDraftQuery("");
    setSuggestions([]);
    setActiveSuggestion(-1);
    setShowSuggest(false);
    onCommitQuery("");
    window.setTimeout(() => {
      const el = searchInputRef.current;
      el?.focus();
      if (el) {
        const v = el.value;
        el.setSelectionRange?.(v.length, v.length);
      }
    }, 0);
  };

  const pickSuggestion = (value: string) => {
    flushPendingCommit();
    setDraftQuery(value);
    setSuggestions([]);
    setActiveSuggestion(-1);
    setShowSuggest(false);
    onCommitQuery(value);

    window.setTimeout(() => {
      searchInputRef.current?.focus();
    }, 0);
  };

  async function runBulkStatusUpdate(
    status: "planned" | "reading" | "finished",
  ) {
    try {
      setIsBulkUpdating(true);
      await bulkUpdateSelectedBooks({ status });
    } finally {
      setIsBulkUpdating(false);
    }
  }

  async function runBulkDelete() {
    const ok = window.confirm(
      selectedCount === 1
        ? "Delete the selected book?"
        : `Delete ${selectedCount} selected books?`,
    );
    if (!ok) return;

    try {
      setIsBulkDeleting(true);
      await bulkDeleteSelectedBooks();
    } finally {
      setIsBulkDeleting(false);
    }
  }

  function openSaveViewComposer() {
    setViewName(activeView ? activeView.name : "");
    setSaveAsDefault(false);
    setSaveAsPinned(false);
    setIsSaveViewOpen(true);
  }

  function closeSaveViewComposer() {
    setIsSaveViewOpen(false);
    setViewName("");
    setSaveAsDefault(false);
    setSaveAsPinned(false);
  }

  async function runSaveCurrentView() {
    if (!viewName.trim()) return;

    try {
      setIsSavingView(true);
      await saveCurrentView({
        name: viewName.trim(),
        isDefault: saveAsDefault,
        isPinned: saveAsPinned,
      });
      closeSaveViewComposer();
      setViewFeedback({
        tone: "success",
        message: "View saved",
      });
    } finally {
      setIsSavingView(false);
    }
  }

  async function runToggleDefaultView() {
    if (!activeView) return;

    const updated = await updateSavedView(activeView.id, {
      isDefault: !activeView.isDefault,
    });

    if (updated) {
      setViewFeedback({
        tone: "success",
        message: updated.isDefault ? "Default view updated" : "Default removed",
      });
    }
  }

  async function runDeleteActiveView() {
    if (!activeView) return;

    const ok = window.confirm(`Delete saved view "${activeView.name}"?`);
    if (!ok) return;

    const deleted = await deleteSavedView(activeView.id);

    if (deleted) {
      setViewFeedback({
        tone: "info",
        message: "View deleted",
      });
    }
  }

  function openRenameComposer() {
    if (!activeView) return;
    setRenameValue(activeView.name);
    setIsRenameOpen(true);
  }

  function closeRenameComposer() {
    setIsRenameOpen(false);
    setRenameValue("");
  }

  async function runRenameActiveView() {
    if (!activeView || !renameValue.trim()) return;

    const updated = await updateSavedView(activeView.id, {
      name: renameValue.trim(),
    });

    if (updated) {
      closeRenameComposer();
      setViewFeedback({
        tone: "success",
        message: "View renamed",
      });
    }
  }

  async function runTogglePinnedView() {
    if (!activeView) return;

    const updated = await updateSavedView(activeView.id, {
      isPinned: !activeView.isPinned,
    });

    if (updated) {
      setViewFeedback({
        tone: "success",
        message: updated.isPinned ? "View pinned" : "View unpinned",
      });
    }
  }

  const bulkBusy = isBulkUpdating || isBulkDeleting;
  const suggestionsOpen = showSuggest && suggestions.length > 0;
  const activeSuggestionId =
    suggestionsOpen && activeSuggestion >= 0
      ? `${suggestionsId}-option-${activeSuggestion}`
      : undefined;

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold">Books</h1>
        </div>

        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex flex-wrap items-end gap-2 rounded-md border border-slate-950 bg-slate-950 p-3">
            <div className="min-w-[220px] flex-1">
              <label
                htmlFor="books-saved-view"
                className="mb-1 block text-xs font-medium text-slate-300"
              >
                Saved view
              </label>
              <select
                id="books-saved-view"
                aria-label="Saved view"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-700 text-sm"
                value={activeViewId ?? ""}
                onChange={(e) => {
                  const next = e.target.value;
                  if (!next) {
                    clearActiveView();
                    return;
                  }
                  applySavedView(next);
                }}
              >
                <option value="">Current view</option>
                {savedViews.map((view) => (
                  <option key={view.id} value={view.id}>
                    {view.name}
                    {view.isDefault ? " (Default)" : ""}
                    {view.isPinned ? " 📌" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="min-w-[190px]">
              <label
                htmlFor="books-sort"
                className="mb-1 block text-xs font-medium text-slate-300"
              >
                Sort
              </label>
              <select
                id="books-sort"
                aria-label="Sort books"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-700 text-sm"
                value={sortToValue(sort)}
                onChange={(e) => {
                  setSort(valueToSort(e.target.value));
                }}
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="shrink-0">
              <Button
                variant="secondary"
                onClick={openSaveViewComposer}
                disabled={isSavingView}
                aria-label="Save current view"
              >
                Save View
              </Button>
            </div>
          </div>

          {viewFeedback ? (
            <div
              className={`rounded-md border px-3 py-2 text-sm shadow-sm transition-all duration-300 animate-in fade-in slide-in-from-top-1 ${
                viewFeedback.tone === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-sky-200 bg-sky-50 text-sky-700"
              }`}
              role="status"
              aria-live="polite"
            >
              {viewFeedback.message}
            </div>
          ) : null}

          {isSaveViewOpen ? (
            <div className="flex flex-col gap-3 rounded-md border border-slate-200 bg-white p-3">
              <div className="flex flex-col gap-2 md:flex-row md:items-end">
                <div className="min-w-[240px] flex-1">
                  <label
                    htmlFor="save-view-name"
                    className="mb-1 block text-xs font-medium text-slate-600"
                  >
                    View name
                  </label>
                  <input
                    id="save-view-name"
                    ref={saveViewInputRef}
                    type="text"
                    value={viewName}
                    onChange={(e) => setViewName(e.target.value)}
                    placeholder="e.g. Sci-Fi TBR"
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-700 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        void runSaveCurrentView();
                      } else if (e.key === "Escape") {
                        e.preventDefault();
                        closeSaveViewComposer();
                      }
                    }}
                  />
                </div>

                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={saveAsDefault}
                    onChange={(e) => setSaveAsDefault(e.target.checked)}
                  />
                  Default
                </label>

                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={saveAsPinned}
                    onChange={(e) => setSaveAsPinned(e.target.checked)}
                  />
                  Pinned
                </label>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  onClick={() => void runSaveCurrentView()}
                  disabled={!viewName.trim() || isSavingView}
                  aria-label="Confirm save current view"
                >
                  {isSavingView ? "Saving…" : "Save"}
                </Button>

                <Button
                  variant="secondary"
                  onClick={closeSaveViewComposer}
                  disabled={isSavingView}
                  aria-label="Cancel save current view"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : null}

          {activeView ? (
            <div className="flex flex-col gap-3 rounded-md border border-slate-200 bg-white px-3 py-3">
              <div className="flex flex-wrap items-center gap-2">
                <div className="mr-2 text-sm text-slate-700">
                  Active view:{" "}
                  <span className="font-medium">{activeView.name}</span>
                </div>

                {activeView.isDefault ? (
                  <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700">
                    Default
                  </span>
                ) : null}

                {activeView.isPinned ? (
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                    Pinned
                  </span>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="secondary"
                  onClick={openRenameComposer}
                  aria-label="Rename active saved view"
                >
                  Rename
                </Button>

                <Button
                  variant="secondary"
                  onClick={() => void runTogglePinnedView()}
                  aria-label={
                    activeView.isPinned
                      ? "Unpin active saved view"
                      : "Pin active saved view"
                  }
                >
                  {activeView.isPinned ? "Unpin" : "Pin"}
                </Button>

                <Button
                  variant="secondary"
                  onClick={() => void runToggleDefaultView()}
                  aria-label={
                    activeView.isDefault
                      ? "Unset default saved view"
                      : "Set default saved view"
                  }
                >
                  {activeView.isDefault ? "Unset Default" : "Set Default"}
                </Button>

                <Button
                  variant="danger"
                  onClick={() => void runDeleteActiveView()}
                  aria-label="Delete active saved view"
                >
                  Delete View
                </Button>
              </div>

              {isRenameOpen ? (
                <div className="flex flex-col gap-2 rounded-md border border-slate-200 bg-slate-50 p-3 md:flex-row md:items-end">
                  <div className="min-w-[240px] flex-1">
                    <label
                      htmlFor="rename-view-name"
                      className="mb-1 block text-xs font-medium text-slate-600"
                    >
                      Rename view
                    </label>
                    <input
                      id="rename-view-name"
                      ref={renameInputRef}
                      type="text"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-700 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          void runRenameActiveView();
                        } else if (e.key === "Escape") {
                          e.preventDefault();
                          closeRenameComposer();
                        }
                      }}
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => void runRenameActiveView()}
                      disabled={!renameValue.trim()}
                      aria-label="Confirm rename saved view"
                    >
                      Save Name
                    </Button>

                    <Button
                      variant="secondary"
                      onClick={closeRenameComposer}
                      aria-label="Cancel rename saved view"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="flex flex-wrap items-end gap-2">
            <div className="relative min-w-[260px] flex-1">
              <label
                htmlFor="books-search"
                className="mb-1 block text-xs font-medium text-slate-300"
              >
                Search
              </label>
              <input
                id="books-search"
                ref={searchInputRef}
                type="search"
                role="combobox"
                aria-autocomplete="list"
                aria-expanded={suggestionsOpen}
                aria-haspopup="listbox"
                aria-controls={suggestionsOpen ? suggestionsId : undefined}
                aria-activedescendant={activeSuggestionId}
                aria-label="Search books"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-700 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                value={draftQuery}
                placeholder="Search by title, author, series, genre, ISBN…"
                onChange={(e) => {
                  const val = e.target.value;
                  setDraftQuery(val);
                  buildSuggestions(val);
                  setShowSuggest(true);
                }}
                onFocus={() => {
                  buildSuggestions(draftQuery);
                  if (draftQuery.trim()) setShowSuggest(true);
                }}
                onBlur={() => {
                  window.setTimeout(() => setShowSuggest(false), 100);
                }}
                onKeyDown={(e) => {
                  if (suggestionsOpen) {
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setActiveSuggestion((i) =>
                        Math.min(i < 0 ? 0 : i + 1, suggestions.length - 1),
                      );
                      return;
                    }

                    if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setActiveSuggestion((i) => Math.max(i - 1, -1));
                      return;
                    }

                    if (e.key === "Enter" && activeSuggestion >= 0) {
                      e.preventDefault();
                      pickSuggestion(suggestions[activeSuggestion]);
                      return;
                    }

                    if (e.key === "Escape") {
                      e.preventDefault();
                      setShowSuggest(false);
                      return;
                    }
                  }

                  if (e.key === "Enter") {
                    e.preventDefault();
                    commitNow();
                  } else if (e.key === "Escape") {
                    if (draftQuery.trim()) {
                      e.preventDefault();
                      clearQuery();
                    }
                  } else if (e.key === "ArrowDown") {
                    e.preventDefault();
                    onFocusResults();
                  }
                }}
              />

              {suggestionsOpen ? (
                <div
                  id={suggestionsId}
                  role="listbox"
                  aria-label="Search suggestions"
                  className="absolute z-20 mt-1 w-full rounded-md border border-slate-200 bg-white text-slate-700 shadow-lg"
                >
                  {suggestions.map((s, i) => (
                    <div
                      key={`${s}-${i}`}
                      id={`${suggestionsId}-option-${i}`}
                      role="option"
                      aria-selected={i === activeSuggestion}
                      className={`cursor-pointer px-3 py-2 text-sm ${
                        i === activeSuggestion ? "bg-slate-100" : ""
                      }`}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        pickSuggestion(s);
                      }}
                      onMouseEnter={() => setActiveSuggestion(i)}
                    >
                      {s}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            {hasUncommittedChange ? (
              <Button
                onClick={commitNow}
                data-focus-id="books:search"
                aria-label="Run search"
              >
                Search
              </Button>
            ) : null}

            <Button
              variant="secondary"
              disabled={!draftQuery.trim()}
              onClick={clearQuery}
              data-focus-id="books:clear-search"
              aria-label="Clear search"
            >
              Clear
            </Button>

            <Button
              ref={addButtonRef}
              onClick={onAddBook}
              data-focus-id="book:add"
              aria-label="Add book"
            >
              Add book
            </Button>
          </div>
        </div>
      </div>

      {selectedCount > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
          <div className="text-sm font-medium text-slate-700">
            {selectedCount === 1
              ? "1 book selected"
              : `${selectedCount} books selected`}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              disabled={bulkBusy}
              onClick={() => runBulkStatusUpdate("planned")}
              aria-label="Mark selected books as planned"
            >
              Mark Planned
            </Button>

            <Button
              variant="secondary"
              disabled={bulkBusy}
              onClick={() => runBulkStatusUpdate("reading")}
              aria-label="Mark selected books as reading"
            >
              Mark Reading
            </Button>

            <Button
              variant="secondary"
              disabled={bulkBusy}
              onClick={() => runBulkStatusUpdate("finished")}
              aria-label="Mark selected books as finished"
            >
              Mark Finished
            </Button>

            <Button
              variant="danger"
              disabled={bulkBusy}
              onClick={runBulkDelete}
              aria-label="Delete selected books"
            >
              {isBulkDeleting ? "Deleting…" : "Delete Selected"}
            </Button>

            <Button
              variant="secondary"
              disabled={bulkBusy}
              onClick={clearSelection}
              aria-label="Clear selected books"
            >
              Clear Selection
            </Button>
          </div>
        </div>
      ) : null}

      <div className="flex items-center justify-between">
        <SearchStatus text={statusText} />
        <div />
      </div>
    </div>
  );
}
