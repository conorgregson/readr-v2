import type { CreateSessionInput, Session } from "../types";

function nowIso() {
  return new Date().toISOString();
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

function isIsoString(v: unknown): v is string {
  return typeof v === "string" && v.length >= 10;
}

function normalizeYyyyMmDd(raw: string): string | null {
  const t = raw.trim();
  // accept "YYYY-MM-DD" only (keep Sprint 6 strict)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(t)) return null;
  return t;
}

function toOptionalPosInt(v: unknown): number | undefined {
  if (typeof v !== "number" || !Number.isFinite(v)) return undefined;
  const n = Math.floor(v);
  if (n <= 0) return undefined;
  return n;
}

export function normalizeSession(raw: unknown): Session | null {
  if (!isPlainObject(raw)) return null;

  const id = typeof raw.id === "string" ? raw.id.trim() : "";
  const bookId = typeof raw.bookId === "string" ? raw.bookId.trim() : "";
  const dateRaw = typeof raw.date === "string" ? raw.date : "";

  const date = normalizeYyyyMmDd(dateRaw);
  if (!id || !bookId || !date) return null;

  const pages = toOptionalPosInt(raw.pages);
  const minutes = toOptionalPosInt(raw.minutes);
  const notes =
    typeof raw.notes === "string" && raw.notes.trim()
      ? raw.notes.trim()
      : undefined;

  const createdAt = isIsoString(raw.createdAt)
    ? String(raw.createdAt)
    : nowIso();
  const updatedAt = isIsoString(raw.updatedAt)
    ? String(raw.updatedAt)
    : createdAt;

  return {
    id,
    bookId,
    date,
    pages,
    minutes,
    notes,
    createdAt,
    updatedAt,
  };
}

export function normalizeCreateInput(input: CreateSessionInput): Session {
  const bookId = String(input.bookId || "").trim();
  const date = normalizeYyyyMmDd(String(input.date || "")) ?? null;

  if (!bookId) throw new Error("Book is required.");
  if (!date) throw new Error("Date must be in YYYY-MM-DD format.");

  const pages =
    typeof input.pagesRead === "number" ? input.pagesRead : undefined;
  const minutes = typeof input.minutes === "number" ? input.minutes : undefined;

  const p = pages && pages > 0 ? Math.floor(pages) : undefined;
  const m = minutes && minutes > 0 ? Math.floor(minutes) : undefined;

  if (!p && !m) throw new Error("Enter minutes or pages.");

  const ts = nowIso();

  return {
    id: crypto.randomUUID(),
    bookId,
    date,
    pages: p,
    minutes: m,
    notes: input.notes?.trim() || undefined,
    createdAt: ts,
    updatedAt: ts,
  };
}
