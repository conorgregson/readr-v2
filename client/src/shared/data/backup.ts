// TODO(v2.3): Restore backup import support for Sessions through a backend bulk-import endpoint.
// Sessions are now API-backed, so the old client-side replaceAll flow is intentionally disabled.
// Re-enable import only after server-side validation, deduplication, and foreign-key-safe bulk writes exist.

import { BooksService } from "../../features/books/services/books.service";
import { SessionsService } from "../../features/sessions/services/sessions.service";
import type { Book } from "../../features/books/types";
import type { Session } from "../../features/sessions/types";

export type ReadrBackupV21 = {
  app: "readr";
  version: "2.1";
  exportedAt: string; // ISO
  books: Book[];
  sessions: Session[];
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

function asArray(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}

function sanitizeBooks(raw: unknown[]): { books: Book[]; dropped: number } {
  let dropped = 0;
  const candidates: unknown[] = [];
  for (const item of raw) {
    if (item && typeof item === "object") candidates.push(item);
    else dropped += 1;
  }
  return { books: candidates as Book[], dropped };
}

export async function exportBackup(): Promise<ReadrBackupV21> {
  const [books, sessions] = await Promise.all([
    BooksService.list(),
    SessionsService.list(),
  ]);

  return {
    app: "readr",
    version: "2.1",
    exportedAt: new Date().toISOString(),
    books,
    sessions,
  };
}

export async function importBackup(raw: unknown): Promise<{
  books: Book[];
  sessions: Session[];
  dropped: { books: number; sessions: number };
}> {
  if (!isRecord(raw)) {
    throw new Error("Invalid backup file (not an object).");
  }

  const booksRaw = asArray(raw.books);
  const sessionsRaw = asArray(raw.sessions);

  const booksPre = sanitizeBooks(booksRaw);

  if (booksPre.books.length > 0 || sessionsRaw.length > 0) {
    throw new Error(
      "Backup import is temporarily unavailable during the API persistence migration. Export is still supported.",
    );
  }

  const books = await BooksService.list();
  const sessions = await SessionsService.list();

  return {
    books,
    sessions,
    dropped: {
      books: booksPre.dropped,
      sessions: 0,
    },
  };
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
