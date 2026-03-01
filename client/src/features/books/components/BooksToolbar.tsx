import { useEffect, useMemo, useState } from "react";
import type React from "react";
import { Button } from "../../../shared/ui/Button";
import { SearchStatus } from "../../../shared/ui/SearchStatus";
import type { BooksFilters } from "../types";

export function BooksToolbar({
  booksTotal,
  visibleCount,
  filters,
  searchQuery,
  onCommitQuery,
  onFocusResults,
  searchInputRef,
  onAddBook,
  addButtonRef,
}: {
  booksTotal: number;
  visibleCount: number;
  filters: BooksFilters;
  searchQuery: string; // executed query
  onCommitQuery: (q: string) => void;
  onFocusResults: () => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  onAddBook: () => void;
  addButtonRef: React.RefObject<HTMLButtonElement | null>;
}) {
  // local "draft" query (v1.9-style)
  const [draftQuery, setDraftQuery] = useState(searchQuery);

  // keep draft in sync if store query changes externally (e.g., clear filters)
  useEffect(() => {
    setDraftQuery(searchQuery);
  }, [searchQuery]);

  const hasUncommittedChange = useMemo(() => {
    return draftQuery.trim() !== searchQuery.trim();
  }, [draftQuery, searchQuery]);

  const filtersActive =
    filters.status.length > 0 ||
    filters.authors.length > 0 ||
    filters.genres.length > 0 ||
    filters.series.length > 0 ||
    filters.tbrOnly ||
    !!filters.tbrMonth;

  const statusText = (() => {
    const q = searchQuery.trim();
    const x = visibleCount; // after filters + search
    const y = booksTotal; // total books

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

  const commitNow = () => onCommitQuery(draftQuery.trim());

  const clearQuery = () => {
    setDraftQuery("");
    onCommitQuery("");
    queueMicrotask(() => searchInputRef.current?.focus());
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Books</h1>

        <div className="flex items-center gap-2">
          <input
            ref={searchInputRef}
            className="w-72 rounded-md border px-3 py-2 text-slate-700 text-sm"
            value={draftQuery}
            placeholder="Search by title, author, series, genre, ISBN…"
            onChange={(e) => {
              setDraftQuery(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commitNow();
              } else if (e.key === "Escape" && draftQuery) {
                e.preventDefault();
                clearQuery();
              } else if (e.key === "ArrowDown") {
                e.preventDefault();
                onFocusResults();
              }
            }}
          />

          <Button
            variant={hasUncommittedChange ? "primary" : "secondary"}
            disabled={!hasUncommittedChange}
            onClick={() => commitNow()}
          >
            Search
          </Button>

          <Button
            variant="secondary"
            disabled={!draftQuery.trim()}
            onClick={clearQuery}
          >
            Clear
          </Button>

          <Button ref={addButtonRef} onClick={onAddBook}>
            Add book
          </Button>
        </div>
      </div>

      {/* status row */}
      <div className="flex items-center justify-between">
        <SearchStatus text={statusText} />
        <div />
      </div>
    </div>
  );
}
