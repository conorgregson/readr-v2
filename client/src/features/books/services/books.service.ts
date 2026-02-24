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
    return Array.isArray(parsed) ? (parsed as Book[]) : [];
  } catch (e) {
    if (import.meta.env.DEV) console.warn("[BooksService] Bad storage JSON", e);
    return [];
  }
}

function writeLocal(books: Book[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
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
