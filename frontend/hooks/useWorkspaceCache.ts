"use client";

import { useCallback, useRef } from "react";

export default function useWorkspaceCache() {
  const stamps = useRef<Record<string, number>>({});

  const isFresh = useCallback((key: string, ttlMs = 15000) => {
    const at = stamps.current[key] || 0;
    return Date.now() - at < ttlMs;
  }, []);

  const markFresh = useCallback((key: string) => {
    stamps.current[key] = Date.now();
  }, []);

  const invalidate = useCallback((key: string) => {
    delete stamps.current[key];
  }, []);

  const invalidateMany = useCallback((keys: string[]) => {
    for (const key of keys) delete stamps.current[key];
  }, []);

  return { isFresh, markFresh, invalidate, invalidateMany };
}
