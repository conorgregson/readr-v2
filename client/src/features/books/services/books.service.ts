import type {
  Book,
  BookId,
  BookStatus,
  FormatParent,
  FormatSubtype,
  SeriesType,
} from "../types";

import { apiFetch } from "../../../shared/api/api";

type ApiEnvelope<T> = {
  ok: boolean;
  data: T;
};

type ApiErrorEnvelope = {
  ok?: false;
  error?: {
    message?: string;
    code?: string;
    details?: unknown;
  };
};

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

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await apiFetch(path, options);

  if (response.status === 204) {
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    return undefined as T;
  }

  const payload = (await response.json().catch(() => null)) as
    | ApiEnvelope<T>
    | ApiErrorEnvelope
    | null;

  if (!response.ok) {
    const message =
      payload && "error" in payload
        ? payload.error?.message ||
          `Request failed with status ${response.status}`
        : `Request failed with status ${response.status}`;

    throw new Error(message);
  }

  if (!payload || !("data" in payload)) {
    throw new Error("Invalid API response");
  }

  return payload.data;
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
  return {
    title: nonEmpty("Title", input.title),
    author: nonEmpty("Author", input.author),
    status: input.status,

    ...(sanitizeOptionalString(input.genre) !== undefined
      ? { genre: sanitizeOptionalString(input.genre) }
      : {}),
    ...(sanitizeOptionalString(input.series) !== undefined
      ? { series: sanitizeOptionalString(input.series) }
      : {}),
    ...(input.seriesType !== undefined ? { seriesType: input.seriesType } : {}),
    ...(input.format !== undefined ? { format: input.format } : {}),
    ...(input.formatSubtype !== undefined
      ? { formatSubtype: input.formatSubtype }
      : {}),
    ...(sanitizeOptionalString(input.isbn) !== undefined
      ? { isbn: sanitizeOptionalString(input.isbn) }
      : {}),
    ...(sanitizeOptionalString(input.plannedMonth) !== undefined
      ? { plannedMonth: sanitizeOptionalString(input.plannedMonth) }
      : {}),
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

export const BooksService = {
  async list(): Promise<Book[]> {
    const books = await request<ApiBook[]>("/books?limit=100", {
      method: "GET",
    });

    return books.map(toClientBook);
  },

  async create(input: CreateBookInput): Promise<Book> {
    const created = await request<ApiBook>("/books", {
      method: "POST",
      body: JSON.stringify(normalizeCreateInput(input)),
    });

    return toClientBook(created);
  },

  async update(id: BookId, patch: UpdateBookInput): Promise<Book> {
    const updated = await request<ApiBook>(`/books/${id}`, {
      method: "PATCH",
      body: JSON.stringify(normalizeUpdateInput(patch)),
    });

    return toClientBook(updated);
  },

  async remove(id: BookId): Promise<void> {
    await request<void>(`/books/${id}`, {
      method: "DELETE",
    });
  },
};
