import type { CreateSessionInput, Session } from "../types";
import {
  normalizeCreateSessionInput,
  normalizeSessionFromApi,
  normalizeUpdateSessionPatch,
  type SessionApiResponse,
} from "./sessions.normalize";
import { apiRequest } from "../../../shared/api/request";

type DeleteSessionResponse = {
  id: string;
};

export const SessionsService = {
  async list(): Promise<Session[]> {
    const data = await apiRequest<SessionApiResponse[]>("/sessions", {
      method: "GET",
    });

    return data.map(normalizeSessionFromApi);
  },

  async create(input: CreateSessionInput): Promise<Session> {
    const safeInput = normalizeCreateSessionInput(input);

    const data = await apiRequest<SessionApiResponse>("/sessions", {
      method: "POST",
      body: JSON.stringify(safeInput),
    });

    return normalizeSessionFromApi(data);
  },

  async update(
    id: string,
    patch: Partial<Omit<Session, "id" | "createdAt">>,
  ): Promise<Session> {
    const safePatch = normalizeUpdateSessionPatch(patch);

    const data = await apiRequest<SessionApiResponse>(`/sessions/${id}`, {
      method: "PATCH",
      body: JSON.stringify(safePatch),
    });

    return normalizeSessionFromApi(data);
  },

  async remove(id: string): Promise<void> {
    await apiRequest<DeleteSessionResponse>(`/sessions/${id}`, {
      method: "DELETE",
    });
  },

  async restore(session: Session): Promise<Session> {
    const data = await apiRequest<SessionApiResponse>("/sessions/restore", {
      method: "POST",
      body: JSON.stringify(session),
    });

    return normalizeSessionFromApi(data);
  },
};
