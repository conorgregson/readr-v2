import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../../../shared/ui/Button";
import { useBooksStore } from "../../books/store/books.store";
import { useSessionsStore } from "../store/sessions.store";
import type { Session } from "../types";
import { captureFocusToken, restoreFocus } from "../../../shared/a11y/focus";

function parseOptionalPosInt(
  s: string,
): number | undefined | "INVALID" | "NEGATIVE" {
  const t = s.trim();
  if (!t) return undefined;
  const n = Number(t);
  if (!Number.isFinite(n)) return "INVALID";
  const v = Math.floor(n);
  if (v < 0) return "NEGATIVE";
  return v <= 0 ? undefined : v;
}

function norm(s: string) {
  return s.trim().toLowerCase();
}

function splitTokens(q?: string) {
  return norm(q ?? "")
    .split(/\s+/)
    .filter(Boolean);
}

function highlight(text: string, q?: string) {
  const tokens = splitTokens(q);
  if (!tokens.length) return text;

  // For highlight parity (safe, no innerHTML), simple multi-token OR highlight.
  // Keep it stable: compute matches for the earliest token occurrences.
  const lower = text.toLowerCase();

  // Build ranges
  const ranges: Array<{ start: number; end: number }> = [];
  for (const t of tokens) {
    let i = 0;
    while (i < lower.length) {
      const idx = lower.indexOf(t, i);
      if (idx === -1) break;
      ranges.push({ start: idx, end: idx + t.length });
      i = idx + t.length;
    }
  }
  if (!ranges.length) return text;

  // Merge ranges
  ranges.sort((a, b) => a.start - b.start || a.end - b.end);
  const merged: Array<{ start: number; end: number }> = [];
  for (const r of ranges) {
    const last = merged[merged.length - 1];
    if (!last || r.start > last.end) merged.push({ ...r });
    else last.end = Math.max(last.end, r.end);
  }

  // Render parts
  const out: React.ReactNode[] = [];
  let cursor = 0;
  for (const r of merged) {
    if (cursor < r.start) out.push(text.slice(cursor, r.start));
    out.push(
      <mark key={`${r.start}-${r.end}`} className="rounded px-1">
        {text.slice(r.start, r.end)}
      </mark>,
    );
    cursor = r.end;
  }
  if (cursor < text.length) out.push(text.slice(cursor));
  return <>{out}</>;
}

export function SessionsRow({
  session,
  query,
  isSelected,
  onSelect,
  setRowRef,
}: {
  session: Session;
  query?: string;
  isSelected: boolean;
  onSelect: () => void;
  setRowRef: (el: HTMLTableRowElement | null) => void;
}) {
  const books = useBooksStore((s) => s.books);
  const updateSession = useSessionsStore((s) => s.updateSession);
  const deleteSession = useSessionsStore((s) => s.deleteSession);

  const bookOptions = useMemo(
    () =>
      [...books]
        .slice()
        .sort((a, b) => a.title.localeCompare(b.title))
        .map((b) => ({ id: b.id, label: `${b.title} — ${b.author}` })),
    [books],
  );

  const book = useMemo(
    () => books.find((b) => b.id === session.bookId),
    [books, session.bookId],
  );

  const [isEditing, setIsEditing] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [bookId, setBookId] = useState(session.bookId);
  const [date, setDate] = useState(session.date);
  const [pages, setPages] = useState(session.pages?.toString() ?? "");
  const [minutes, setMinutes] = useState(session.minutes?.toString() ?? "");
  const [notes, setNotes] = useState(session.notes ?? "");

  const firstFieldRef = useRef<HTMLSelectElement | null>(null);
  const editBtnRef = useRef<HTMLButtonElement | null>(null);
  const lastFocusRef = useRef<ReturnType<typeof captureFocusToken>>({
    kind: "none",
  });

  // Keep local state in sync if store changes (rare but safe)
  useEffect(() => {
    if (isEditing) return;
    setBookId(session.bookId);
    setDate(session.date);
    setPages(session.pages?.toString() ?? "");
    setMinutes(session.minutes?.toString() ?? "");
    setNotes(session.notes ?? "");
  }, [isEditing, session]);

  async function onSave() {
    setLocalError(null);

    const safeBookId = String(bookId || "").trim();
    const safeDate = String(date || "").trim();

    if (!safeBookId) {
      setLocalError("Book is required.");
      queueMicrotask(() => firstFieldRef.current?.focus());
      return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(safeDate)) {
      setLocalError("Date must be in YYYY-MM-DD format.");
      return;
    }

    const p = parseOptionalPosInt(pages);
    const m = parseOptionalPosInt(minutes);

    if (p === "NEGATIVE" || m === "NEGATIVE") {
      setLocalError("Minutes and pages cannot be negative.");
      return;
    }
    if (p === "INVALID" || m === "INVALID") {
      setLocalError("Minutes and pages must be whole numbers.");
      return;
    }

    if (!p && !m) {
      setLocalError("Enter minutes or pages.");
      return;
    }

    try {
      setIsSaving(true);
      const saved = await updateSession(session.id, {
        bookId: safeBookId,
        date: safeDate,
        pages: p,
        minutes: m,
        notes: notes.trim() || undefined,
      });

      if (!saved) {
        setLocalError("Failed to update session.");
        return;
      }

      setIsEditing(false);
      // Sprint 8: restore focus to Edit button after save.
      window.setTimeout(() => {
        if (editBtnRef.current) editBtnRef.current.focus();
        else restoreFocus(lastFocusRef.current, { deferMs: 0 });
      }, 0);
    } finally {
      setIsSaving(false);
    }
  }

  async function onDelete() {
    setLocalError(null);

    lastFocusRef.current = captureFocusToken();
    const ok = confirm("Delete this session? You can undo for ~6 seconds.");
    if (!ok) {
      // Restore focus after canceling confirm (no focus loss).
      restoreFocus(lastFocusRef.current, { deferMs: 0 });
      return;
    }

    try {
      setIsDeleting(true);
      const deleted = await deleteSession(session.id);
      if (!deleted) setLocalError("Failed to delete session.");
    } finally {
      setIsDeleting(false);
    }
  }

  function onCancel() {
    setLocalError(null);
    setIsEditing(false);
    setBookId(session.bookId);
    setDate(session.date);
    setPages(session.pages?.toString() ?? "");
    setMinutes(session.minutes?.toString() ?? "");
    setNotes(session.notes ?? "");

    // Sprint 8: restore focus to Edit button after cancel.
    window.setTimeout(() => {
      if (editBtnRef.current) editBtnRef.current.focus();
      else restoreFocus(lastFocusRef.current, { deferMs: 0 });
    }, 0);
  }

  const details = [
    typeof session.minutes === "number" ? `${session.minutes} min` : null,
    typeof session.pages === "number" ? `${session.pages} pages` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <tr
      id={`session-row-${session.id}`}
      data-focus-id={`session:${session.id}:row`}
      ref={setRowRef}
      role="row"
      aria-label={`Session ${session.date}`}
      className={`border-t border-slate-100 align-top outline-none ${
        isSelected ? "bg-slate-700" : ""
      }`}
      aria-selected={isSelected}
      tabIndex={isSelected ? 0 : -1}
      data-session-row-id={session.id}
      onClick={() => {
        if (!isEditing) onSelect();
      }}
      onFocus={() => {
        if (!isEditing) onSelect();
      }}
    >
      {/* Date */}
      <td className="py-2 pr-3 whitespace-nowrap">
        {isEditing ? (
          <input
            type="date"
            aria-label="Session date"
            className="h-9 w-[160px] rounded-md border border-slate-300 px-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-slate-400"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") onCancel();
              if (e.key === "Enter") void onSave();
            }}
          />
        ) : (
          <span className="text-slate-300">
            {highlight(session.date, query)}
          </span>
        )}
      </td>

      {/* Book */}
      <td className="py-2 pr-3">
        {isEditing ? (
          <select
            ref={firstFieldRef}
            aria-label="Book"
            className="h-9 w-[320px] max-w-full rounded-md border border-slate-300 px-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-slate-400"
            value={bookId}
            onChange={(e) => setBookId(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") onCancel();
            }}
          >
            <option value="">Select a book…</option>
            {bookOptions.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        ) : book ? (
          <div className="flex flex-col">
            <span className="font-medium text-slate-300">
              {highlight(book.title, query)}
            </span>
            <span className="text-xs text-slate-400">
              {highlight(book.author, query)}
            </span>
          </div>
        ) : (
          <span className="text-slate-400">Unknown book</span>
        )}
      </td>

      {/* Details */}
      <td className="py-2 pr-3 whitespace-nowrap">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              step={1}
              inputMode="numeric"
              aria-label="Pages read"
              className="h-9 w-[90px] rounded-md border border-slate-300 px-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-slate-400"
              placeholder="Pages"
              value={pages}
              onChange={(e) => setPages(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") onCancel();
                if (e.key === "Enter") void onSave();
              }}
            />
            <input
              type="number"
              min={0}
              step={1}
              inputMode="numeric"
              aria-label="Minutes read"
              className="h-9 w-[90px] rounded-md border border-slate-300 px-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-slate-400"
              placeholder="Min"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") onCancel();
                if (e.key === "Enter") void onSave();
              }}
            />
          </div>
        ) : (
          <span className="text-slate-300">
            {highlight(details || "—", query)}
          </span>
        )}
      </td>

      {/* Notes + Actions */}
      <td className="py-2">
        {isEditing ? (
          <div className="grid gap-2">
            <textarea
              aria-label="Notes"
              className="min-h-[56px] w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-slate-400"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") onCancel();
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  void onSave();
                }
              }}
            />

            {localError ? (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {localError}
              </div>
            ) : null}

            <div className="flex items-center justify-end gap-2">
              <Button
                variant="secondary"
                onClick={onCancel}
                disabled={isSaving || isDeleting}
              >
                Cancel
              </Button>
              <Button
                onClick={() => void onSave()}
                disabled={isSaving || isDeleting}
                aria-busy={isSaving}
              >
                {isSaving ? "Saving…" : "Save"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 text-slate-300">
              {session.notes ? highlight(session.notes, query) : "—"}
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Button
                ref={editBtnRef}
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect();
                  lastFocusRef.current = captureFocusToken();
                  setIsEditing(true);
                  window.setTimeout(() => firstFieldRef.current?.focus(), 0);
                }}
                aria-label="Edit session"
              >
                Edit
              </Button>
              <Button
                variant="danger"
                onClick={(e) => {
                  e.stopPropagation();
                  void onDelete();
                }}
                disabled={isDeleting}
                aria-label="Delete session"
              >
                {isDeleting ? "Deleting…" : "Delete"}
              </Button>
            </div>
          </div>
        )}
      </td>
    </tr>
  );
}
