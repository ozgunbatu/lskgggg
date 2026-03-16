"use client";

import { useCallback, useRef } from "react";
import useWorkspaceCache from "./useWorkspaceCache";

type LoaderArgs<T> = {
  key: string;
  force?: boolean;
  currentValue: T;
  hasData: boolean;
  ttlMs?: number;
  fetcher: () => Promise<T>;
  commit: (value: T) => void;
  onStart?: () => void;
  onSuccess?: () => void;
  onError?: (message: string) => void;
  onSettled?: () => void;
};

export default function useWorkspaceQueryResource(cache: ReturnType<typeof useWorkspaceCache>) {
  const inflight = useRef<Record<string, Promise<any>>>({});

  const runCachedQuery = useCallback(async function <T>({
    key,
    force = false,
    currentValue,
    hasData,
    ttlMs = 15000,
    fetcher,
    commit,
    onStart,
    onSuccess,
    onError,
    onSettled,
  }: LoaderArgs<T>): Promise<T> {
    if (!force && hasData && cache.isFresh(key, ttlMs)) return currentValue;
    if (!force && inflight.current[key]) return inflight.current[key] as Promise<T>;

    onStart?.();
    const request = (async () => {
      try {
        const next = await fetcher();
        commit(next);
        cache.markFresh(key);
        onSuccess?.();
        return next;
      } catch (error: any) {
        onError?.(String(error?.message || "Request failed"));
        throw error;
      } finally {
        onSettled?.();
      }
    })();

    inflight.current[key] = request;
    try {
      return await request;
    } finally {
      delete inflight.current[key];
    }
  }, [cache]);

  return { runCachedQuery };
}
