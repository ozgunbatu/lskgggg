/**
 * API client — always uses /api/* proxy (Next.js rewrites to BACKEND_URL).
 * Never calls backend directly from browser — no CORS issues.
 * 
 * NEXT_PUBLIC_API_URL is kept for backward compat but ONLY used server-side
 * (in rewrites). Client always calls /api/*.
 */

// Always use /api proxy — Next.js rewrites /api/* to BACKEND_URL server-side
export const API = "/api";

const DEFAULT_TIMEOUT_MS = 12000;

function readBodySafely(res: Response) {
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json().catch(() => ({}));
  }
  return res.text().catch(() => "");
}

function toUserFacingError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error || "Unknown error");
  if (message === "rate_limited") return message;
  if (message === "Session") return message;
  if (message.includes("aborted") || message.includes("timeout")) return "Request timeout";
  if (message.includes("fetch") || message.includes("network") || message.includes("Network")) return "Network request failed";
  return message;
}

// Inflight deduplication for GET requests
const inflight: Map<string, Promise<any>> = new Map();

export function createApiClient(getToken: () => string, onUnauthorized?: () => void) {
  return async function api(path: string, init: RequestInit = {}) {
    const headers = new Headers(init.headers || {});
    if (!headers.has("Content-Type") && !(init.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }
    const token = getToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);

    const isGet = !init.method || init.method.toUpperCase() === "GET";
    const dedupeKey = isGet ? `${path}:${token ? "auth" : "anon"}` : null;

    if (dedupeKey && inflight.has(dedupeKey)) {
      return inflight.get(dedupeKey);
    }

    const request = (async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort("timeout"), DEFAULT_TIMEOUT_MS);
      try {
        const res = await fetch(`${API}${path}`, { ...init, headers, signal: init.signal ?? controller.signal, cache: init.cache ?? "no-store" });
        const data = await readBodySafely(res);
        if (res.status === 401) { onUnauthorized?.(); throw new Error("Session"); }
        if (res.status === 429) throw new Error("rate_limited");
        if (!res.ok) {
          const fallback = typeof data === "string" ? data : (data as any)?.error;
          throw new Error(fallback || `Error ${res.status}`);
        }
        return data;
      } catch (error) {
        throw new Error(toUserFacingError(error));
      } finally {
        clearTimeout(timeout);
      }
    })();

    if (dedupeKey) {
      inflight.set(dedupeKey, request);
      request.finally(() => inflight.delete(dedupeKey));
    }
    return request;
  };
}

export async function downloadWithAuth(endpoint: string, token: string, filename: string) {
  const res = await fetch(`${API}${endpoint}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`Export failed (${res.status})`);
  const blob = await res.blob();
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
