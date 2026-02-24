import { Card } from "../../shared/ui/Card";
import { Button } from "../../shared/ui/Button";
import { DevStateBar } from "../../shared/ui/DevStateBar";

import { LoadingState } from "../../shared/ui/states/LoadingState";
import { EmptyState } from "../../shared/ui/states/EmptyState";
import { ErrorState } from "../../shared/ui/states/ErrorState";
import { NoResultsState } from "../../shared/ui/states/NoResultsState";

import { useSessionsStore } from "../books/store/sessions.store";

export function SessionsPage() {
  const mode = useSessionsStore((s) => s.page.mode);
  const error = useSessionsStore((s) => s.page.error);

  const setMode = useSessionsStore((s) => s.setMode);
  const setError = useSessionsStore((s) => s.setError);

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
        <EmptyState
          title="No sessions yet"
          description="Logged session will appear here."
          action={
            <Button onClick={() => setMode("results")}>
              Log session (stub)
            </Button>
          }
        />
      ) : mode === "noresults" ? (
        <NoResultsState
          query="(sessions filter)"
          action={
            <Button onClick={() => setMode("results")}>
              Clear filter (stub)
            </Button>
          }
        />
      ) : mode === "error" ? (
        <ErrorState
          message={error?.message ?? "Unknown error"}
          action={<Button onClick={() => setMode("results")}>Dismiss</Button>}
        />
      ) : (
        <div className="space-y-3">
          <Card>
            <p className="text-sm text-slate-400">
              Sprint 2 scaffold: store-driven UI state toggles. Sessions domain
              logic remains deferred until Sprint 5.
            </p>
          </Card>

          <Card>
            <div className="text-sm font-medium">Example session (stub)</div>
            <div className="text-xs text-slate-400">10:25 · Feb 24, 2026 </div>
          </Card>
        </div>
      )}
    </div>
  );
}
