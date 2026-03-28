import { useEffect, useMemo, useRef, useState } from "react";
import type React from "react";
import { Button } from "../../../shared/ui/Button";
import { SearchStatus } from "../../../shared/ui/SearchStatus";
import type { BooksFilters, Book } from "../types";
import { useBooksStore } from "../store/books.store";

function uniqueValues(arr: string[]) {
  return Array.from(new Set(arr.filter(Boolean))).sort((a, b) =>
    a.localeCompare(b),
  );
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
  const resultsId = "books-results";

  const selectedCount = useBooksStore((s) => s.selectedCount());
  const clearSelection = useBooksStore((s) => s.clearSelection);
  const bulkUpdateSelectedBooks = useBooksStore(
    (s) => s.bulkUpdateSelectedBooks,
  );
  const bulkDeleteSelectedBooks = useBooksStore(
    (s) => s.bulkDeleteSelectedBooks,
  );

  const [draftQuery, setDraftQuery] = useState(searchQuery);

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [showSuggest, setShowSuggest] = useState(false);
  const commitTimerRef = useRef<number | null>(null);

  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  useEffect(() => {
    setDraftQuery(searchQuery);
  }, [searchQuery]);

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

  const bulkBusy = isBulkUpdating || isBulkDeleting;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Books</h1>

        <div className="flex items-center gap-2">
          <div className="relative">
            <label className="sr-only" htmlFor="books-search">
              Search books
            </label>
            <input
              id="books-search"
              ref={searchInputRef}
              type="search"
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={showSuggest && suggestions.length > 0}
              aria-haspopup="listbox"
              aria-controls={resultsId}
              aria-label="Search books"
              className="w-72 rounded-md border border-slate-300 px-3 py-2 text-slate-700 text-sm outline-none focus:ring-2 focus:ring-slate-300"
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
                if (showSuggest && suggestions.length > 0) {
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

            {showSuggest && suggestions.length > 0 ? (
              <div
                role="listbox"
                className="absolute z-20 mt-1 w-72 rounded-md border border-slate-200 text-slate-700 bg-white shadow-lg"
              >
                {suggestions.map((s, i) => (
                  <div
                    key={`${s}-${i}`}
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
