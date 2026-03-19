import type { CreateSessionInput, Session } from "../types";
import {
  normalizeCreateSessionInput,
  normalizeSessionFromApi,
  normalizeUpdateSessionPatch,
  type SessionApiResponse,
} from "./sessions.normalize";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ??
  "http://localhost:4000";

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

type DeleteSessionResponse = {
  id: string;
};

async function readJson<T>(res: Response): Promise<T> {
  const json = (await res.json().catch(() => null)) as
    | T
    | ApiErrorEnvelope
    | null;

  if (!res.ok) {
    const message =
      (json as ApiErrorEnvelope | null)?.error?.message ??
      `Request failed (${res.status})`;
    throw new Error(message);
  }

  if (!json) {
    throw new Error("Invalid server response.");
  }

  return json as T;
}

export const SessionsService = {
  async list(): Promise<Session[]> {
    const res = await fetch(`${API_BASE}/api/sessions`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const json = await readJson<ApiEnvelope<SessionApiResponse[]>>(res);
    return json.data.map(normalizeSessionFromApi);
  },

  async create(input: CreateSessionInput): Promise<Session> {
    const safeInput = normalizeCreateSessionInput(input);

    const res = await fetch(`${API_BASE}/api/sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(safeInput),
    });

    const json = await readJson<ApiEnvelope<SessionApiResponse>>(res);
    return normalizeSessionFromApi(json.data);
  },

  async update(
    id: string,
    patch: Partial<Omit<Session, "id" | "createdAt">>,
  ): Promise<Session> {
    const safePatch = normalizeUpdateSessionPatch(patch);

    const res = await fetch(`${API_BASE}/api/sessions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(safePatch),
    });

    const json = await readJson<ApiEnvelope<SessionApiResponse>>(res);
    return normalizeSessionFromApi(json.data);
  },

  async remove(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/api/sessions/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    await readJson<ApiEnvelope<DeleteSessionResponse>>(res);
  },

  async restore(session: Session): Promise<Session> {
    const res = await fetch(`${API_BASE}/api/sessions/restore`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(session),
    });

    const json = await readJson<ApiEnvelope<SessionApiResponse>>(res);
    return normalizeSessionFromApi(json.data);
  },
};
