import { useRef, useMemo, useEffect, useState } from "react";
import { Button } from "../../shared/ui/Button";
import { DevStateBar } from "../../shared/ui/DevStateBar";
import { AddSessionPanel } from "./components/AddSessionPanel";
import { SessionsToolbar } from "./components/SessionsToolbar";
import { SessionsHistoryTable } from "./components/SessionsHistoryTable";
import { useBooksStore } from "../books/store/books.store";
import { sortSessions } from "./services/sessions.sort";

import { LoadingState } from "../../shared/ui/states/LoadingState";
import { EmptyState } from "../../shared/ui/states/EmptyState";
import { ErrorState } from "../../shared/ui/states/ErrorState";
import { NoResultsState } from "../../shared/ui/states/NoResultsState";

import { useSessionsStore } from "./store/sessions.store";
import { SessionsLiveRegion } from "./components/SessionsA11y";
import { SessionsUndoBar } from "./components/SessionsUndoBar";
import { captureFocusToken, restoreFocus } from "../../shared/a11y/focus";

export function SessionsPage() {
  const mode = useSessionsStore((s) => s.page.mode);
  const error = useSessionsStore((s) => s.page.error);

  const setMode = useSessionsStore((s) => s.setMode);
  const setError = useSessionsStore((s) => s.setError);
  const sessions = useSessionsStore((s) => s.sessions);
  const isBootstrapped = useSessionsStore((s) => s.isBootstrapped);
  const loadSessions = useSessionsStore((s) => s.loadSessions);
  const filters = useSessionsStore((s) => s.filters);
  const sortKey = useSessionsStore((s) => s.sortKey);
  const setFilters = useSessionsStore((s) => s.setFilters);
  const clearFilters = useSessionsStore((s) => s.clearFilters);
  const setSortKey = useSessionsStore((s) => s.setSortKey);

  const books = useBooksStore((s) => s.books);

  const addSession = useSessionsStore((s) => s.addSession); // Sprint 6 store action
  const [isAddOpen, setIsAddOpen] = useState(false);
  const addBtnRef = useRef<HTMLButtonElement | null>(null);
  const lastFocusRef = useRef<ReturnType<typeof captureFocusToken>>({
    kind: "none",
  });
  const resultsId = "sessions-results";

  const restoreSessionsFocus = () => {
    window.setTimeout(() => {
      restoreFocus(lastFocusRef.current, {
        fallbackSelectors: [
          `#${resultsId}`,
          '[data-focus-id="sessions:log"]',
          "input",
          "select",
          "textarea",
          "button",
        ],
        deferMs: 0,
      });
    }, 0);
  };

  useEffect(() => {
    if (isBootstrapped) return;
    void loadSessions();
  }, [isBootstrapped, loadSessions]);

  const visibleSessions = useMemo(() => {
    const q = (filters.search ?? "").trim().toLowerCase();
    const tokens = q ? q.split(/\s+/).filter(Boolean) : [];

    const bookById = new Map(books.map((b) => [b.id, b]));

    const inRange = (d: string) => {
      // dates are YYYY-MM-DD, lexicographic compare works
      if (filters.dateStart && d < filters.dateStart) return false;
      if (filters.dateEnd && d > filters.dateEnd) return false;
      return true;
    };

    const typedOk = (s: (typeof sessions)[number]) => {
      if (filters.type === "pages") return typeof s.pages === "number";
      if (filters.type === "minutes") return typeof s.minutes === "number";
      return true;
    };

    const filtered = sessions.filter((s) => {
      if (filters.bookId && s.bookId !== filters.bookId) return false;
      if (!typedOk(s)) return false;
      if (!inRange(s.date)) return false;

      if (tokens.length) {
        const b = bookById.get(s.bookId);
        const hay = [s.date, s.notes ?? "", b?.title ?? "", b?.author ?? ""]
          .join(" ")
          .toLowerCase();
        if (!tokens.every((t) => hay.includes(t))) return false;
      }

      return true;
    });

    return sortSessions(filtered, sortKey);
  }, [sessions, filters, sortKey, books]);

  const hasActiveFilters =
    !!filters.bookId ||
    !!filters.type ||
    !!filters.dateStart ||
    !!filters.dateEnd ||
    !!filters.search;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Sessions</h1>

        <DevStateBar
          mode={mode}
          onMode={setMode}
          onError={() =>
            setError({
              message:
                "Failed to load sessions. (Simulated error state for Sprint 2)",
            })
          }
        />
      </div>

      {mode === "loading" ? (
        <LoadingState label="Loading sessions..." />
      ) : mode === "empty" ? (
        <>
          <SessionsLiveRegion />
          <SessionsUndoBar />

          <EmptyState
            title="No sessions yet"
            description="Logged sessions will appear here."
            action={
              <Button
                ref={addBtnRef}
                onClick={() => {
                  lastFocusRef.current = captureFocusToken();
                  setError(undefined);
                  setIsAddOpen(true);
                }}
                data-focus-id="sessions:log"
                aria-label="Log session"
              >
                Log session
              </Button>
            }
          />

          {isAddOpen ? (
            <AddSessionPanel
              onClose={() => {
                setIsAddOpen(false);
                restoreSessionsFocus();
              }}
              onSubmit={async (input) => {
                const created = await addSession(input);
                if (created) {
                  setIsAddOpen(false);
                  restoreSessionsFocus();
                }
                return created;
              }}
            />
          ) : null}
        </>
      ) : mode === "error" ? (
        <ErrorState
          message={error?.message ?? "Unknown error"}
          action={<Button onClick={() => setMode("results")}>Dismiss</Button>}
        />
      ) : (
        <div className="space-y-3">
          <SessionsLiveRegion />
          <SessionsUndoBar />

          {isAddOpen ? (
            <AddSessionPanel
              onClose={() => {
                setIsAddOpen(false);
                // Sprint 8: restore focus predictably after modal close (fallback: Log Session button)
                restoreSessionsFocus();
              }}
              onSubmit={async (input) => {
                const created = await addSession(input);
                if (created) {
                  setIsAddOpen(false);
                  // Post-add focus: keep stable for Sprint 8 (fallback: Log Session)
                  restoreSessionsFocus();
                }
                return created;
              }}
            />
          ) : (
            <SessionsToolbar
              onLogSession={() => {
                lastFocusRef.current = captureFocusToken();
                setError(undefined);
                setIsAddOpen(true);
              }}
              logButtonRef={addBtnRef}
              totalCount={sessions.length}
              visibleCount={visibleSessions.length}
              filters={filters}
              sortKey={sortKey}
              onChangeFilters={setFilters}
              onClearFilters={clearFilters}
              onChangeSort={setSortKey}
            />
          )}

          {sessions.length > 0 && visibleSessions.length === 0 ? (
            <NoResultsState
              query={filters.search ? `"${filters.search}"` : "(filters)"}
              action={
                <Button onClick={clearFilters} disabled={!hasActiveFilters}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <SessionsHistoryTable
              id={resultsId}
              sessions={visibleSessions}
              query={filters.search ?? ""}
            />
          )}
        </div>
      )}
    </div>
  );
}
