import { useEffect, useMemo, useRef } from "react";
import { Card } from "../../../shared/ui/Card";
import type { Session } from "../types";
import { SessionsRow } from "./SessionsRow";
import { useSessionsStore } from "../store/sessions.store";

type SessionsHistoryTableProps = {
  id?: string;
  sessions: Session[];
  query?: string;
};

export function SessionsHistoryTable({
  id = "sessions-results",
  sessions,
  query,
}: SessionsHistoryTableProps) {
  const selectedId = useSessionsStore((s) => s.selectedId);
  const setSelectedId = useSessionsStore((s) => s.setSelectedId);
  const clearSelection = useSessionsStore((s) => s.clearSelection);
  const moveSelection = useSessionsStore((s) => s.moveSelection);

  const orderedIds = useMemo(() => sessions.map((s) => s.id), [sessions]);

  // keep selection valid when list changes (filters/sort/delete)
  useEffect(() => {
    if (!selectedId) return;
    if (!orderedIds.includes(selectedId)) {
      clearSelection();
    }
  }, [selectedId, orderedIds, clearSelection]);

  // row refs the selected row can be focused without trapping Tab
  const rowRefs = useRef(new Map<string, HTMLTableRowElement>());

  useEffect(() => {
    if (!selectedId) return;
    const el = rowRefs.current.get(selectedId);
    if (!el) return;

    // Sprint 8: don't steal focus if user is typing/editing elsewhere.
    const root = document.getElementById(id);
    const active = document.activeElement as HTMLElement | null;
    const focusIsInside = !!(root && active && root.contains(active));
    const focusIsBody = !active || active === document.body;
    const focusIsTypingField =
      !!active &&
      (active.tagName === "INPUT" ||
        active.tagName === "TEXTAREA" ||
        active.tagName === "SELECT" ||
        active.isContentEditable);

    if (!focusIsTypingField && (focusIsInside || focusIsBody)) {
      // Defer one frame so the row is definitely in the DOM and tabbable
      requestAnimationFrame(() => el.focus());
    }
  }, [selectedId, id, orderedIds.length]);

  if (!sessions.length) {
    return (
      <Card>
        <div className="text-sm text-slate-500">
          No sessions logged yet. Use "Log session" to add one.
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">History</h2>
        <div className="text-xs text-slate-400">
          {sessions.length === 1 ? "1 entry" : `${sessions.length} entries`}
        </div>
      </div>

      <div
        id={id}
        tabIndex={0}
        role="region"
        aria-label="Sessions history"
        aria-activedescendant={
          selectedId ? `session-row-${selectedId}` : undefined
        }
        className="mt-3 overflow-x-auto outline-none focus-visible:ring-2 focus-visible:ring-slate-300 rounded-md"
        onKeyDown={(e) => {
          // no keyboard trap: allow Tab to leave naturally
          if (e.key === "Tab") return;

          if (e.key === "Enter") {
            // If nothing selected yet, select first row
            if (!selectedId && orderedIds.length) {
              e.preventDefault();
              setSelectedId(orderedIds[0]);
            }
            return;
          }

          if (e.key === "Escape") {
            e.preventDefault();
            clearSelection();
            return;
          }

          if (e.key === "Home") {
            e.preventDefault();
            moveSelection(orderedIds, "first");
            return;
          }

          if (e.key === "End") {
            e.preventDefault();
            moveSelection(orderedIds, "last");
            return;
          }

          if (e.key === "ArrowDown") {
            e.preventDefault();
            moveSelection(orderedIds, "next");
            return;
          }

          if (e.key === "ArrowUp") {
            e.preventDefault();
            moveSelection(orderedIds, "prev");
            return;
          }
        }}
      >
        {/* Keyboard surface: do not block Tab */}
        <table className="w-full text-left">
          <thead>
            <tr className="text-xs text-slate-400">
              <th className="py-2 pr-3 font-medium">Date</th>
              <th className="py-2 pr-3 font-medium">Book</th>
              <th className="py-2 pr-3 font-medium">Details</th>
              <th className="py-2 font-medium">Notes</th>
            </tr>
          </thead>

          <tbody className="text-sm">
            {sessions.map((s) => (
              <SessionsRow
                key={s.id}
                session={s}
                query={query}
                isSelected={selectedId === s.id}
                onSelect={() => setSelectedId(s.id)}
                setRowRef={(el) => {
                  if (!el) {
                    rowRefs.current.delete(s.id);
                    return;
                  }
                  rowRefs.current.set(s.id, el);
                }}
              />
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
