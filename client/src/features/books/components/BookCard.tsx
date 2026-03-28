import { useEffect, useMemo, useRef, useState } from "react";
import type { Book, BookStatus } from "../types";
import { Button } from "../../../shared/ui/Button";
import { useBooksStore } from "../store/books.store";
import {
  captureFocusToken,
  restoreFocus,
  type FocusToken,
} from "../../../shared/a11y/focus";

import { getHighlightParts, getHighlightTokens } from "../search/highlight";

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

export function BookCard({
  book,
  searchQuery,
  isSelected,
  onToggleSelected,
}: {
  book: Book;
  searchQuery: string;
  isSelected: boolean;
  onToggleSelected: () => void;
}) {
  const updateBook = useBooksStore((s) => s.updateBook);
  const finishBook = useBooksStore((s) => s.finishBook);
  const deleteBook = useBooksStore((s) => s.deleteBook);
  const setError = useBooksStore((s) => s.setError);

  const [isEditing, setIsEditing] = useState(false);

  const [title, setTitle] = useState(book.title);
  const [author, setAuthor] = useState(book.author);
  const [status, setStatus] = useState<BookStatus>(book.status);

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const titleRef = useRef<HTMLInputElement | null>(null);
  const editBtnRef = useRef<HTMLButtonElement | null>(null);
  const deleteBtnRef = useRef<HTMLButtonElement | null>(null);
  const lastFocusRef = useRef<FocusToken>({ kind: "none" });

  const [showSaved, setShowSaved] = useState(false);
  const savedTimerRef = useRef<number | null>(null);

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
    lastFocusRef.current = captureFocusToken();
    setLocalError(null);
    setError(undefined);

    setShowSaved(false);
    if (savedTimerRef.current) window.clearTimeout(savedTimerRef.current);

    setTitle(book.title);
    setAuthor(book.author);
    setStatus(book.status);

    setIsEditing(true);

    window.setTimeout(() => titleRef.current?.focus(), 0);
  }

  function cancelEdit() {
    setLocalError(null);
    setIsEditing(false);
    setTitle(book.title);
    setAuthor(book.author);
    setStatus(book.status);

    restoreFocus(lastFocusRef.current, {
      fallbackSelectors: [`[data-focus-id="book:${book.id}:edit"]`],
      deferMs: 0,
    });
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

      setShowSaved(true);
      if (savedTimerRef.current) window.clearTimeout(savedTimerRef.current);
      savedTimerRef.current = window.setTimeout(() => {
        setShowSaved(false);
      }, 1200);

      setError(undefined);

      restoreFocus(
        {
          kind: "selector",
          selector: `[data-focus-id="book:${book.id}:edit"]`,
        },
        {
          fallbackSelectors: [`[data-focus-id="book:${book.id}:edit"]`],
          deferMs: 0,
        },
      );
    } catch (e) {
      const msg = (e as Error)?.message ?? "Failed to save changes.";
      setLocalError(msg);
      setError({ message: msg });
    } finally {
      setIsSaving(false);
    }
  }

  async function onDelete() {
    lastFocusRef.current = captureFocusToken();

    const ok = window.confirm(`Delete "${book.title}"?`);
    if (!ok) {
      restoreFocus(lastFocusRef.current, {
        fallbackSelectors: [`[data-focus-id="book:${book.id}:delete"]`],
        deferMs: 0,
      });
      return;
    }

    setLocalError(null);
    setError(undefined);

    try {
      setIsDeleting(true);
      const did = await deleteBook(book.id);
      if (!did) throw new Error("Failed to delete book.");
    } catch (e) {
      const msg = (e as Error)?.message ?? "Failed to delete book.";
      setLocalError(msg);
      setError({ message: msg });
    } finally {
      setIsDeleting(false);
    }
  }

  async function onFinish() {
    lastFocusRef.current = captureFocusToken();

    setLocalError(null);
    setError(undefined);

    try {
      setIsFinishing(true);
      const saved = await finishBook(book.id);
      if (!saved) throw new Error("Failed to mark book as finished.");
    } catch (e) {
      const msg = (e as Error)?.message ?? "Failed to mark book as finished.";
      setLocalError(msg);
      setError({ message: msg });
    } finally {
      setIsFinishing(false);
    }
  }

  const isTitleInvalid =
    !!localError && trimOrEmpty(title).length === 0 && isEditing;
  const isAuthorInvalid =
    !!localError && trimOrEmpty(author).length === 0 && isEditing;

  const hasCommittedSearch = searchQuery.trim().length > 0;

  const highlightTokens = useMemo(() => {
    if (!hasCommittedSearch) return [];
    return getHighlightTokens(searchQuery);
  }, [hasCommittedSearch, searchQuery]);

  function renderHighlighted(text: string) {
    if (!hasCommittedSearch) return text;

    const parts = getHighlightParts(text, highlightTokens);

    return (
      <>
        {parts.map((part, i) =>
          part.match ? (
            <mark key={`${text}-${i}`}>{part.text}</mark>
          ) : (
            <span key={`${text}-${i}`}>{part.text}</span>
          ),
        )}
      </>
    );
  }

  const selectionDisabled = isEditing || isSaving || isDeleting || isFinishing;

  return (
    <div className="flex items-start gap-3">
      <div className="pt-1">
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggleSelected}
            disabled={selectionDisabled}
            aria-label={`Select ${book.title}`}
            className="h-4 w-4 rounded border-slate-300 text-slate-600 focus:ring-2 focus:ring-slate-300"
          />
        </label>
      </div>

      <div className="flex min-w-0 flex-1 items-start justify-between gap-4">
        <div className="min-w-0">
          {isEditing ? (
            <div className="grid gap-2">
              <label className="grid gap-1">
                <span className="text-xs font-medium text-slate-400">
                  Title *
                </span>
                <input
                  ref={titleRef}
                  className="h-9 w-full rounded-md border border-slate-300 text-slate-600 px-3 text-sm outline-none focus:ring-2 focus:ring-slate-300"
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
                <span className="text-xs font-medium text-slate-400">
                  Author *
                </span>
                <input
                  className="h-9 w-full rounded-md border border-slate-300 text-slate-600 px-3 text-sm outline-none focus:ring-2 focus:ring-slate-300"
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
                <span className="text-xs font-medium text-slate-400">
                  Status
                </span>
                <select
                  className="h-9 w-full rounded-md border border-slate-300 text-slate-600 px-3 text-sm outline-none focus:ring-2 focus:ring-slate-300"
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
              <div className="truncate font-medium">
                {renderHighlighted(book.title)}
              </div>
              <div className="truncate text-sm text-slate-400">
                {renderHighlighted(book.author)}
              </div>

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
                  aria-label={`Cancel edit for ${book.title}`}
                >
                  Cancel
                </Button>
                <Button
                  onClick={saveEdit}
                  disabled={!canSave || isSaving || !hasChanges}
                  aria-busy={isSaving}
                  aria-label={`Save changes for ${book.title}`}
                >
                  {isSaving ? "Saving…" : "Save"}
                </Button>
              </>
            ) : (
              <>
                <Button
                  ref={editBtnRef}
                  variant="secondary"
                  onClick={beginEdit}
                  disabled={isDeleting || isFinishing}
                  data-focus-id={`book:${book.id}:edit`}
                  aria-label={`Edit ${book.title}`}
                >
                  Edit
                </Button>

                {book.status !== "finished" ? (
                  <Button
                    onClick={onFinish}
                    disabled={isDeleting || isFinishing}
                    aria-busy={isFinishing}
                    aria-label={`Mark ${book.title} as finished`}
                  >
                    {isFinishing ? "Finishing…" : "Mark Finished"}
                  </Button>
                ) : null}

                <Button
                  ref={deleteBtnRef}
                  variant="danger"
                  onClick={onDelete}
                  disabled={isDeleting || isFinishing}
                  aria-busy={isDeleting}
                  data-focus-id={`book:${book.id}:delete`}
                  aria-label={`Delete ${book.title}`}
                >
                  {isDeleting ? "Deleting…" : "Delete"}
                </Button>
              </>
            )}
          </div>

          {isSelected && !isEditing ? (
            <div className="mt-2 text-xs font-medium text-slate-500">
              Selected
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
