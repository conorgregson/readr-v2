import type { CreateSessionInput, Session } from "../types";

function normalizeYyyyMmDd(raw: string): string | null {
  const t = raw.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(t)) return null;
  return t;
}

function toOptionalPositiveInt(v: unknown): number | undefined {
  if (typeof v !== "number" || !Number.isFinite(v)) return undefined;
  const n = Math.floor(v);
  return n > 0 ? n : undefined;
}

export function normalizeCreateSessionInput(
  input: CreateSessionInput,
): CreateSessionInput {
  const bookId = String(input.bookId || "").trim();
  const date = normalizeYyyyMmDd(String(input.date || ""));

  if (!bookId) throw new Error("Book is required.");
  if (!date) throw new Error("Date must be in YYYY-MM-DD format.");

  const pages = toOptionalPositiveInt(input.pages);
  const minutes = toOptionalPositiveInt(input.minutes);

  if (!pages && !minutes) {
    throw new Error("Enter minutes or pages.");
  }

  return {
    bookId,
    date,
    pages,
    minutes,
    notes: input.notes?.trim() || undefined,
  };
}

export type SessionApiResponse = {
  id: string;
  bookId: string;
  pages: number | null;
  minutes: number | null;
  notes: string | null;
  date: string;
  createdAt: string;
  updatedAt: string;
};

export function normalizeSessionFromApi(raw: SessionApiResponse): Session {
  return {
    id: raw.id,
    bookId: raw.bookId,
    date: raw.date.slice(0, 10),
    pages: raw.pages ?? undefined,
    minutes: raw.minutes ?? undefined,
    notes: raw.notes ?? undefined,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export function normalizeUpdateSessionPatch(
  patch: Partial<Omit<Session, "id" | "createdAt">>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};

  if (patch.bookId !== undefined) {
    const bookId = String(patch.bookId).trim();
    if (!bookId) throw new Error("Book is required.");
    out.bookId = bookId;
  }

  if (patch.date !== undefined) {
    const date = normalizeYyyyMmDd(String(patch.date));
    if (!date) throw new Error("Date must be in YYYY-MM-DD format.");
    out.date = date;
  }

  if (patch.pages !== undefined) {
    const pages =
      typeof patch.pages === "number" && Number.isFinite(patch.pages)
        ? Math.floor(patch.pages)
        : null;
    out.pages = pages && pages > 0 ? pages : null;
  }

  if (patch.minutes !== undefined) {
    const minutes =
      typeof patch.minutes === "number" && Number.isFinite(patch.minutes)
        ? Math.floor(patch.minutes)
        : null;
    out.minutes = minutes && minutes > 0 ? minutes : null;
  }

  if (patch.notes !== undefined) {
    const trimmed = patch.notes?.trim();
    out.notes = trimmed ? trimmed : null;
  }

  return out;
}
