import type { Book } from "@prisma/client";
import type { BookResponse } from "./books.schema";

export function toBookResponse(book: Book): BookResponse {
  return {
    id: book.id,
    title: book.title,
    author: book.author,
    status: book.status,
    genre: book.genre ?? null,
    series: book.series ?? null,
    seriesType: book.seriesType ?? null,
    format: book.format ?? null,
    formatSubtype: book.formatSubtype ?? null,
    isbn: book.isbn ?? null,
    plannedMonth: book.plannedMonth ?? null,
    startedAt: book.startedAt ? book.startedAt.toISOString() : null,
    finishedAt: book.finishedAt ? book.finishedAt.toISOString() : null,
    createdAt: book.createdAt.toISOString(),
    updatedAt: book.updatedAt.toISOString(),
  };
}

export function toBookListResponse(books: Book[]): BookResponse[] {
  return books.map(toBookResponse);
}
