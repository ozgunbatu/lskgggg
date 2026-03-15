import type { TabId } from "./workspace-types";

export const TABS: Array<{ id: TabId; de: string; en: string }> = [
  { id: "dashboard",  de: "Dashboard",       en: "Dashboard" },
  { id: "suppliers",  de: "Lieferanten",     en: "Suppliers" },
  { id: "actions",    de: "Aktionsplan",     en: "Action Center" },
  { id: "complaints", de: "Beschwerden",     en: "Complaints" },
  { id: "saq",        de: "SAQ",             en: "SAQ" },
  { id: "kpi",        de: "Wirksamkeit",     en: "Effectiveness" },
  { id: "reports",    de: "BAFA-Bericht",    en: "BAFA Report" },
  { id: "evidence",   de: "Nachweise",       en: "Evidence" },
  { id: "monitoring", de: "Monitoring",      en: "Monitoring" },
  { id: "ai",         de: "KI-Assistent",    en: "AI Assistant" },
  { id: "audit",      de: "Audit Trail",     en: "Audit Trail" },
  { id: "legal",      de: "Rechtsassistent", en: "Legal Assistant" },
  { id: "settings",   de: "Einstellungen",   en: "Settings" },
];

export const TAB_ROUTES: Record<TabId, string> = {
  dashboard: "/app/dashboard",
  suppliers: "/app/suppliers",
  actions: "/app/actions",
  complaints: "/app/complaints",
  saq: "/app/saq-center",
  kpi: "/app/kpi",
  reports: "/app/reports",
  evidence: "/app/evidence",
  monitoring: "/app/monitoring",
  ai: "/app/ai",
  audit: "/app/audit",
  legal: "/app/legal",
  settings: "/app/settings",
};

export const NAV_GROUPS: Array<{ key: string; de: string; en: string; tabs: TabId[] }> = [
  { key: "overview", de: "Überblick", en: "Overview", tabs: ["dashboard", "kpi", "reports"] },
  { key: "operations", de: "Betrieb", en: "Operations", tabs: ["suppliers", "actions", "complaints", "evidence"] },
  { key: "assurance", de: "Prüfung & Monitoring", en: "Assurance & Monitoring", tabs: ["saq", "monitoring", "audit"] },
  { key: "platform", de: "Plattform", en: "Platform", tabs: ["ai", "legal", "settings"] },
];
