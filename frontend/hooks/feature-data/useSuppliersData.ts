"use client";

import { useCallback, useRef, useState } from "react";
import useWorkspaceCache from "../useWorkspaceCache";
import useWorkspaceQueryResource from "../useWorkspaceQueryResource";
import { queryKeys } from "../../lib/workspace-query-keys";
import type { Company, Supplier } from "../../lib/workspace-types";
import type { WorkspaceDomainKey } from "../useWorkspaceRequestState";

type ApiFn = (url: string, options?: RequestInit) => Promise<any>;
type ToastFn = (type: "ok" | "err" | "info", msg: string) => void;
type RequestState = { begin: (key: WorkspaceDomainKey) => void; succeed: (key: WorkspaceDomainKey) => void; fail: (key: WorkspaceDomainKey, error: string) => void; };

export default function useSuppliersData({ api, toast, cache, requestState }: { api: ApiFn; toast: ToastFn; cache: ReturnType<typeof useWorkspaceCache>; requestState: RequestState }) {
  const [company, setCompany] = useState<Company | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const { runCachedQuery } = useWorkspaceQueryResource(cache);

  // Refs to hold current values so callbacks don't need state in deps
  const companyRef = useRef<Company | null>(null);
  const suppliersRef = useRef<Supplier[]>([]);

  const setCompanyStable = useCallback((v: Company | null) => {
    companyRef.current = v;
    setCompany(v);
  }, []);

  const setSuppliersStable = useCallback((v: Supplier[]) => {
    suppliersRef.current = v;
    setSuppliers(v);
  }, []);

  const loadCompany = useCallback(async ({ force = false }: { force?: boolean } = {}) => {
    try {
      return await runCachedQuery<Company | null>({
        key: queryKeys.company,
        force,
        currentValue: companyRef.current,
        hasData: !!companyRef.current,
        fetcher: async () => (await api("/companies/me")) || null,
        commit: (next) => setCompanyStable(next || null),
        onStart: () => requestState.begin("company"),
        onSuccess: () => requestState.succeed("company"),
        onError: (msg) => requestState.fail("company", msg),
      });
    } catch (e: any) {
      const msg = String(e?.message || "");
      if (!msg.includes("Session")) toast("err", msg || "Company load failed");
      throw e;
    }
  }, [api, requestState, runCachedQuery, toast, setCompanyStable]);

  const loadSuppliers = useCallback(async ({ force = false }: { force?: boolean } = {}) => {
    try {
      return await runCachedQuery<Supplier[]>({
        key: queryKeys.suppliers,
        force,
        currentValue: suppliersRef.current,
        hasData: suppliersRef.current.length > 0,
        fetcher: async () => {
          const r = await api("/suppliers");
          return Array.isArray(r) ? r : (r?.items ?? []);
        },
        commit: setSuppliersStable,
        onStart: () => requestState.begin("suppliers"),
        onSuccess: () => requestState.succeed("suppliers"),
        onError: (msg) => requestState.fail("suppliers", msg),
      });
    } catch (e: any) {
      const msg = String(e?.message || "");
      if (!msg.includes("Session")) toast("err", msg || "Suppliers load failed");
      throw e;
    }
  }, [api, requestState, runCachedQuery, setSuppliersStable, toast]);

  return {
    company, setCompany: setCompanyStable,
    suppliers, setSuppliers: setSuppliersStable,
    loadCompany, loadSuppliers,
  };
}
