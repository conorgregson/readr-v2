const envBase = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");

if (!envBase && !import.meta.env.DEV) {
  throw new Error("Missing VITE_API_BASE_URL in production");
}

const API_BASE = envBase || "http://localhost:4000";

const TOKEN_KEY = "readr.auth.token";

let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // ignore storage failures
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore storage failures
  }
}

export type ApiFetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

function isJsonBody(
  body: unknown,
): body is Record<string, unknown> | unknown[] {
  if (body == null) return false;
  if (typeof body !== "object") return false;

  return !(
    body instanceof FormData ||
    body instanceof URLSearchParams ||
    body instanceof Blob ||
    body instanceof ArrayBuffer
  );
}

export async function apiFetch(path: string, options: ApiFetchOptions = {}) {
  const token = getToken();
  const headers = new Headers(options.headers);

  let body: BodyInit | null | undefined;

  if (isJsonBody(options.body)) {
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    body = JSON.stringify(options.body);
  } else if (options.body == null) {
    body = undefined;
  } else {
    body = options.body as BodyInit;
    if (!headers.has("Content-Type") && !(body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE}/api${path}`, {
    ...options,
    headers,
    body,
  });

  if (res.status === 401) {
    unauthorizedHandler?.();
  }

  return res;
}
