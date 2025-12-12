// src/utils/api.js
const API_BASE = window.READR_API_BASE || "http://localhost:4000";

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;

  const resp = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await resp.json().catch(() => null);

  if (!resp.ok) {
    const message =
      data?.error?.message || `Request failed with status ${resp.status}`;
    throw new Error(message);
  }

  // All API responses are { ok: boolean, data: ... }
  return data.data;
}

/**
 * BOOKS API
 */
export async function apiFetchBooks(params = {}) {
  const searchParams = new URLSearchParams();

  if (params.search) searchParams.set("search", params.search);
  if (params.status) searchParams.set("status", params.status);
  if (typeof params.limit === "number")
    searchParams.set("limit", String(params.limit));
  if (typeof params.offset === "number")
    searchParams.set("offset", String(params.offset));

  const qs = searchParams.toString();
  const path = qs ? `/books?${qs}` : `/books`;

  return request(path, { method: "GET" });
}

export async function apiCreateBook(payload) {
  return request("/books", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function apiUpdateBook(id, patch) {
  return request(`/books/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export async function apiDeleteBook(id) {
  return request(`/books/${id}`, {
    method: "DELETE",
  });
}
