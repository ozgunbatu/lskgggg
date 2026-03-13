export const API = process.env.NEXT_PUBLIC_API_URL || "https://api.lksgcompass.de";

// Deduplicate error toasts — track last-shown message per error type
const lastToastAt: Record<string, number> = {};
const TOAST_DEBOUNCE_MS = 4000;

export function shouldShowToast(key: string): boolean {
  const now = Date.now();
  if ((now - (lastToastAt[key] ?? 0)) > TOAST_DEBOUNCE_MS) {
    lastToastAt[key] = now;
    return true;
  }
  return false;
}

// Inflight deduplication: don't fire the same GET twice simultaneously
const inflight: Map<string, Promise<any>> = new Map();

export function createApiClient(getToken: () => string, onUnauthorized?: () => void) {
  return async function api(path: string, init: RequestInit = {}) {
    const headers = new Headers(init.headers || {});
    if (!headers.has("Content-Type") && !(init.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }
    const token = getToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);

    // Deduplicate concurrent GET requests to the same path
    const isGet = !init.method || init.method.toUpperCase() === "GET";
    const dedupeKey = isGet ? path : null;

    if (dedupeKey && inflight.has(dedupeKey)) {
      return inflight.get(dedupeKey);
    }

    const request = (async () => {
      const res = await fetch(`${API}${path}`, { ...init, headers });
      const data = await res.json().catch(() => ({}));

      if (res.status === 401) {
        onUnauthorized?.();
        throw new Error("Session");
      }
      if (res.status === 429) {
        throw new Error("rate_limited");
      }
      if (!res.ok) throw new Error((data as any)?.error || `Error ${res.status}`);
      return data;
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
