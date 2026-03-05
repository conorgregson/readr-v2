import type React from "react";
import { useMemo } from "react";
import { Button } from "../../../shared/ui/Button";
import { useBooksStore } from "../../books/store/books.store";
import type { SessionsFilters, SessionsSortKey } from "../types";

type SessionsToolbarProps = {
  onLogSession: () => void;
  logButtonRef?: React.Ref<HTMLButtonElement>;
  totalCount: number;
  visibleCount: number;

  filters: SessionsFilters;
  sortKey: SessionsSortKey;

  onChangeFilters: (patch: Partial<SessionsFilters>) => void;
  onClearFilters: () => void;
  onChangeSort: (key: SessionsSortKey) => void;
};

export function SessionsToolbar({
  onLogSession,
  logButtonRef,
  totalCount,
  visibleCount,
  filters,
  sortKey,
  onChangeFilters,
  onClearFilters,
  onChangeSort,
}: SessionsToolbarProps) {
  const books = useBooksStore((s) => s.books);

  const bookOptions = useMemo(
    () =>
      [...books]
        .slice()
        .sort((a, b) => a.title.localeCompare(b.title))
        .map((b) => ({ id: b.id, label: `${b.title} — ${b.author}` })),
    [books],
  );

  const hasActiveFilters =
    !!filters.bookId ||
    !!filters.type ||
    !!filters.dateStart ||
    !!filters.dateEnd ||
    !!filters.search;

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-slate-400">
          {totalCount === 0
            ? "No sessions"
            : visibleCount === totalCount
              ? `${totalCount === 1 ? "1 session" : `${totalCount} sessions`}`
              : `Showing ${visibleCount} of ${totalCount}`}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={onClearFilters}
            disabled={!hasActiveFilters}
            title={!hasActiveFilters ? "No active filters" : "Clear filters"}
            aria-label="Clear session filters"
          >
            Clear
          </Button>

          <Button
            ref={logButtonRef}
            onClick={onLogSession}
            data-focus-id="sessions:log"
          >
            Log session
          </Button>
        </div>
      </div>

      <div className="grid gap-2 md:grid-cols-6">
        {/* Search */}
        <label className="grid gap-1 md:col-span-2">
          <span className="text-xs font-medium text-slate-400">Search</span>
          <input
            type="search"
            aria-label="Search sessions"
            className="h-9 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-slate-300"
            placeholder="Title, author, notes, date…"
            value={filters.search ?? ""}
            onChange={(e) => onChangeFilters({ search: e.target.value })}
          />
        </label>

        {/* Book */}
        <label className="grid gap-1 md:col-span-2">
          <span className="text-xs font-medium text-slate-400">Book</span>
          <select
            aria-label="Filter by book"
            className="h-9 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-slate-300"
            value={filters.bookId ?? ""}
            onChange={(e) =>
              onChangeFilters({ bookId: e.target.value || undefined })
            }
          >
            <option value="">All books</option>
            {bookOptions.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        {/* Type */}
        <label className="grid gap-1">
          <span className="text-xs font-medium text-slate-400">Type</span>
          <select
            aria-label="Filter by session type"
            className="h-9 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-slate-300"
            value={filters.type ?? ""}
            onChange={(e) =>
              onChangeFilters({
                type: (e.target.value as SessionsFilters["type"]) || undefined,
              })
            }
          >
            <option value="">All</option>
            <option value="pages">Pages</option>
            <option value="minutes">Minutes</option>
          </select>
        </label>

        {/* Sort */}
        <label className="grid gap-1">
          <span className="text-xs font-medium text-slate-400">Sort</span>
          <select
            aria-label="Sort sessions"
            className="h-9 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-slate-300"
            value={sortKey}
            onChange={(e) => onChangeSort(e.target.value as SessionsSortKey)}
          >
            <option value="date:desc">Newest</option>
            <option value="date:asc">Oldest</option>
          </select>
        </label>

        {/* Date range */}
        <label className="grid gap-1">
          <span className="text-xs font-medium text-slate-400">From</span>
          <input
            type="date"
            aria-label="Start date"
            className="h-9 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-slate-300"
            value={filters.dateStart ?? ""}
            onChange={(e) => {
              const nextStart = e.target.value || undefined;
              const end = filters.dateEnd;
              // If start moves past end, swap to keep a valid range
              if (nextStart && end && nextStart > end) {
                onChangeFilters({ dateStart: end, dateEnd: nextStart });
                return;
              }
              onChangeFilters({ dateStart: nextStart });
            }}
          />
        </label>

        <label className="grid gap-1">
          <span className="text-xs font-medium text-slate-400">To</span>
          <input
            type="date"
            className="h-9 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-700 outline-none focus:ring-2"
            value={filters.dateEnd ?? ""}
            onChange={(e) => {
              const nextEnd = e.target.value || undefined;
              const start = filters.dateStart;
              // If end moves before start, swap to keep a valid range
              if (nextEnd && start && nextEnd < start) {
                onChangeFilters({ dateStart: nextEnd, dateEnd: start });
                return;
              }
              onChangeFilters({ dateEnd: nextEnd });
            }}
          />
        </label>
        <div className="flex flex-wrap items-center gap-2 md:col-span-6">
          <button
            type="button"
            onClick={() =>
              onChangeFilters({
                type: filters.type === "pages" ? undefined : "pages",
              })
            }
            aria-pressed={filters.type === "pages"}
            className={`h-8 rounded-md border px-3 text-xs font-medium ${
              filters.type === "pages"
                ? "border-slate-400 bg-slate-100 text-slate-800"
                : "border-slate-200 bg-white text-slate-600"
            } outline-none focus-visible:ring-2 focus-visible:ring-slate-300`}
          >
            Pages
          </button>

          <button
            type="button"
            onClick={() =>
              onChangeFilters({
                type: filters.type === "minutes" ? undefined : "minutes",
              })
            }
            aria-pressed={filters.type === "minutes"}
            className={`h-8 rounded-md border px-3 text-xs font-medium ${
              filters.type === "minutes"
                ? "border-slate-400 bg-slate-100 text-slate-800"
                : "border-slate-200 bg-white text-slate-600"
            } outline-none focus-visible:ring-2 focus-visible:ring-slate-300`}
          >
            Minutes
          </button>
        </div>
      </div>
    </div>
  );
}
