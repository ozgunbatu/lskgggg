import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { TAB_ROUTES } from "../lib/workspace-config";
import type { Msg, TabId } from "../lib/workspace-types";

export default function useWorkspaceRuntime(initialTab: TabId) {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [tab, setTabState] = useState<TabId>(initialTab);

  const [rYear, setRYear] = useState(new Date().getFullYear());
  const [draft, setDraft] = useState<Record<string, string> | null>(null);
  const [draftTs, setDraftTs] = useState("");
  const [genLd, setGenLd] = useState("");

  const [aiMsgs, setAiMsgs] = useState<Msg[]>([]);
  const [aiInput, setAiInput] = useState("");
  const [aiLd, setAiLd] = useState(false);
  const aiEnd = useRef<HTMLDivElement>(null);

  const [saqEmail, setSaqEmail] = useState("");
  const [saqSup, setSaqSup] = useState("");
  const [saqDays, setSaqDays] = useState("30");
  const [saqSending, setSaqSending] = useState(false);

  const [kpiLd, setKpiLd] = useState(false);
  const [auditFilter, setAuditFilter] = useState("");

  const fileRef = useRef<HTMLInputElement>(null);

  const setTab = useCallback((next: TabId) => {
    setTabState(next);
    router.push(TAB_ROUTES[next]);
  }, [router]);

  return {
    mounted, setMounted,
    authChecking, setAuthChecking,
    tab, setTabState, setTab,
    rYear, setRYear,
    draft, setDraft,
    draftTs, setDraftTs,
    genLd, setGenLd,
    aiMsgs, setAiMsgs,
    aiInput, setAiInput,
    aiLd, setAiLd,
    aiEnd,
    saqEmail, setSaqEmail,
    saqSup, setSaqSup,
    saqDays, setSaqDays,
    saqSending, setSaqSending,
    kpiLd, setKpiLd,
    auditFilter, setAuditFilter,
    fileRef,
  };
}
