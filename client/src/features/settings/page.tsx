import { useRef, useState } from "react";
import { Card } from "../../shared/ui/Card";
import { Button } from "../../shared/ui/Button";

import {
  exportBackup,
  importBackup,
  downloadJson,
} from "../../shared/data/backup";
import { useBooksStore } from "../books/store/books.store";
import { useSessionsStore } from "../sessions/store/sessions.store";

export function SettingsPage() {
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");

  const fileRef = useRef<HTMLInputElement | null>(null);

  const loadBooks = useBooksStore((s) => s.loadBooks);
  const loadSessions = useSessionsStore((s) => s.loadSessions);

  async function refresh() {
    await Promise.all([loadBooks(), loadSessions()]);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Settings</h1>

      <Card>
        <div className="space-y-2">
          <h2 className="text-sm font-semibold">Data</h2>
          <p className="text-sm text-slate-500">
            Import/export your local data as JSON. This is the fastest way to
            load hundreds of books and sessions.
          </p>

          {status ? (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              {status}
            </div>
          ) : null}

          {error ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2 pt-1">
            <Button
              onClick={async () => {
                setError("");
                setStatus("");

                const data = await exportBackup();
                const stamp = data.exportedAt.slice(0, 10);
                downloadJson(`readr-backup-v2.1-${stamp}.json`, data);

                setStatus(
                  `Exported ${data.books.length} books and ${data.sessions.length} sessions.`,
                );
              }}
            >
              Export JSON
            </Button>

            <Button
              variant="secondary"
              onClick={() => {
                setError("");
                setStatus("");
                fileRef.current?.click();
              }}
            >
              Import JSON
            </Button>

            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0] ?? null;
                e.target.value = ""; // allow re-importing same file
                if (!file) return;

                setError("");
                setStatus("Importing…");

                try {
                  const text = await file.text();
                  const parsed = JSON.parse(text);

                  const res = await importBackup(parsed);
                  await refresh();

                  setStatus(
                    `Imported ${res.books.length} books and ${res.sessions.length} sessions. ` +
                      `Dropped: ${res.dropped.books} book item(s), ${res.dropped.sessions} session item(s).`,
                  );
                } catch (err) {
                  setStatus("");
                  setError((err as Error)?.message ?? "Import failed.");
                }
              }}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
