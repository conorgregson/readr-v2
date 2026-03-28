import type {
  Book,
  BookId,
  BookStatus,
  FormatParent,
  FormatSubtype,
  SeriesType,
} from "../types";
import type {
  BulkDeleteBooksRequest,
  BulkMutationResult,
  BulkUpdateBooksRequest,
} from "../../../../../shared/types/v2.4";

import { apiRequest } from "../../../shared/api/request";

type ApiBook = {
  id: string;
  title: string;
  author: string;
  status: BookStatus;

  genre: string | null;
  series: string | null;
  seriesType: SeriesType | null;
  format: FormatParent | null;
  formatSubtype: FormatSubtype | null;
  isbn: string | null;
  plannedMonth: string | null;

  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateBookInput = {
  title: string;
  author: string;
  status: BookStatus;

  genre?: string;
  series?: string;
  seriesType?: SeriesType;
  format?: FormatParent;
  formatSubtype?: FormatSubtype;
  isbn?: string;
  plannedMonth?: string;
};

export type UpdateBookInput = Partial<{
  title: string;
  author: string;
  status: BookStatus;

  genre: string | null;
  series: string | null;
  seriesType: SeriesType | null;
  format: FormatParent | null;
  formatSubtype: FormatSubtype | null;
  isbn: string | null;
  plannedMonth: string | null;
}>;

function nonEmpty(label: string, value: unknown): string {
  const trimmed = typeof value === "string" ? value.trim() : "";
  if (!trimmed) throw new Error(`${label} is required`);
  return trimmed;
}

function sanitizeOptionalString(value: unknown): string | undefined {
  const trimmed = typeof value === "string" ? value.trim() : "";
  return trimmed ? trimmed : undefined;
}

function sanitizeNullableString(value: unknown): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;

  const trimmed = typeof value === "string" ? value.trim() : "";
  return trimmed ? trimmed : null;
}

function normalizeIds(ids: string[]): string[] {
  return [...new Set(ids.map((id) => id.trim()).filter(Boolean))];
}

function toClientBook(apiBook: ApiBook): Book {
  return {
    id: apiBook.id,
    title: nonEmpty("Title", apiBook.title),
    author: nonEmpty("Author", apiBook.author),
    status: apiBook.status,

    createdAt: apiBook.createdAt,
    updatedAt: apiBook.updatedAt,
    startedAt: apiBook.startedAt ?? undefined,
    finishedAt: apiBook.finishedAt ?? undefined,

    genre: apiBook.genre ?? undefined,
    series: apiBook.series ?? undefined,
    seriesType: apiBook.seriesType ?? undefined,
    format: apiBook.format ?? undefined,
    formatSubtype: apiBook.formatSubtype ?? undefined,
    isbn: apiBook.isbn ?? undefined,
    plannedMonth: apiBook.plannedMonth ?? undefined,
  };
}

function normalizeCreateInput(input: CreateBookInput): CreateBookInput {
  const genre = sanitizeOptionalString(input.genre);
  const series = sanitizeOptionalString(input.series);
  const isbn = sanitizeOptionalString(input.isbn);
  const plannedMonth = sanitizeOptionalString(input.plannedMonth);

  return {
    title: nonEmpty("Title", input.title),
    author: nonEmpty("Author", input.author),
    status: input.status,

    ...(genre !== undefined ? { genre } : {}),
    ...(series !== undefined ? { series } : {}),
    ...(input.seriesType !== undefined ? { seriesType: input.seriesType } : {}),
    ...(input.format !== undefined ? { format: input.format } : {}),
    ...(input.formatSubtype !== undefined
      ? { formatSubtype: input.formatSubtype }
      : {}),
    ...(isbn !== undefined ? { isbn } : {}),
    ...(plannedMonth !== undefined ? { plannedMonth } : {}),
  };
}

function normalizeUpdateInput(patch: UpdateBookInput): UpdateBookInput {
  return {
    ...(patch.title !== undefined
      ? { title: nonEmpty("Title", patch.title) }
      : {}),
    ...(patch.author !== undefined
      ? { author: nonEmpty("Author", patch.author) }
      : {}),
    ...(patch.status !== undefined ? { status: patch.status } : {}),

    ...(patch.genre !== undefined
      ? { genre: sanitizeNullableString(patch.genre) ?? null }
      : {}),
    ...(patch.series !== undefined
      ? { series: sanitizeNullableString(patch.series) ?? null }
      : {}),
    ...(patch.seriesType !== undefined ? { seriesType: patch.seriesType } : {}),
    ...(patch.format !== undefined ? { format: patch.format } : {}),
    ...(patch.formatSubtype !== undefined
      ? { formatSubtype: patch.formatSubtype }
      : {}),
    ...(patch.isbn !== undefined
      ? { isbn: sanitizeNullableString(patch.isbn) ?? null }
      : {}),
    ...(patch.plannedMonth !== undefined
      ? { plannedMonth: sanitizeNullableString(patch.plannedMonth) ?? null }
      : {}),
  };
}

function normalizeBulkUpdateInput(
  input: BulkUpdateBooksRequest,
): BulkUpdateBooksRequest {
  return {
    ids: normalizeIds(input.ids),
    patch: {
      ...(input.patch.status !== undefined
        ? { status: input.patch.status }
        : {}),
    },
  };
}

function normalizeBulkDeleteInput(
  input: BulkDeleteBooksRequest,
): BulkDeleteBooksRequest {
  return {
    ids: normalizeIds(input.ids),
  };
}

export const BooksService = {
  async list(): Promise<Book[]> {
    const books = await apiRequest<ApiBook[]>("/books?limit=100", {
      method: "GET",
    });

    return books.map(toClientBook);
  },

  async create(input: CreateBookInput): Promise<Book> {
    const created = await apiRequest<ApiBook>("/books", {
      method: "POST",
      body: normalizeCreateInput(input),
    });

    return toClientBook(created);
  },

  async update(id: BookId, patch: UpdateBookInput): Promise<Book> {
    const updated = await apiRequest<ApiBook>(`/books/${id}`, {
      method: "PATCH",
      body: normalizeUpdateInput(patch),
    });

    return toClientBook(updated);
  },

  async remove(id: BookId): Promise<void> {
    await apiRequest<void>(`/books/${id}`, {
      method: "DELETE",
    });
  },

  async bulkUpdate(input: BulkUpdateBooksRequest): Promise<BulkMutationResult> {
    return apiRequest<BulkMutationResult>("/books/bulk", {
      method: "PATCH",
      body: normalizeBulkUpdateInput(input),
    });
  },

  async bulkRemove(input: BulkDeleteBooksRequest): Promise<BulkMutationResult> {
    return apiRequest<BulkMutationResult>("/books/bulk", {
      method: "DELETE",
      body: normalizeBulkDeleteInput(input),
    });
  },
};
