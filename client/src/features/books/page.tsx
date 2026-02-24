import { Card } from "../../shared/ui/Card";

export function BooksPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Books</h1>
      <Card>
        <p className="text-sm text-slate-400">
          Sprint 1 shell. Domain logic is quarantined until Sprint 3/4.
        </p>
      </Card>
    </div>
  );
}
