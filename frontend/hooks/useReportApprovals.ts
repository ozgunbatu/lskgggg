import { useCallback, useEffect, useMemo, useState } from "react";
import { API } from "../lib/api";
import { getSessionRole, getToken } from "../lib/auth";

export type ApprovalRow = {
  id: string;
  entity_type: string;
  entity_id: string | null;
  status: "pending" | "approved" | "rejected" | string;
  requested_by: string | null;
  reviewed_by: string | null;
  approval_notes: string | null;
  requested_at: string;
  reviewed_at?: string | null;
  updated_at?: string;
  due_at?: string | null;
  sla_days?: number | null;
};

export type ApprovalHookState = {
  rows: ApprovalRow[];
  pending: number;
  approved: number;
  rejected: number;
  lastStatus: string;
  oldestPendingDays: number;
  pendingWithinSla: number;
  slaBreaches: number;
  pendingAging: { fresh: number; warning: number; urgent: number };
  loading: boolean;
  notes: string;
  setNotes: (v: string) => void;
  currentRole: string;
  canRequest: boolean;
  canApprove: boolean;
  draftLocked: boolean;
  loadApprovals: () => Promise<void>;
  requestApproval: (year: number, toast?: (type: "ok" | "err" | "info", msg: string) => void, L?: "de" | "en") => Promise<void>;
  reviewApproval: (year: number, decision: "approved" | "rejected", toast?: (type: "ok" | "err" | "info", msg: string) => void, L?: "de" | "en") => Promise<void>;
};

export default function useReportApprovals(): ApprovalHookState {
  const token = getToken();
  const currentRole = useMemo(() => getSessionRole(token), [token]);
  const [rows, setRows] = useState<ApprovalRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState("");

  const loadApprovals = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/reports/approvals`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json().catch(() => []);
      setRows(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { void loadApprovals(); }, [loadApprovals]);

  const requestApproval = useCallback(async (year: number, toast, L: "de" | "en" = "en") => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/reports/bafa/${year}/request-approval`, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notes }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `Error ${res.status}`);
      toast?.("ok", L === "de" ? "Freigabe angefragt" : "Approval requested");
      await loadApprovals();
    } catch (err: any) {
      toast?.("err", err?.message || (L === "de" ? "Freigabe konnte nicht angefragt werden" : "Could not request approval"));
    } finally {
      setLoading(false);
    }
  }, [loadApprovals, notes, token]);

  const reviewApproval = useCallback(async (year: number, decision: "approved" | "rejected", toast, L: "de" | "en" = "en") => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/reports/bafa/${year}/approve`, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ decision, notes }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `Error ${res.status}`);
      toast?.("ok", decision === "approved" ? (L === "de" ? "Bericht freigegeben" : "Report approved") : (L === "de" ? "Bericht abgelehnt" : "Report rejected"));
      await loadApprovals();
    } catch (err: any) {
      toast?.("err", err?.message || (L === "de" ? "Freigabe-Aktion fehlgeschlagen" : "Approval action failed"));
    } finally {
      setLoading(false);
    }
  }, [loadApprovals, notes, token]);

  const pendingRows = rows.filter(r => r.status === "pending");
  const pending = pendingRows.length;
  const approved = rows.filter(r => r.status === "approved").length;
  const rejected = rows.filter(r => r.status === "rejected").length;
  const lastStatus = rows[0]?.status || "none";
  const ageDays = (ts?: string) => {
    if (!ts) return 0;
    const ms = Date.now() - new Date(ts).getTime();
    return Math.max(0, Math.floor(ms / 86400000));
  };
  const ages = pendingRows.map(r => {
    if (r.due_at) {
      const dueMs = new Date(r.due_at).getTime();
      const reqMs = new Date(r.requested_at || r.updated_at || r.due_at).getTime();
      const slaMs = Math.max(1, dueMs - reqMs);
      const elapsedMs = Date.now() - reqMs;
      return Math.max(0, Math.floor(elapsedMs / 86400000));
    }
    return ageDays(r.requested_at || r.updated_at || "");
  });
  const oldestPendingDays = ages.length ? Math.max(...ages) : 0;
  const pendingAging = {
    fresh: ages.filter(d => d <= 2).length,
    warning: ages.filter(d => d >= 3 && d <= 5).length,
    urgent: ages.filter(d => d >= 6).length,
  };
  const pendingWithinSla = pendingAging.fresh + pendingAging.warning;
  const slaBreaches = pendingAging.urgent;
  const canApprove = ["approver", "admin"].includes(currentRole);
  const canRequest = currentRole !== "viewer";
  const draftLocked = pending > 0 && !canApprove;

  return { rows, pending, approved, rejected, lastStatus, oldestPendingDays, pendingWithinSla, slaBreaches, pendingAging, loading, notes, setNotes, currentRole, canRequest, canApprove, draftLocked, loadApprovals, requestApproval, reviewApproval };
}
