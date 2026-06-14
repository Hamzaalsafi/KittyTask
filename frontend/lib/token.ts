// Simple JWT store backed by localStorage, with an in-memory cache so the
// API client can read it synchronously on the server-render boundary.
const KEY = "kittytask_token";

let cached: string | null = null;

export function getToken(): string | null {
  if (cached) return cached;
  if (typeof window === "undefined") return null;
  cached = window.localStorage.getItem(KEY);
  return cached;
}

export function setToken(token: string) {
  cached = token;
  if (typeof window !== "undefined") window.localStorage.setItem(KEY, token);
}

export function clearToken() {
  cached = null;
  if (typeof window !== "undefined") window.localStorage.removeItem(KEY);
}
