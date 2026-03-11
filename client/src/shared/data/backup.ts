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
  // BooksService.list() is async in your repo (returns Promise<Book[]>)
  const [books, sessions] = await Promise.all([
    BooksService.list(),
    Promise.resolve(SessionsService.list()),
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

  if (booksPre.books.length > 0) {
    throw new Error(
      "Books import is temporarily unavailable during the API persistence migration.",
    );
  }

  // SessionsService is sync right now
  const sessionsWrite = SessionsService.replaceAll(sessionsRaw);

  // Re-read canonical lists
  const books = await BooksService.list();
  const sessions = SessionsService.list();

  return {
    books,
    sessions,
    dropped: {
      books: booksPre.dropped,
      sessions: sessionsWrite.dropped,
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
