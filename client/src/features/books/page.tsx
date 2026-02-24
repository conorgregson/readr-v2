import { Card } from "../../shared/ui/Card";
import { Button } from "../../shared/ui/Button";
import { DevStateBar } from "../../shared/ui/DevStateBar";

import { LoadingState } from "../../shared/ui/states/LoadingState";
import { EmptyState } from "../../shared/ui/states/EmptyState";
import { ErrorState } from "../../shared/ui/states/ErrorState";
import { NoResultsState } from "../../shared/ui/states/NoResultsState";

import { useBooksStore } from "./store/books.store";

export function BooksPage() {
  const mode = useBooksStore((s) => s.page.mode);
  const error = useBooksStore((s) => s.page.error);
  const demoQuery = useBooksStore((s) => s.demoQuery);
  const demoBooks = useBooksStore((s) => s.demoBooks);

  const setMode = useBooksStore((s) => s.setMode);
  const setError = useBooksStore((s) => s.setError);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Books</h1>

        <DevStateBar
          mode={mode}
          onMode={setMode}
          onError={() =>
            setError({
              message:
                "Failed to load books. (Simulated error state for Sprint 2)",
            })
          }
        />
      </div>

      {mode === "loading" ? (
        <LoadingState label="Loading books…" />
      ) : mode === "empty" ? (
        <EmptyState
          title="No books yet"
          description="Add your first book to start tracking your reading."
          action={
            <Button onClick={() => setMode("results")}>Add book (stub)</Button>
          }
        />
      ) : mode === "noresults" ? (
        <NoResultsState
          query={demoQuery}
          action={
            <Button onClick={() => setMode("results")}>
              Try looser search (stub)
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
              Sprint 2 scaffold: store-driven UI state toggles. Domain logic
              remains quarantined until Sprint 3/4.
            </p>
          </Card>

          <div className="space-y-2">
            {demoBooks.map((b) => (
              <Card key={b.id}>
                <div className="text-sm font-medium">{b.title}</div>
                <div className="text-xs text-slate-400">{b.author}</div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
