"use client";

import { useCallback, useRef, useState } from "react";
import useWorkspaceCache from "../useWorkspaceCache";
import useWorkspaceQueryResource from "../useWorkspaceQueryResource";
import { queryKeys } from "../../lib/workspace-query-keys";
import type { Action, Complaint } from "../../lib/workspace-types";
import type { WorkspaceDomainKey } from "../useWorkspaceRequestState";

type ApiFn = (url: string, options?: RequestInit) => Promise<any>;
type ToastFn = (type: "ok" | "err" | "info", msg: string) => void;
type RequestState = { begin: (key: WorkspaceDomainKey) => void; succeed: (key: WorkspaceDomainKey) => void; fail: (key: WorkspaceDomainKey, error: string) => void; };

export default function useComplaintsData({ api, toast, cache, requestState }: { api: ApiFn; toast: ToastFn; cache: ReturnType<typeof useWorkspaceCache>; requestState: RequestState }) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const { runCachedQuery } = useWorkspaceQueryResource(cache);

  const complaintsRef = useRef<Complaint[]>([]);
  const actionsRef = useRef<Action[]>([]);

  const setComplaintsStable = useCallback((v: Complaint[]) => { complaintsRef.current = v; setComplaints(v); }, []);
  const setActionsStable = useCallback((v: Action[]) => { actionsRef.current = v; setActions(v); }, []);

  const loadComplaints = useCallback(async ({ force = false }: { force?: boolean } = {}) => {
    try {
      return await runCachedQuery<Complaint[]>({
        key: queryKeys.complaints,
        force,
        currentValue: complaintsRef.current,
        hasData: complaintsRef.current.length > 0,
        fetcher: async () => { const data = await api("/complaints"); return Array.isArray(data) ? data : []; },
        commit: setComplaintsStable,
        onStart: () => requestState.begin("complaints"),
        onSuccess: () => requestState.succeed("complaints"),
        onError: (msg) => requestState.fail("complaints", msg),
      });
    } catch (e: any) {
      const msg = String(e?.message || "");
      if (!msg.includes("Session")) toast("err", msg || "Complaint load failed");
      throw e;
    }
  }, [api, requestState, runCachedQuery, setComplaintsStable, toast]);

  const loadActions = useCallback(async ({ force = false }: { force?: boolean } = {}) => {
    try {
      return await runCachedQuery<Action[]>({
        key: queryKeys.actions,
        force,
        currentValue: actionsRef.current,
        hasData: actionsRef.current.length > 0,
        fetcher: async () => { const data = await api("/actions"); return Array.isArray(data) ? data : []; },
        commit: setActionsStable,
        onStart: () => requestState.begin("actions"),
        onSuccess: () => requestState.succeed("actions"),
        onError: (msg) => requestState.fail("actions", msg),
      });
    } catch (e: any) {
      const msg = String(e?.message || "");
      if (!msg.includes("Session")) toast("err", msg || "Action load failed");
      throw e;
    }
  }, [api, requestState, runCachedQuery, setActionsStable, toast]);

  return { complaints, setComplaints: setComplaintsStable, actions, setActions: setActionsStable, loadComplaints, loadActions };
}
