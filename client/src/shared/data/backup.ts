// TODO(v2.3): Restore backup import support through a backend bulk-import endpoint.
// Sessions are API-backed, so client-side replace-all import remains intentionally disabled.
// Re-enable only after server-side validation, deduplication, and foreign-key-safe bulk writes exist.

import { BooksService } from "../../features/books/services/books.service";
import { SessionsService } from "../../features/sessions/services/sessions.service";
import type { Book } from "../../features/books/types";
import type { Session } from "../../features/sessions/types";

export type ReadrBackup = {
  app: "readr";
  version: "2.2";
  exportedAt: string; // ISO
  books: Book[];
  sessions: Session[];
};

export async function exportBackup(): Promise<ReadrBackup> {
  const [books, sessions] = await Promise.all([
    BooksService.list(),
    SessionsService.list(),
  ]);

  return {
    app: "readr",
    version: "2.2",
    exportedAt: new Date().toISOString(),
    books,
    sessions,
  };
}

export async function importBackup(): Promise<never> {
  throw new Error(
    "Backup import is temporarily unavailable during the API persistence migration. Export is still supported.",
  );
}

// Browser download helper
export function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}
