"use client";

import { useEffect } from "react";
import { clearToken, validateSession } from "../lib/auth";
import type { Lang, TabId } from "../lib/workspace-types";

function readLang(): Lang {
  return typeof window === "undefined" ? "de" : ((localStorage.getItem("lang") || "de") as Lang);
}

function persistQuickstartVisibility(show: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem("lksg_quickstart_hidden", show ? "0" : "1");
}

type Args = {
  mounted: boolean;
  setMounted: (value: boolean) => void;
  authChecking: boolean;
  setAuthChecking: (value: boolean) => void;
  tab: TabId;
  draft: Record<string, string> | null;
  aiMsgs: Array<unknown>;
  aiEnd: { current: HTMLDivElement | null };
  setL: (lang: Lang) => void;
  setShowQuickstart: (value: boolean) => void;
  loadCoreData: () => void | Promise<void>;
  loadMonitoringData: () => void | Promise<void>;
  loadSaqData: () => void | Promise<void>;
  loadEvidenceData: () => void | Promise<void>;
  loadDraft: () => void | Promise<void>;
  loadKpi: () => void | Promise<void>;
  loadAuditLog: () => void | Promise<void>;
};

export default function useWorkspaceSession({
  mounted,
  setMounted,
  authChecking,
  setAuthChecking,
  tab,
  draft,
  aiMsgs,
  aiEnd,
  setL,
  setShowQuickstart,
  loadCoreData,
  loadMonitoringData,
  loadSaqData,
  loadEvidenceData,
  loadDraft,
  loadKpi,
  loadAuditLog,
}: Args) {
  useEffect(() => {
    setMounted(true);
    setL(readLang());

    (async () => {
      const status = await validateSession();
      if (!status.ok) {
        clearToken();
        window.location.href = "/login";
        return;
      }
      setAuthChecking(false);
    })();
  }, [setMounted, setL, setAuthChecking]);

  useEffect(() => {
    if (!mounted || authChecking) return;
    loadCoreData();
  }, [mounted, authChecking, loadCoreData]);

  useEffect(() => {
    if (!mounted) return;
    const hidden = typeof window !== "undefined" && localStorage.getItem("lksg_quickstart_hidden") === "1";
    setShowQuickstart(!hidden);
  }, [mounted, setShowQuickstart]);

  useEffect(() => {
    aiEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [aiMsgs, aiEnd]);

  useEffect(() => {
    if (tab === "monitoring") loadMonitoringData();
    if (tab === "kpi") loadKpi();
    if (tab === "saq") loadSaqData();
    if (tab === "evidence") loadEvidenceData();
    if (tab === "audit") loadAuditLog();
    if (tab === "reports" && !draft) loadDraft();
  }, [tab, draft, loadMonitoringData, loadKpi, loadSaqData, loadEvidenceData, loadAuditLog, loadDraft]);

  const dismissQuickstart = () => {
    setShowQuickstart(false);
    persistQuickstartVisibility(false);
  };

  const changeLang = (lang: Lang) => {
    if (typeof window !== "undefined") localStorage.setItem("lang", lang);
    setL(lang);
  };

  const logout = () => {
    clearToken();
    window.location.href = "/";
  };

  return { dismissQuickstart, changeLang, logout };
}
