"use client";

import { useCallback, useRef, useState } from "react";
import useWorkspaceCache from "../useWorkspaceCache";
import useWorkspaceQueryResource from "../useWorkspaceQueryResource";
import { auditKey, queryKeys } from "@/lib/workspace-query-keys";
import type { AuditEntry, Evidence, SAQ } from "@/lib/workspace-types";
import type { WorkspaceDomainKey } from "../useWorkspaceRequestState";

type ApiFn = (url: string, options?: RequestInit) => Promise<any>;
type ToastFn = (type: "ok" | "err" | "info", msg: string) => void;
type RequestState = { begin: (key: WorkspaceDomainKey) => void; succeed: (key: WorkspaceDomainKey) => void; fail: (key: WorkspaceDomainKey, error: string) => void; };

export default function useReportsData({ api, toast, cache, requestState }: { api: ApiFn; toast: ToastFn; cache: ReturnType<typeof useWorkspaceCache>; requestState: RequestState }) {
  const [saqs, setSaqs] = useState<SAQ[]>([]);
  const [evidences, setEvidences] = useState<Evidence[]>([]);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [auditLd, setAuditLd] = useState(false);
  const { runCachedQuery } = useWorkspaceQueryResource(cache);

  const saqsRef = useRef<SAQ[]>([]);
  const evidencesRef = useRef<Evidence[]>([]);
  const auditLogRef = useRef<AuditEntry[]>([]);

  const setSaqsStable = useCallback((v: SAQ[]) => { saqsRef.current = v; setSaqs(v); }, []);
  const setEvidencesStable = useCallback((v: Evidence[]) => { evidencesRef.current = v; setEvidences(v); }, []);
  const setAuditLogStable = useCallback((v: AuditEntry[]) => { auditLogRef.current = v; setAuditLog(v); }, []);

  const loadSaqData = useCallback(async ({ force = false }: { force?: boolean } = {}) => {
    try {
      return await runCachedQuery<SAQ[]>({
        key: queryKeys.saqs, force,
        currentValue: saqsRef.current, hasData: saqsRef.current.length > 0,
        fetcher: async () => { const data = await api("/saq"); return Array.isArray(data) ? data : []; },
        commit: setSaqsStable,
        onStart: () => requestState.begin("saqs"),
        onSuccess: () => requestState.succeed("saqs"),
        onError: (msg) => requestState.fail("saqs", msg),
      });
    } catch (e: any) {
      const msg = String(e?.message || "");
      if (!msg.includes("Session")) toast("err", msg || "SAQ load failed");
      throw e;
    }
  }, [api, requestState, runCachedQuery, setSaqsStable, toast]);

  const loadEvidenceData = useCallback(async ({ force = false }: { force?: boolean } = {}) => {
    try {
      return await runCachedQuery<Evidence[]>({
        key: queryKeys.evidences, force,
        currentValue: evidencesRef.current, hasData: evidencesRef.current.length > 0,
        fetcher: async () => { const data = await api("/evidence"); return Array.isArray(data) ? data : []; },
        commit: setEvidencesStable,
        onStart: () => requestState.begin("evidences"),
        onSuccess: () => requestState.succeed("evidences"),
        onError: (msg) => requestState.fail("evidences", msg),
      });
    } catch (e: any) {
      const msg = String(e?.message || "");
      if (!msg.includes("Session")) toast("err", msg || "Evidence load failed");
      throw e;
    }
  }, [api, requestState, runCachedQuery, setEvidencesStable, toast]);

  const loadAuditData = useCallback(async (entityType?: string, { force = false }: { force?: boolean } = {}) => {
    setAuditLd(true);
    requestState.begin("audit");
    try {
      return await runCachedQuery<AuditEntry[]>({
        key: auditKey(entityType), force,
        currentValue: auditLogRef.current, hasData: auditLogRef.current.length > 0,
        fetcher: async () => {
          const url = entityType ? `/audit?entity_type=${entityType}` : "/audit?limit=200";
          const data = await api(url);
          return Array.isArray(data) ? data : [];
        },
        commit: setAuditLogStable,
        onSuccess: () => requestState.succeed("audit"),
        onError: (msg) => requestState.fail("audit", msg),
      });
    } catch (e: any) {
      const msg = String(e?.message || "");
      if (!msg.includes("Session")) toast("err", msg || "Audit load failed");
      throw e;
    } finally {
      setAuditLd(false);
    }
  }, [api, requestState, runCachedQuery, setAuditLogStable, toast]);

  return { saqs, setSaqs: setSaqsStable, evidences, setEvidences: setEvidencesStable, auditLog, setAuditLog: setAuditLogStable, auditLd, setAuditLd, loadSaqData, loadEvidenceData, loadAuditData };
}
