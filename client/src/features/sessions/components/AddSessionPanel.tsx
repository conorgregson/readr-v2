import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../../../shared/ui/Button";
import { Card } from "../../../shared/ui/Card";

import type { CreateSessionInput, Session } from "../types";
import { useBooksStore } from "../../books/store/books.store";

function localDayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function isYyyyMmDd(s: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

// returns: number | undefined | "NEGATIVE" | "INVALID"
function parseNonNegInt(
  s: string,
): number | undefined | "NEGATIVE" | "INVALID" {
  const t = s.trim();
  if (!t) return undefined;
  const n = Number(t);
  if (!Number.isFinite(n)) return "INVALID";
  const v = Math.floor(n);
  if (v < 0) return "NEGATIVE";
  return v;
}

export function AddSessionPanel({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (input: CreateSessionInput) => Promise<Session | null>;
}) {
  const books = useBooksStore((s) => s.books);

  const bookOptions = useMemo(
    () =>
      [...books]
        .slice()
        .sort((a, b) => a.title.localeCompare(b.title))
        .map((b) => ({ id: b.id, label: `${b.title} — ${b.author}` })),
    [books],
  );

  const [bookId, setBookId] = useState<string>("");
  const [date, setDate] = useState<string>(() => localDayKey());
  const [pages, setPages] = useState<string>("");
  const [minutes, setMinutes] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const [localError, setLocalError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const bookRef = useRef<HTMLSelectElement | null>(null);
  const pagesRef = useRef<HTMLInputElement | null>(null);
  const minutesRef = useRef<HTMLInputElement | null>(null);
  const titleId = "add-session-title";
  const descId = "add-session-desc";
  const errorId = "add-session-error";

  useEffect(() => {
    // Defer is more reliable than microtask across environments/layout
    window.setTimeout(() => bookRef.current?.focus(), 0);
  }, []);

  const canSubmit = useMemo(() => {
    if (!bookId) return false;

    const p = parseNonNegInt(pages);
    const m = parseNonNegInt(minutes);

    // disable submit if invalid/negative typed (prevents “Save” with broken input)
    if (p === "NEGATIVE" || p === "INVALID") return false;
    if (m === "NEGATIVE" || m === "INVALID") return false;

    const pv = (p ?? 0) as number;
    const mv = (m ?? 0) as number;
    return pv > 0 || mv > 0;
  }, [bookId, pages, minutes]);

  async function submit() {
    setLocalError(null);

    if (!bookId) {
      setLocalError("Book is required.");
      window.setTimeout(() => bookRef.current?.focus(), 0);
      return;
    }

    const p = parseNonNegInt(pages);
    const m = parseNonNegInt(minutes);

    if (p === "NEGATIVE" || m === "NEGATIVE") {
      setLocalError("Minutes and pages cannot be negative.");
      window.setTimeout(
        () =>
          p === "NEGATIVE"
            ? pagesRef.current?.focus()
            : minutesRef.current?.focus(),
        0,
      );
      return;
    }

    if (p === "INVALID" || m === "INVALID") {
      setLocalError("Minutes and pages must be whole numbers.");
      window.setTimeout(
        () =>
          p === "INVALID"
            ? pagesRef.current?.focus()
            : minutesRef.current?.focus(),
        0,
      );
      return;
    }

    const pv = (p ?? 0) as number;
    const mv = (m ?? 0) as number;

    if (pv === 0 && mv === 0) {
      setLocalError("Enter minutes or pages.");
      window.setTimeout(() => pagesRef.current?.focus(), 0);
      return;
    }

    const safeDate = (date || "").trim() || localDayKey();
    if (!isYyyyMmDd(safeDate)) {
      setLocalError("Date must be in YYYY-MM-DD format.");
      return;
    }

    try {
      setIsSaving(true);
      const created = await onSubmit({
        bookId,
        date: safeDate,
        pages: pv > 0 ? pv : undefined,
        minutes: mv > 0 ? mv : undefined,
        notes: notes.trim() || undefined,
      });

      if (!created) {
        // Store already set page error mode; keep panel open and show local message too.
        setLocalError("Failed to log session.");
        return;
      }
    } catch (e) {
      setLocalError((e as Error)?.message ?? "Failed to log session.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descId}
      onKeyDown={(e) => {
        // Sprint 8: handle Escape at the dialog surface (no per-field traps)
        if (e.key === "Escape") {
          e.preventDefault();
          onClose();
        }
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <div id={titleId} className="text-sm font-medium">
            Log session
          </div>
          <div id={descId} className="text-xs text-slate-500">
            Choose a book and enter minutes or pages.
          </div>
        </div>
        <Button
          variant="secondary"
          onClick={onClose}
          disabled={isSaving}
          aria-label="Close log session"
        >
          Close
        </Button>
      </div>

      <div className="mt-3 grid gap-3">
        <label className="grid gap-1">
          <span className="text-xs font-medium text-slate-400">Book *</span>
          <select
            ref={bookRef}
            className="h-9 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-slate-300"
            value={bookId}
            aria-invalid={!!localError && !bookId}
            aria-describedby={localError ? errorId : undefined}
            onChange={(e) => setBookId(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void submit();
              }
            }}
          >
            <option value="">Select a book…</option>
            {bookOptions.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1">
          <span className="text-xs font-medium text-slate-400">Date *</span>
          <input
            type="date"
            className="h-9 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-slate-300"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1">
            <span className="text-xs font-medium text-slate-400">Pages</span>
            <input
              ref={pagesRef}
              type="number"
              min={0}
              step={1}
              inputMode="numeric"
              className="h-9 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-slate-300"
              value={pages}
              aria-describedby={localError ? errorId : undefined}
              onChange={(e) => setPages(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void submit();
                }
              }}
            />
          </label>

          <label className="grid gap-1">
            <span className="text-xs font-medium text-slate-400">Minutes</span>
            <input
              ref={minutesRef}
              type="number"
              min={0}
              step={1}
              inputMode="numeric"
              className="h-9 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-slate-300"
              value={minutes}
              aria-describedby={localError ? errorId : undefined}
              onChange={(e) => setMinutes(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void submit();
                }
              }}
            />
          </label>
        </div>

        <label className="grid gap-1">
          <span className="text-xs font-medium text-slate-400">Notes</span>
          <textarea
            className="min-h-[80px] w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-slate-300"
            value={notes}
            aria-describedby={localError ? errorId : undefined}
            onChange={(e) => setNotes(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                void submit();
              }
            }}
          />
        </label>

        {localError ? (
          <div
            id={errorId}
            className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
            role="status"
            aria-live="polite"
          >
            {localError}
          </div>
        ) : null}

        <div className="flex items-center justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => void submit()}
            disabled={!canSubmit || isSaving}
            aria-busy={isSaving}
          >
            {isSaving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
