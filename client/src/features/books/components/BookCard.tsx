import { useEffect, useMemo, useRef, useState } from "react";
import type { Book, BookStatus } from "../types";
import { Button } from "../../../shared/ui/Button";
import { useBooksStore } from "../store/books.store";

const STATUS_LABEL: Record<BookStatus, string> = {
  planned: "Planned",
  reading: "Reading",
  finished: "Finished",
};

function trimOrEmpty(s: string) {
  return s.trim();
}

function formatDate(iso?: string) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return null;
  }
}

export function BookCard({ book }: { book: Book }) {
  const updateBook = useBooksStore((s) => s.updateBook);
  const setError = useBooksStore((s) => s.setError);

  const [isEditing, setIsEditing] = useState(false);

  // local draft state (no leakage)
  const [title, setTitle] = useState(book.title);
  const [author, setAuthor] = useState(book.author);
  const [status, setStatus] = useState<BookStatus>(book.status);

  const [isSaving, setIsSaving] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const titleRef = useRef<HTMLInputElement | null>(null);

  const [showSaved, setShowSaved] = useState(false);
  const savedTimerRef = useRef<number | null>(null);

  // When book changes externally, keep draft in sync (only if not editing)
  useEffect(() => {
    if (isEditing) return;
    setTitle(book.title);
    setAuthor(book.author);
    setStatus(book.status);
  }, [book.title, book.author, book.status, isEditing]);

  useEffect(() => {
    return () => {
      if (savedTimerRef.current) window.clearTimeout(savedTimerRef.current);
    };
  }, []);

  const startedLabel = formatDate(book.startedAt);
  const finishedLabel = formatDate(book.finishedAt);

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

  const hasChanges = useMemo(() => {
    return (
      trimOrEmpty(title) !== trimOrEmpty(book.title) ||
      trimOrEmpty(author) !== trimOrEmpty(book.author) ||
      status !== book.status
    );
  }, [title, author, status, book.title, book.author, book.status]);

  const canSave = useMemo(() => {
    return trimOrEmpty(title).length > 0 && trimOrEmpty(author).length > 0;
  }, [title, author]);

  function beginEdit() {
    setLocalError(null);
    setError(undefined);

    // Clear any prior "Saved" toast when entering edit
    setShowSaved(false);
    if (savedTimerRef.current) window.clearTimeout(savedTimerRef.current);

    // Ensure drafts match latest persisted values at edit start
    setTitle(book.title);
    setAuthor(book.author);
    setStatus(book.status);

    setIsEditing(true);

    // focus the title field next tick
    queueMicrotask(() => titleRef.current?.focus());
  }

  function cancelEdit() {
    setLocalError(null);
    setIsEditing(false);
    // revert draft to current persisted book
    setTitle(book.title);
    setAuthor(book.author);
    setStatus(book.status);
  }

  async function saveEdit() {
    setLocalError(null);
    setError(undefined);

    const t = trimOrEmpty(title);
    const a = trimOrEmpty(author);

    if (!t) return setLocalError("Title is required.");
    if (!a) return setLocalError("Author is required.");

    if (!hasChanges) {
      setIsEditing(false);
      return;
    }

    try {
      setIsSaving(true);

      const saved = await updateBook(book.id, {
        title: t,
        author: a,
        status,
      });

      if (!saved) throw new Error("Failed to save changes.");

      setIsEditing(false);

      // Subtle saved micro-feedback
      setShowSaved(true);
      if (savedTimerRef.current) window.clearTimeout(savedTimerRef.current);
      savedTimerRef.current = window.setTimeout(() => {
        setShowSaved(false);
      }, 1200);

      setError(undefined);
    } catch (e) {
      const msg = (e as Error)?.message ?? "Failed to save changes.";
      setLocalError(msg);
      setError({ message: msg });
    } finally {
      setIsSaving(false);
    }
  }

  const isTitleInvalid =
    !!localError && trimOrEmpty(title).length === 0 && isEditing;
  const isAuthorInvalid =
    !!localError && trimOrEmpty(author).length === 0 && isEditing;

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        {isEditing ? (
          <div className="grid gap-2">
            <label className="grid gap-1">
              <span className="text-xs font-medium text-slate-500">
                Title *
              </span>
              <input
                ref={titleRef}
                className="h-9 w-full rounded-md border border-slate-300 text-slate-600 px-3 text-sm outline-none focus:ring-2"
                value={title}
                aria-invalid={isTitleInvalid}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    saveEdit();
                  } else if (e.key === "Escape") {
                    e.preventDefault();
                    cancelEdit();
                  }
                }}
              />
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-medium text-slate-500">
                Author *
              </span>
              <input
                className="h-9 w-full rounded-md border border-slate-300 text-slate-600 px-3 text-sm outline-none focus:ring-2"
                value={author}
                aria-invalid={isAuthorInvalid}
                onChange={(e) => setAuthor(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    saveEdit();
                  } else if (e.key === "Escape") {
                    e.preventDefault();
                    cancelEdit();
                  }
                }}
              />
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-medium text-slate-500">Status</span>
              <select
                className="h-9 w-full rounded-md border border-slate-300 text-slate-600 px-3 text-sm outline-none focus:ring-2"
                value={status}
                onChange={(e) => setStatus(e.target.value as BookStatus)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    e.preventDefault();
                    cancelEdit();
                  }
                }}
              >
                <option value="planned">Planned</option>
                <option value="reading">Reading</option>
                <option value="finished">Finished</option>
              </select>
            </label>

            {localError ? (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {localError}
              </div>
            ) : null}

            {bits.length ? (
              <div className="text-xs text-slate-400">{bits.join(" • ")}</div>
            ) : null}
          </div>
        ) : (
          <>
            <div className="truncate font-medium">{book.title}</div>
            <div className="truncate text-sm text-slate-400">{book.author}</div>

            {bits.length ? (
              <div className="mt-1 text-xs text-slate-400">
                {bits.join(" • ")}
              </div>
            ) : null}

            {(startedLabel || finishedLabel) && (
              <div className="mt-1 text-xs text-slate-400">
                {startedLabel ? `Started: ${startedLabel}` : null}
                {startedLabel && finishedLabel ? " • " : null}
                {finishedLabel ? `Finished: ${finishedLabel}` : null}
              </div>
            )}
          </>
        )}
      </div>

      <div className="shrink-0 text-right">
        <div className="text-xs text-slate-400">
          Status: {STATUS_LABEL[isEditing ? status : book.status]}
        </div>

        {/* aria-live: only announce when saving succeeds */}
        <div
          className={`mb-1 text-xs text-slate-500 ${
            showSaved ? "readr-saved" : "opacity-0"
          }`}
          aria-live="polite"
          role="status"
        >
          {showSaved ? "✓ Saved" : null}
        </div>

        <div className="mt-2 flex items-center justify-end gap-2">
          {isEditing ? (
            <>
              <Button
                variant="secondary"
                onClick={cancelEdit}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                onClick={saveEdit}
                disabled={!canSave || isSaving || !hasChanges}
                aria-busy={isSaving}
              >
                {isSaving ? "Saving…" : "Save"}
              </Button>
            </>
          ) : (
            <Button variant="secondary" onClick={beginEdit}>
              Edit
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
