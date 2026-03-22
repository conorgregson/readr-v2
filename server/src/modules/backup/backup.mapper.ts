import type { Book, Session } from "@prisma/client";

function toIso(value: Date | null): string | null {
  return value ? value.toISOString() : null;
}

export function toBackupBookResponse(book: Book) {
  return {
    id: book.id,
    title: book.title,
    author: book.author,
    status: book.status,
    genre: book.genre,
    series: book.series,
    seriesType: book.seriesType,
    format: book.format,
    formatSubtype: book.formatSubtype,
    isbn: book.isbn,
    plannedMonth: book.plannedMonth,
    startedAt: toIso(book.startedAt),
    finishedAt: toIso(book.finishedAt),
    createdAt: book.createdAt.toISOString(),
    updatedAt: book.updatedAt.toISOString(),
  };
}

export function toBackupSessionResponse(session: Session) {
  return {
    id: session.id,
    bookId: session.bookId,
    pages: session.pages,
    minutes: session.minutes,
    notes: session.notes,
    date: session.date.toISOString(),
    createdAt: session.createdAt.toISOString(),
    updatedAt: session.updatedAt.toISOString(),
  };
}

export function toBackupExportResponse(input: {
  version: string;
  exportedAt: Date;
  books: Book[];
  sessions: Session[];
}) {
  return {
    version: input.version,
    exportedAt: input.exportedAt.toISOString(),
    books: input.books.map(toBackupBookResponse),
    sessions: input.sessions.map(toBackupSessionResponse),
  };
}
