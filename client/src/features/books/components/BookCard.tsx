import type { Book } from "../types";

const STATUS_LABEL: Record<string, string> = {
  planned: "Planned",
  reading: "Reading",
  finished: "Finished",
};

export function BookCard({ book }: { book: Book }) {
  const bits: string[] = [];

  if (book.series) bits.push(`Series: ${book.series}`);
  else if (book.seriesType === "standalone") bits.push("Standalone");

  if (book.genre) bits.push(`Genre: ${book.genre}`);

  if (book.format) {
    bits.push(
      book.formatSubtype
        ? `Format: ${book.format} — ${book.formatSubtype}`
        : `Format: ${book.format}`,
    );
  }

  if (book.isbn) bits.push(`ISBN ${book.isbn}`);
  if (book.plannedMonth) bits.push(`TBR: ${book.plannedMonth}`);

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="truncate font-medium">{book.title}</div>
        <div className="truncate text-sm text-slate-400">
          {book.author ?? "Unknown author"}
        </div>

        {bits.length ? (
          <div className="mt-1 text-xs text-slate-400">{bits.join(" • ")}</div>
        ) : null}
      </div>

      <div className="shrink-0 text-xs text-slate-400">
        Status: {STATUS_LABEL[book.status] ?? book.status}
      </div>
    </div>
  );
}
