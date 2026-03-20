import { apiFetch, clearToken } from "../../../shared/api/api";

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

export type AuthUser = {
  id: string;
  email: string;
};

export type AuthSuccessData = {
  token: string;
  user: AuthUser;
};

type MeResponse = {
  user: AuthUser;
};

type CredentialInputs = {
  email: string;
  password: string;
};

async function readJson<T>(res: Response): Promise<T> {
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
    throw new Error("Invalid server response.");
  }

  return json.data;
}

export const AuthService = {
  async register(input: CredentialInputs): Promise<AuthSuccessData> {
    const res = await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email: input.email.trim(),
        password: input.password,
      }),
    });

    return readJson<AuthSuccessData>(res);
  },

  async login(input: CredentialInputs): Promise<AuthSuccessData> {
    const res = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: input.email.trim(),
        password: input.password,
      }),
    });

    return readJson<AuthSuccessData>(res);
  },

  async me(): Promise<AuthUser> {
    const res = await apiFetch("/auth/me", {
      method: "GET",
    });

    try {
      const data = await readJson<MeResponse>(res);
      return data.user;
    } catch (error) {
      clearToken();
      throw error;
    }
  },
};
