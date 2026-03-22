import { useRef, useState } from "react";
import { Card } from "../../shared/ui/Card";
import { Button } from "../../shared/ui/Button";
import { BackupService } from "./services/backup.service";
import { useBooksStore } from "../books/store/books.store";
import { useSessionsStore } from "../sessions/store/sessions.store";

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function getBackupFilename(exportedAt: string) {
  const stamp = exportedAt.slice(0, 10);
  return `readr-backup-v2.3-${stamp}.json`;
}

export function SettingsPage() {
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [busy, setBusy] = useState<"export" | "import" | "">("");

  const fileRef = useRef<HTMLInputElement | null>(null);

  const loadBooks = useBooksStore((s) => s.loadBooks);
  const loadSessions = useSessionsStore((s) => s.loadSessions);

  async function handleExport() {
    setError("");
    setStatus("");
    setBusy("export");

    try {
      const data = await BackupService.export();
      downloadJson(getBackupFilename(data.exportedAt), data);

      setStatus(
        `Exported ${data.books.length} books and ${data.sessions.length} sessions.`,
      );
    } catch (err) {
      setError((err as Error)?.message ?? "Export failed.");
    } finally {
      setBusy("");
    }
  }

  function handleImportClick() {
    if (busy) return;
    fileRef.current?.click();
  }

  async function handleImportFile(file: File) {
    setError("");
    setStatus("");
    setBusy("import");

    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as unknown;

      const confirmed = window.confirm(
        "Import this backup into your current account?",
      );

      if (!confirmed) {
        return;
      }

      const result = await BackupService.import(parsed);

      await Promise.all([loadBooks(), loadSessions()]);

      setStatus(
        `Imported ${result.importedBooks} books and ${result.importedSessions} sessions.`,
      );
    } catch (err) {
      setError((err as Error)?.message ?? "Import failed.");
    } finally {
      setBusy("");
      if (fileRef.current) {
        fileRef.current.value = "";
      }
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Settings</h1>

      <Card>
        <div className="space-y-2">
          <h2 className="text-sm font-semibold">Data</h2>
          <p className="text-sm text-slate-500">
            Export your books and sessions as JSON, or import a backup into your
            current account.
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
            <Button onClick={handleExport} disabled={busy !== ""}>
              {busy === "export" ? "Exporting..." : "Export JSON"}
            </Button>

            <Button
              variant="secondary"
              onClick={handleImportClick}
              disabled={busy !== ""}
            >
              {busy === "import" ? "Importing..." : "Import JSON"}
            </Button>

            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                if (!file) return;
                void handleImportFile(file);
              }}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
