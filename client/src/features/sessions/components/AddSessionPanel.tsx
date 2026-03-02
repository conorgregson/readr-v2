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

  useEffect(() => {
    queueMicrotask(() => bookRef.current?.focus());
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
      queueMicrotask(() => bookRef.current?.focus());
      return;
    }

    const p = parseNonNegInt(pages);
    const m = parseNonNegInt(minutes);

    if (p === "NEGATIVE" || m === "NEGATIVE") {
      setLocalError("Minutes and pages cannot be negative.");
      queueMicrotask(() =>
        p === "NEGATIVE"
          ? pagesRef.current?.focus()
          : minutesRef.current?.focus(),
      );
      return;
    }

    if (p === "INVALID" || m === "INVALID") {
      setLocalError("Minutes and pages must be whole numbers.");
      queueMicrotask(() =>
        p === "INVALID"
          ? pagesRef.current?.focus()
          : minutesRef.current?.focus(),
      );
      return;
    }

    const pv = (p ?? 0) as number;
    const mv = (m ?? 0) as number;

    if (pv === 0 && mv === 0) {
      setLocalError("Enter minutes or pages.");
      queueMicrotask(() => pagesRef.current?.focus());
      return;
    }

    const safeDate = (date || "").trim() || localDayKey();

    try {
      setIsSaving(true);
      const created = await onSubmit({
        bookId,
        date: safeDate,
        pagesRead: pv > 0 ? pv : undefined,
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
    <Card>
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-medium">Log session</div>
        <Button variant="secondary" onClick={onClose} disabled={isSaving}>
          Close
        </Button>
      </div>

      <div className="mt-3 grid gap-3">
        <label className="grid gap-1">
          <span className="text-xs font-medium text-slate-400">Book *</span>
          <select
            ref={bookRef}
            className="h-9 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-700 outline-none focus:ring-2"
            value={bookId}
            aria-invalid={!!localError && !bookId}
            onChange={(e) => setBookId(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.preventDefault();
                onClose();
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
            className="h-9 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-700 outline-none focus:ring-2"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.preventDefault();
                onClose();
              }
            }}
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
              className="h-9 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-700 outline-none focus:ring-2"
              value={pages}
              onChange={(e) => setPages(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void submit();
                } else if (e.key === "Escape") {
                  e.preventDefault();
                  onClose();
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
              className="h-9 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-700 outline-none focus:ring-2"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void submit();
                } else if (e.key === "Escape") {
                  e.preventDefault();
                  onClose();
                }
              }}
            />
          </label>
        </div>

        <label className="grid gap-1">
          <span className="text-xs font-medium text-slate-400">Notes</span>
          <textarea
            className="min-h-[80px] w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.preventDefault();
                onClose();
              } else if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                void submit();
              }
            }}
          />
        </label>

        {localError ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {localError}
          </div>
        ) : null}

        <div className="flex items-center justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
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
