import { API } from "./api";

const TOKEN_KEY = "token";
const COOKIE_KEY = "lksg_token";

export function getToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(TOKEN_KEY) || "";
}

export function setToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  document.cookie = `${COOKIE_KEY}=${encodeURIComponent(token)}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;
}

export function clearToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  document.cookie = `${COOKIE_KEY}=; path=/; max-age=0; samesite=lax`;
}

export async function validateSession(token = getToken()) {
  if (!token) return { ok: false as const };
  try {
    const r = await fetch(`${API}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!r.ok) {
      clearToken();
      return { ok: false as const };
    }
    const data = await r.json().catch(() => ({}));
    return { ok: true as const, data };
  } catch {
    return { ok: false as const, networkError: true as const };
  }
}


type JwtPayload = { role?: string; email?: string; userId?: string; companyId?: string; exp?: number };

export function parseJwt(token = getToken()): JwtPayload | null {
  try {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch {
    return null;
  }
}

export function getSessionRole(token = getToken()) {
  return parseJwt(token)?.role || 'viewer';
}

export function getSessionEmail(token = getToken()) {
  return parseJwt(token)?.email || '';
}
