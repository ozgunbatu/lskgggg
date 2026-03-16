import React from "react";
import { daysDiff } from "./workspace-constants";
import type { Lang, RL } from "./workspace-types";

export function chipRL(l: RL) { return l === "high" ? "chip ch" : l === "medium" ? "chip cm" : l === "low" ? "chip cl" : "chip cu"; }

export function sevChip(s: string) {
  return <span className={s === "critical" || s === "high" ? "chip ch" : s === "medium" ? "chip cm" : "chip cl"}>{s.toUpperCase()}</span>;
}

export function cStatusChip(s: string, L: Lang) {
  const m: Record<string, [string, string, string]> = { open: ["chip ch", "Offen", "Open"], in_review: ["chip cb", "In Prufung", "In review"], investigating: ["chip cv", "Ermittlung", "Investigating"], resolved: ["chip cl", "Geloest", "Resolved"], closed: ["chip cu", "Geschlossen", "Closed"] };
  const [cls, de, en] = m[s] || ["chip cu", s, s];
  return <span className={cls}>{L === "de" ? de : en}</span>;
}

export function aStatusChip(s: string, L: Lang) {
  const m: Record<string, [string, string, string]> = { open: ["chip cm", "Offen", "Open"], in_progress: ["chip cb", "In Bearbeitung", "In progress"], completed: ["chip cl", "Abgeschlossen", "Completed"], overdue: ["chip ch", "Uberfaellig", "Overdue"], closed: ["chip cu", "Geschlossen", "Closed"] };
  const [cls, de, en] = m[s] || ["chip cu", s, s];
  return <span className={cls}>{L === "de" ? de : en}</span>;
}

export function pChip(p: string) {
  return p === "critical" ? <span className="chip ch">CRITICAL</span> : p === "high" ? <span className="chip ch">HIGH</span> : p === "medium" ? <span className="chip cb">MEDIUM</span> : <span className="chip cu">LOW</span>;
}

export function dueBadge(d: string | null | undefined, L: Lang) {
  if (!d) return null;
  const days = daysDiff(d); if (days === null) return null;
  if (days < 0)  return <span className="badge-err">{L === "de" ? `${Math.abs(days)}T ueberf.` : `${Math.abs(days)}d over`}</span>;
  if (days <= 7) return <span className="badge-warn">{L === "de" ? `${days}T verbl.` : `${days}d left`}</span>;
  return <span className="badge-ok">{L === "de" ? `${days}T verbl.` : `${days}d left`}</span>;
}
