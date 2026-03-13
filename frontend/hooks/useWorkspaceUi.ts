"use client";

import { useState } from "react";
import type { Supplier, Toast } from "../lib/workspace-types";

export default function useWorkspaceUi() {
  const [L, setL] = useState<"de" | "en">("de");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  const [showSupModal, setShowSupModal] = useState(false);
  const [editingSup, setEditingSup] = useState<Supplier | null>(null);
  const [sName, setSName] = useState("");
  const [sCountry, setSCountry] = useState("Germany");
  const [sInd, setSInd] = useState("services");
  const [sSpend, setSSpend] = useState("");
  const [sWorkers, setSWorkers] = useState("");
  const [sAudit, setSAudit] = useState(false);
  const [sCoc, setSCoc] = useState(false);
  const [sCerts, setSCerts] = useState("0");
  const [sSubSup, setSSubSup] = useState("0");
  const [sTransp, setSTransp] = useState("3");
  const [sViolations, setSViolations] = useState(false);
  const [sNotes, setSNotes] = useState("");
  const [csv, setCsv] = useState("name,country,industry\nTextile Group,Bangladesh,textile\nTechParts,China,electronics");

  const [showCapModal, setShowCapModal] = useState(false);
  const [capSup, setCapSup] = useState("");
  const [capTitle, setCapTitle] = useState("");
  const [capDesc, setCapDesc] = useState("");
  const [capPara, setCapPara] = useState("6");
  const [capDue, setCapDue] = useState("");
  const [capPri, setCapPri] = useState("high");
  const [capAssign, setCapAssign] = useState("");

  const [cSup, setCSup] = useState("");
  const [cCat, setCCat] = useState("human_rights");
  const [cSev, setCSev] = useState("medium");
  const [cDesc, setCDesc] = useState("");
  const [cNotes, setCNotes] = useState<Record<string, string>>({});
  const [triageRes, setTriageRes] = useState("");
  const [triageLd, setTriageLd] = useState(false);

  const [actionNotes, setActionNotes] = useState<Record<string, string>>({});
  const [supAI, setSupAI] = useState<Record<string, string>>({});
  const [supCAP, setSupCAP] = useState<Record<string, string>>({});
  const [supLd, setSupLd] = useState<Record<string, boolean>>({});

  const [supFilter, setSupFilter] = useState({ risk: "", country: "", search: "" });
  const [hoverParam, setHoverParam] = useState<string | null>(null);
  const [showQuickstart, setShowQuickstart] = useState(false);

  const [evTitle, setEvTitle] = useState("");
  const [evType, setEvType] = useState("audit_report");
  const [evLksg, setEvLksg] = useState("");
  const [evDesc, setEvDesc] = useState("");
  const [evSupId, setEvSupId] = useState("");
  const [evFile, setEvFile] = useState<File | null>(null);
  const [evUploading, setEvUploading] = useState(false);

  return {
    L, setL,
    toasts, setToasts,
    expanded, setExpanded,
    showSupModal, setShowSupModal,
    editingSup, setEditingSup,
    sName, setSName,
    sCountry, setSCountry,
    sInd, setSInd,
    sSpend, setSSpend,
    sWorkers, setSWorkers,
    sAudit, setSAudit,
    sCoc, setSCoc,
    sCerts, setSCerts,
    sSubSup, setSSubSup,
    sTransp, setSTransp,
    sViolations, setSViolations,
    sNotes, setSNotes,
    csv, setCsv,
    showCapModal, setShowCapModal,
    capSup, setCapSup,
    capTitle, setCapTitle,
    capDesc, setCapDesc,
    capPara, setCapPara,
    capDue, setCapDue,
    capPri, setCapPri,
    capAssign, setCapAssign,
    cSup, setCSup,
    cCat, setCCat,
    cSev, setCSev,
    cDesc, setCDesc,
    cNotes, setCNotes,
    triageRes, setTriageRes,
    triageLd, setTriageLd,
    actionNotes, setActionNotes,
    supAI, setSupAI,
    supCAP, setSupCAP,
    supLd, setSupLd,
    supFilter, setSupFilter,
    hoverParam, setHoverParam,
    showQuickstart, setShowQuickstart,
    evTitle, setEvTitle,
    evType, setEvType,
    evLksg, setEvLksg,
    evDesc, setEvDesc,
    evSupId, setEvSupId,
    evFile, setEvFile,
    evUploading, setEvUploading,
  };
}
