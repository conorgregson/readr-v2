import type { CreateSessionInput, Session } from "../types";
import { normalizeCreateInput, normalizeSession } from "./sessions.normalize";

const SESSIONS_KEY = "readr.sessions.v1";
const STORAGE_VERSION = 1;

type SessionsEnvelopeV1 = {
  v: 1;
  sessions: unknown[];
};

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

function safeParse(raw: string | null): unknown {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

function normalizeArray(rawArr: unknown[]): Session[] {
  const out: Session[] = [];
  for (const item of rawArr) {
    const s = normalizeSession(item);
    if (s) out.push(s);
  }
  return out;
}

function sanitizeSessions(raw: unknown[]): {
  sessions: Session[];
  dropped: number;
} {
  const out: Session[] = [];
  let dropped = 0;

  for (const item of raw) {
    const s = normalizeSession(item);
    if (s) out.push(s);
    else dropped += 1;
  }

  return { sessions: out, dropped };
}

function writeEnvelopeV1(sessions: Session[]) {
  const env: SessionsEnvelopeV1 = { v: 1, sessions };
  safeSetItem(SESSIONS_KEY, JSON.stringify(env));
}

/**
 * Reads sessions from storage with migration:
 * - v1 envelope: { v: 1, sessions: [...] }
 * - legacy:      [ ... ]  (array of sessions)
 * Any successful legacy read is rewritten to v1.
 */
function readAll(): Session[] {
  const raw = safeGetItem(SESSIONS_KEY);
  const parsed = safeParse(raw);

  // Corrupt JSON or blocked storage: treat as empty.
  // If JSON was present but unparseable, clear it once to prevent repeated failures.
  if (raw && parsed === null) {
    safeRemoveItem(SESSIONS_KEY);
    return [];
  }

  // v1 envelope
  if (isRecord(parsed) && parsed.v === 1 && Array.isArray(parsed.sessions)) {
    const sessions = normalizeArray(parsed.sessions as unknown[]);

    // Repair-on-read: if invalid rows were dropped, persist the cleaned list.
    const rawCount = (parsed.sessions as unknown[]).length;
    if (sessions.length !== rawCount) {
      writeEnvelopeV1(sessions);
    }

    return sessions;
  }

  // legacy array
  if (Array.isArray(parsed)) {
    const sessions = normalizeArray(parsed);
    writeEnvelopeV1(sessions); // migrate
    return sessions;
  }

  // empty/unknown payload
  return [];
}

function writeAll(sessions: Session[]) {
  writeEnvelopeV1(sessions);
}

export const SessionsService = {
  list(): Session[] {
    return readAll();
  },

  create(input: CreateSessionInput): Session {
    const created = normalizeCreateInput(input);
    const all = readAll();
    const next = [created, ...all];
    writeAll(next);
    return created;
  },

  update(updated: Session): Session {
    const safe = normalizeSession(updated);
    if (!safe) throw new Error("Invalid session update payload.");

    const all = readAll();
    const idx = all.findIndex((s) => s.id === safe.id);
    if (idx === -1) throw new Error("Session not found.");

    const next = all.slice();
    next[idx] = { ...next[idx], ...safe, updatedAt: new Date().toISOString() };
    writeAll(next);
    return next[idx];
  },

  upsert(session: Session): Session {
    const safe = normalizeSession(session);
    if (!safe) throw new Error("Invalid session payload.");

    const all = readAll();
    const idx = all.findIndex((s) => s.id === safe.id);

    const next = all.slice();
    if (idx === -1) {
      next.unshift(safe);
      writeAll(next);
      return safe;
    }

    next[idx] = {
      ...next[idx],
      ...safe,
      updatedAt: new Date().toISOString(),
    };
    writeAll(next);
    return next[idx];
  },

  remove(id: string): void {
    const all = readAll();
    const next = all.filter((s) => s.id !== id);
    writeAll(next);
  },

  clear(): void {
    safeRemoveItem(SESSIONS_KEY);
  },

  replaceAll(nextSessions: unknown[]): { wrote: number; dropped: number } {
    const { sessions, dropped } = sanitizeSessions(nextSessions);
    writeAll(sessions);
    return { wrote: sessions.length, dropped };
  },

  // reserved for future migrations
  getStorageVersion(): number {
    return STORAGE_VERSION;
  },
};
