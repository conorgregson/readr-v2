import { useEffect, useMemo, useRef } from "react";
import { Button } from "../../../shared/ui/Button";
import { useSessionsStore } from "../store/sessions.store";
import { captureFocusToken, restoreFocus } from "../../../shared/a11y/focus";
import { useBooksStore } from "../../books/store/books.store";

export function SessionsUndoBar() {
  const undo = useSessionsStore((s) => s.undo);
  const undoDelete = useSessionsStore((s) => s.undoDelete);
  const undoExpiresAt = useSessionsStore((s) => s.undo?.expiresAt ?? 0);
  const books = useBooksStore((s) => s.books);

  const undoBtnRef = useRef<HTMLButtonElement | null>(null);
  const lastFocusRef = useRef<ReturnType<typeof captureFocusToken>>({
    kind: "none",
  });

  const label = useMemo(() => {
    if (!undo) return "";
    const b = books.find((x) => x.id === undo.session.bookId);
    const bookLabel = b ? `${b.title} — ${b.author}` : "Unknown book";
    return `Session deleted: ${bookLabel} (${undo.session.date})`;
  }, [undo, books]);

  useEffect(() => {
    if (!undo) return;

    // avoid calling canUndo() from render deps; read from store at runtime
    const ok = useSessionsStore.getState().canUndo();
    if (!ok) return;

    lastFocusRef.current = captureFocusToken();
    window.setTimeout(() => undoBtnRef.current?.focus(), 0);
  }, [undoExpiresAt, undo]);

  if (!undo) return null; // store timer clears undo when expired

  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-white px-3 py-2">
      <div className="text-xs text-slate-600">{label}</div>
      <Button
        ref={undoBtnRef}
        variant="secondary"
        onClick={() => {
          const restoredSessionId = undo.session.id;
          undoDelete();

          window.setTimeout(() => {
            const row = document.getElementById(
              `session-row-${restoredSessionId}`,
            ) as HTMLElement | null;
            if (row) return void row.focus();

            const region = document.getElementById(
              "sessions-results",
            ) as HTMLElement | null;
            if (region) return void region.focus();

            restoreFocus(lastFocusRef.current, { deferMs: 0 });
          }, 0);
        }}
        aria-label="Undo delete session"
      >
        Undo
      </Button>
    </div>
  );
}
