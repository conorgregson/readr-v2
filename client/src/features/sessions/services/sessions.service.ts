import type { CreateSessionInput, Session } from "../types";
import { normalizeCreateInput, normalizeSession } from "./sessions.normalize";

const SESSIONS_KEY = "readr.sessions.v1";
const STORAGE_VERSION = 1;

type SessionsEnvelopeV1 = {
  v: 1;
  sessions: unknown[];
};

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

function writeEnvelopeV1(sessions: Session[]) {
  const env: SessionsEnvelopeV1 = { v: 1, sessions };
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(env));
}

/**
 * Reads sessions from storage with migration:
 * - v1 envelope: { v: 1, sessions: [...] }
 * - legacy:      [ ... ]  (array of sessions)
 * Any successful legacy read is rewritten to v1.
 */
function readAll(): Session[] {
  const parsed = safeParse(localStorage.getItem(SESSIONS_KEY));

  // v1 envelope
  if (isRecord(parsed) && parsed.v === 1 && Array.isArray(parsed.sessions)) {
    return normalizeArray(parsed.sessions as unknown[]);
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
    localStorage.removeItem(SESSIONS_KEY);
  },

  // reserved for future migrations
  getStorageVersion(): number {
    return STORAGE_VERSION;
  },
};
