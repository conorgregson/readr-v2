import { useMemo } from "react";
import type { Book, BooksFilters, BookStatus } from "../types";

function uniqSorted(values: Array<string | undefined>): string[] {
  const set = new Set(values.map((v) => (v ?? "").trim()).filter(Boolean));
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

const STATUS_OPTIONS: Array<{ value: BookStatus; label: string }> = [
  { value: "planned", label: "Planned" },
  { value: "reading", label: "Reading" },
  { value: "finished", label: "Finished" },
];

export function BooksFiltersPanel({
  books,
  filters,
  onChange,
  onClear,
}: {
  books: Book[];
  filters: BooksFilters;
  onChange: (next: Partial<BooksFilters>) => void;
  onClear: () => void;
}) {
  const authorOptions = useMemo(
    () => uniqSorted(books.map((b) => b.author)),
    [books],
  );
  const genreOptions = useMemo(
    () => uniqSorted(books.map((b) => b.genre)),
    [books],
  );
  const seriesOptions = useMemo(
    () => uniqSorted(books.map((b) => b.series)),
    [books],
  );

  const setMulti = (
    key: "status" | "authors" | "genres" | "series",
    selected: string[],
  ) => onChange({ [key]: selected } as Partial<BooksFilters>);

  const readMulti = (e: React.ChangeEvent<HTMLSelectElement>) =>
    Array.from(e.target.selectedOptions).map((o) => o.value);

  return (
    <div className="rounded border p-3 space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-slate-200">Filters</div>
        <button
          type="button"
          className="text-sm text-slate-300 hover:text-slate-200"
          onClick={onClear}
        >
          Clear filters
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {/* Status */}
        <label className="space-y-1">
          <div className="text-xs text-slate-300">Status</div>
          <select
            multiple
            className="w-full rounded border px-2 py-1 text-slate-700 text-sm min-h-[96px]"
            value={filters.status}
            onChange={(e) => setMulti("status", readMulti(e))}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>

        {/* Authors */}
        <label className="space-y-1">
          <div className="text-xs text-slate-300">Authors</div>
          <select
            multiple
            className="w-full rounded border px-2 py-1 text-slate-700 text-sm min-h-[96px]"
            value={filters.authors}
            onChange={(e) => setMulti("authors", readMulti(e))}
          >
            {authorOptions.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </label>

        {/* Genres */}
        <label className="space-y-1">
          <div className="text-xs text-slate-300">Genres</div>
          <select
            multiple
            className="w-full rounded border px-2 py-1 text-slate-700 text-sm min-h-[96px]"
            value={filters.genres}
            onChange={(e) => setMulti("genres", readMulti(e))}
          >
            {genreOptions.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </label>

        {/* Series */}
        <label className="space-y-1">
          <div className="text-xs text-slate-300">Series</div>
          <select
            multiple
            className="w-full rounded border px-2 py-1 text-slate-700 text-sm min-h-[96px]"
            value={filters.series}
            onChange={(e) => setMulti("series", readMulti(e))}
          >
            {seriesOptions.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </label>

        {/* TBR */}
        <div className="space-y-2">
          <div className="text-xs text-slate-300">TBR</div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={filters.tbrOnly}
              onChange={(e) => onChange({ tbrOnly: e.target.checked })}
            />
            Only planned month
          </label>

          <label className="space-y-1">
            <div className="text-xs text-slate-300">Month</div>
            <input
              type="month"
              className="w-full rounded border px-2 py-1 text-sm"
              value={filters.tbrMonth}
              disabled={!filters.tbrOnly}
              onChange={(e) => onChange({ tbrMonth: e.target.value })}
            />
          </label>

          {!filters.tbrOnly && filters.tbrMonth ? (
            <div className="text-xs text-amber-600">
              Month is ignored unless “Only planned month” is checked.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
