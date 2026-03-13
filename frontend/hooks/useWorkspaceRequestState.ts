"use client";

import { useCallback, useMemo, useState } from "react";

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

export default function useWorkspaceRequestState() {
  const [domains, setDomains] = useState<Record<WorkspaceDomainKey, DomainRequestState>>({
    company: makeState(),
    suppliers: makeState(),
    complaints: makeState(),
    actions: makeState(),
    saqs: makeState(),
    evidences: makeState(),
    insights: makeState(),
    kpi: makeState(),
    audit: makeState(),
  });

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

  const anyLoading = useMemo(() => Object.values(domains).some((x) => x.loading), [domains]);

  return { domains, begin, succeed, fail, clearError, anyLoading };
}
