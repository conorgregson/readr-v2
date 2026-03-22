import { apiFetch } from "./api";

export type ApiEnvelope<T> = {
  ok: boolean;
  data: T;
};

export type ApiErrorEnvelope = {
  ok?: false;
  error?: {
    message?: string;
    code?: string;
    details?: unknown;
  };
};

export async function readJson<T>(res: Response): Promise<T> {
  if (res.status === 204) {
    if (!res.ok) {
      throw new Error(`Request failed with status ${res.status}`);
    }
    return undefined as T;
  }

  const json = (await res.json().catch(() => null)) as
    | ApiEnvelope<T>
    | ApiErrorEnvelope
    | null;

  if (!res.ok) {
    const message =
      json && "error" in json
        ? (json.error?.message ?? `Request failed (${res.status})`)
        : `Request failed (${res.status})`;

    throw new Error(message);
  }

  if (!json || !("data" in json)) {
    throw new Error("Invalid server response");
  }

  return json.data;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await apiFetch(path, options);
  return readJson<T>(res);
}
