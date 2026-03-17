"use client";

import { useCallback, useRef, useState } from "react";

export type WorkspaceDomainKey =
  | "company"
  | "suppliers"
  | "complaints"
  | "actions"
  | "saqs"
  | "evidences"
  | "insights"
  | "kpi"
  | "audit";

export type DomainRequestState = {
  loading: boolean;
  error: string | null;
  lastLoadedAt: number | null;
};

const makeState = (): DomainRequestState => ({ loading: false, error: null, lastLoadedAt: null });

const INITIAL: Record<WorkspaceDomainKey, DomainRequestState> = {
  company: makeState(), suppliers: makeState(), complaints: makeState(),
  actions: makeState(), saqs: makeState(), evidences: makeState(),
  insights: makeState(), kpi: makeState(), audit: makeState(),
};

export default function useWorkspaceRequestState() {
  const [domains, setDomains] = useState<Record<WorkspaceDomainKey, DomainRequestState>>(INITIAL);

  // ── STABLE REFS ──────────────────────────────────────────────────────────
  // These refs let the feature-data hooks close over stable fn references
  // instead of the requestState object itself (which changes identity every render).
  const beginRef  = useRef<(key: WorkspaceDomainKey) => void>(null!);
  const succeedRef = useRef<(key: WorkspaceDomainKey) => void>(null!);
  const failRef    = useRef<(key: WorkspaceDomainKey, error: string) => void>(null!);

  const begin = useCallback((key: WorkspaceDomainKey) => {
    setDomains((prev) => ({ ...prev, [key]: { ...prev[key], loading: true, error: null } }));
  }, []);

  const succeed = useCallback((key: WorkspaceDomainKey) => {
    setDomains((prev) => ({ ...prev, [key]: { loading: false, error: null, lastLoadedAt: Date.now() } }));
  }, []);

  const fail = useCallback((key: WorkspaceDomainKey, error: string) => {
    setDomains((prev) => ({ ...prev, [key]: { ...prev[key], loading: false, error: error || "Request failed" } }));
  }, []);

  const clearError = useCallback((key: WorkspaceDomainKey) => {
    setDomains((prev) => ({ ...prev, [key]: { ...prev[key], error: null } }));
  }, []);

  // Keep refs in sync (stable references for feature-data hooks)
  beginRef.current  = begin;
  succeedRef.current = succeed;
  failRef.current    = fail;

  // Stable object that never changes identity — safe to spread into deps
  const stableRef = useRef({
    begin:  (key: WorkspaceDomainKey) => beginRef.current(key),
    succeed: (key: WorkspaceDomainKey) => succeedRef.current(key),
    fail:   (key: WorkspaceDomainKey, error: string) => failRef.current(key, error),
  });

  return { domains, begin: stableRef.current.begin, succeed: stableRef.current.succeed, fail: stableRef.current.fail, clearError, anyLoading: false };
}
