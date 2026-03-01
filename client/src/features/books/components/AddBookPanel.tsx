import { useEffect, useMemo, useRef, useState } from "react";
import type { Book, BookStatus } from "../types";

import { Button } from "../../../shared/ui/Button";

type CreateBookInput = Omit<Book, "id" | "createdAt" | "updatedAt">;

type Props = {
  onClose: () => void;
  onSubmit: (input: CreateBookInput) => Promise<void> | void;
};

const statusOptions: { value: BookStatus; label: string }[] = [
  { value: "planned", label: "Planned" },
  { value: "reading", label: "Reading" },
  { value: "finished", label: "Finished" },
];

function trimOrEmpty(s: string) {
  return s.trim();
}

export function AddBookPanel({ onClose, onSubmit }: Props) {
  const titleRef = useRef<HTMLInputElement | null>(null);

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [status, setStatus] = useState<BookStatus>("planned");

  const [genre, setGenre] = useState("");
  const [series, setSeries] = useState("");
  const [isbn, setIsbn] = useState("");
  const [plannedMonth, setPlannedMonth] = useState(""); // YYYY-MM

  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const canSave = useMemo(() => {
    return trimOrEmpty(title).length > 0 && trimOrEmpty(author).length > 0;
  }, [title, author]);

  useEffect(() => {
    // Focus first field on open
    titleRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  async function handleSubmit() {
    setError(null);

    const t = trimOrEmpty(title);
    const a = trimOrEmpty(author);

    if (!t) return setError("Title is required.");
    if (!a) return setError("Author is required.");

    const input: CreateBookInput = {
      title: t,
      author: a,
      status,
      genre: trimOrEmpty(genre) || undefined,
      series: trimOrEmpty(series) || undefined,
      isbn: trimOrEmpty(isbn) || undefined,
      plannedMonth: trimOrEmpty(plannedMonth) || undefined,
      seriesType: undefined,
      format: undefined,
      formatSubtype: undefined,
      startedAt: undefined,
      finishedAt: undefined,
    };

    try {
      setIsSaving(true);
      await onSubmit(input);
    } catch (e) {
      setError((e as Error)?.message ?? "Failed to add book.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Add book</h2>
          <p className="text-sm text-slate-600">
            Title and author are required.
          </p>
        </div>

        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </div>

      <div className="mt-4 grip gap-3">
        <label className="grid gap-1">
          <span className="text-sm font-medium text-slate-700">Title *</span>
          <input
            ref={titleRef}
            className="h-10 rounded-md border border-slate-300 text-slate-600 px-3 outline-none focus:ring-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
            }}
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium text-slate-700">Author *</span>
          <input
            className="h-10 rounded-md border border-slate-300 text-slate-600 px-3 outline-none focus:ring-2"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
            }}
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium text-slate-700">Status</span>
          <select
            className="h-10 rounded-md border border-slate-300 text-slate-600 px-3 outline-none focus:ring-2"
            value={status}
            onChange={(e) => setStatus(e.target.value as BookStatus)}
          >
            {statusOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <label className="grid gap-1">
            <span className="text-sm font-medium text-slate-700">Genre</span>
            <input
              className="h-10 rounded-md border border-slate-300 text-slate-600 px-3 outline-none focus:ring-2"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-medium text-slate-700">Series</span>
            <input
              className="h-10 rounded-md border border-slate-300 text-slate-600 px-3 outline-none focus:ring-2"
              value={series}
              onChange={(e) => setSeries(e.target.value)}
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-medium text-slate-700">ISBN</span>
            <input
              className="h-10 rounded-md border border-slate-300 text-slate-600 px-3 outline-none focus:ring-2"
              value={isbn}
              onChange={(e) => setIsbn(e.target.value)}
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-medium text-slate-700">
              Planned month
            </span>
            <input
              type="month"
              className="h-10 rounded-md border border-slate-300 text-slate-600 px-3 outline-none focus:ring-2"
              value={plannedMonth}
              onChange={(e) => setPlannedMonth(e.target.value)}
            />
          </label>
        </div>

        {error ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="mt-1 flex items-center justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSave || isSaving}>
            {isSaving ? "Saving…" : "Add book"}
          </Button>
        </div>
      </div>
    </div>
  );
}
