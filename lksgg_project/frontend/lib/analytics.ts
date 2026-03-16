export type AnalyticsEvent = {
  name: string;
  props?: Record<string, unknown>;
  at?: string;
};

const KEY = "lksg_analytics_events";

export function trackEvent(name: string, props?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const next: AnalyticsEvent = { name, props, at: new Date().toISOString() };
  try {
    const current = JSON.parse(localStorage.getItem(KEY) || "[]");
    current.unshift(next);
    localStorage.setItem(KEY, JSON.stringify(current.slice(0, 100)));
  } catch {}
}

export function getTrackedEvents(): AnalyticsEvent[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}
