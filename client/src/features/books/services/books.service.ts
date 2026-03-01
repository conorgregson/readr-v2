import type { Book, BookId } from "../types";

// local-first for v2.1
const USE_API = false;
if (USE_API) throw new Error("API mode not supported in v2.1");

// ----------------------------
// Local (localStorage) adapter
// ----------------------------

const STORAGE_KEY = "readr_books_v2_1";

function nowIso() {
  return new Date().toISOString();
}

function readLocal(): Book[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return sanitizeLoadedBooks(parsed);
  } catch (e) {
    if (import.meta.env.DEV) console.warn("[BooksService] Bad storage JSON", e);
    return [];
  }
}

function writeLocal(books: Book[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
}

function nonEmpty(label: string, s: unknown): string {
  const v = typeof s === "string" ? s.trim() : "";
  if (!v) throw new Error(`${label} is required`);
  return v;
}

function sanitizeOptional(s: unknown): string | undefined {
  const v = typeof s === "string" ? s.trim() : "";
  return v ? v : undefined;
}

function sanitizeLoadedBooks(raw: unknown): Book[] {
  if (!Array.isArray(raw)) return [];

  const out: Book[] = [];
  for (const item of raw) {
    // Best-effort sanitize to prevent runtime crashes.
    // Strict parity: drop invalid items instead of inventing authors.
    try {
      const b = item as Partial<Book>;
      const id = typeof b.id === "string" ? b.id : crypto.randomUUID();

      const title = nonEmpty("Title", b.title);
      const author = nonEmpty("Author", b.author);

      const createdAt =
        typeof b.createdAt === "string" ? b.createdAt : nowIso();
      const updatedAt =
        typeof b.updatedAt === "string" ? b.updatedAt : createdAt;

      const status =
        b.status === "planned" ||
        b.status === "reading" ||
        b.status === "finished"
          ? b.status
          : "planned";
      out.push({
        id,
        title,
        author,
        status,
        createdAt,
        updatedAt,
        startedAt: typeof b.startedAt === "string" ? b.startedAt : undefined,
        finishedAt: typeof b.finishedAt === "string" ? b.finishedAt : undefined,

        genre: sanitizeOptional(b.genre),
        series: sanitizeOptional(b.series),
        seriesType: b.seriesType,
        format: b.format,
        formatSubtype: b.formatSubtype,
        isbn: sanitizeOptional(b.isbn),
        plannedMonth: sanitizeOptional(b.plannedMonth),
      });
    } catch {
      // Drop invalid record
    }
  }
  return out;
}

// ----------------------------
// API adapter
// ----------------------------

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${path}`;

  const resp = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const payload = await resp.json().catch(() => null);

  if (!resp.ok) {
    const message =
      payload?.error?.message || `Request failed with status ${resp.status}`;
    throw new Error(message);
  }

  // backend shape: { ok: boolean, data: ... }
  return payload.data as T;
}

async function apiFetchBooks(): Promise<Book[]> {
  return request<Book[]>("/books", { method: "GET" });
}

async function apiCreateBook(
  input: Omit<Book, "id" | "createdAt" | "updatedAt">,
): Promise<Book> {
  return request<Book>("/books", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

async function apiUpdateBook(
  id: BookId,
  patch: Partial<Omit<Book, "id" | "createdAt">>,
): Promise<Book> {
  return request<Book>(`/books/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

async function apiDeleteBook(id: BookId): Promise<void> {
  await request<void>(`/books/${id}`, { method: "DELETE" });
}

// ----------------------------
// Public service (single interface)
// ----------------------------

export const BooksService = {
  async list(): Promise<Book[]> {
    if (USE_API) return apiFetchBooks();
    return readLocal();
  },

  async create(
    input: Omit<Book, "id" | "createdAt" | "updatedAt">,
  ): Promise<Book> {
    if (USE_API) return apiCreateBook(input);

    const books = readLocal();
    const book: Book = {
      ...input,
      title: nonEmpty("Title", input.title),
      author: nonEmpty("Author", input.author),
      genre: sanitizeOptional(input.genre),
      series: sanitizeOptional(input.series),
      isbn: sanitizeOptional(input.isbn),
      plannedMonth: sanitizeOptional(input.plannedMonth),
      id: crypto.randomUUID(),
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    const next = [book, ...books];
    writeLocal(next);
    return book;
  },

  async update(
    id: BookId,
    patch: Partial<Omit<Book, "id" | "createdAt">>,
  ): Promise<Book | null> {
    if (USE_API) return apiUpdateBook(id, patch);

    const books = readLocal();
    const idx = books.findIndex((currentBook) => currentBook.id === id);
    if (idx === -1) return null;

    const updated: Book = {
      ...books[idx],
      ...patch,
      title:
        patch.title !== undefined
          ? nonEmpty("Title", patch.title)
          : books[idx].title,
      author:
        patch.author !== undefined
          ? nonEmpty("Author", patch.author)
          : books[idx].author,
      genre:
        patch.genre !== undefined
          ? sanitizeOptional(patch.genre)
          : books[idx].genre,
      series:
        patch.series !== undefined
          ? sanitizeOptional(patch.series)
          : books[idx].series,
      isbn:
        patch.isbn !== undefined
          ? sanitizeOptional(patch.isbn)
          : books[idx].isbn,
      plannedMonth:
        patch.plannedMonth !== undefined
          ? sanitizeOptional(patch.plannedMonth)
          : books[idx].plannedMonth,
      updatedAt: nowIso(),
    };
    const next = [...books];
    next[idx] = updated;
    writeLocal(next);
    return updated;
  },

  async remove(id: BookId): Promise<boolean> {
    if (USE_API) {
      await apiDeleteBook(id);
      return true;
    }

    const books = readLocal();
    const next = books.filter((currentBook) => currentBook.id !== id);
    if (next.length === books.length) return false;
    writeLocal(next);
    return true;
  },
};
