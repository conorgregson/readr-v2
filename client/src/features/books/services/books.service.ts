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

function uuid(): string {
  // Prefer built-in UUID when available
  const c = globalThis.crypto as Crypto | undefined;
  if (c && "randomUUID" in c && typeof c.randomUUID === "function") {
    return c.randomUUID();
  }

  // Fallback: RFC4122-ish v4 using getRandomValues when available
  if (c && "getRandomValues" in c && typeof c.getRandomValues === "function") {
    const bytes = new Uint8Array(16);
    c.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  // Last-resort fallback (still stable enough for local-first)
  return `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

type ReadLocalResult = { books: Book[]; repaired: boolean };

function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function safeRemoveItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

function readLocal(): ReadLocalResult {
  const raw = safeGetItem(STORAGE_KEY);
  if (!raw) return { books: [], repaired: false };

  try {
    const parsed = JSON.parse(raw);
    const { books, droppedCount } = sanitizeLoadedBooks(parsed);
    if (droppedCount > 0) {
      writeLocal(books);
      return { books, repaired: true };
    }
    return { books, repaired: false };
  } catch (e) {
    if (import.meta.env.DEV) console.warn("[BooksService] Bad storage JSON", e);
    safeRemoveItem(STORAGE_KEY);
    return { books: [], repaired: true };
  }
}

function writeLocal(books: Book[]) {
  safeSetItem(STORAGE_KEY, JSON.stringify(books));
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

function sanitizeLoadedBooks(raw: unknown): {
  books: Book[];
  droppedCount: number;
} {
  if (!Array.isArray(raw)) return { books: [], droppedCount: 0 };

  const out: Book[] = [];
  let dropped = 0;
  for (const item of raw) {
    // Best-effort sanitize to prevent runtime crashes.
    // Strict parity: drop invalid items instead of inventing authors.
    try {
      const b = item as Partial<Book>;
      const id = typeof b.id === "string" ? b.id : uuid();
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
      dropped += 1;
    }
  }
  return { books: out, droppedCount: dropped };
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
    const res = readLocal();
    if (import.meta.env.DEV && res.repaired) {
      console.info("[BooksService] Storage repaired for", STORAGE_KEY);
    }
    return res.books;
  },

  async create(
    input: Omit<Book, "id" | "createdAt" | "updatedAt">,
  ): Promise<Book> {
    if (USE_API) return apiCreateBook(input);

    const books = readLocal().books;
    const book: Book = {
      ...input,
      title: nonEmpty("Title", input.title),
      author: nonEmpty("Author", input.author),
      genre: sanitizeOptional(input.genre),
      series: sanitizeOptional(input.series),
      isbn: sanitizeOptional(input.isbn),
      plannedMonth: sanitizeOptional(input.plannedMonth),
      id: uuid(),
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

    const books = readLocal().books;
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

    const books = readLocal().books;
    const next = books.filter((currentBook) => currentBook.id !== id);
    if (next.length === books.length) return false;
    writeLocal(next);
    return true;
  },

  async replaceAll(nextBooks: Book[]): Promise<void> {
    if (USE_API) {
      // v2.2 can implement: PUT /books or bulk sync endpoint
      throw new Error("replaceAll not supported in API mode yet");
    }

    // sanitize on write to avoid peristing junk
    const safe: Book[] = nextBooks.map((b) => ({
      ...b,
      title: nonEmpty("Title", b.title),
      author: nonEmpty("Author", b.author),
      genre: sanitizeOptional(b.genre),
      series: sanitizeOptional(b.series),
      isbn: sanitizeOptional(b.isbn),
      plannedMonth: sanitizeOptional(b.plannedMonth),

      createdAt: typeof b.createdAt === "string" ? b.createdAt : nowIso(),
      updatedAt: typeof b.updatedAt === "string" ? b.updatedAt : nowIso(),
      startedAt: typeof b.startedAt === "string" ? b.startedAt : undefined,
      finishedAt: typeof b.finishedAt === "string" ? b.finishedAt : undefined,
      status:
        b.status === "planned" ||
        b.status === "reading" ||
        b.status === "finished"
          ? b.status
          : "planned",
      id: typeof b.id === "string" ? b.id : uuid(),
    }));

    writeLocal(safe);
  },
};
