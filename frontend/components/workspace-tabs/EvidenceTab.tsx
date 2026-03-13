import React from "react";
import type { WorkspaceTabProps } from "../../lib/workspace-types";

export default function EvidenceTab(props: WorkspaceTabProps) {
  const {
    L,
    company,
    suppliers,
    complaints,
    actions,
    events,
    screenings,
    loading,
    expanded,
    editingSup,
    sName,
    setSName,
    sCountry,
    setSCountry,
    sInd,
    setSInd,
    csv,
    setCsv,
    showCapModal,
    setShowCapModal,
    capPara,
    setCapPara,
    triageRes,
    setTriageRes,
    triageLd,
    actionNotes,
    setActionNotes,
    supAI,
    supCAP,
    supLd,
    rYear,
    setRYear,
    draft,
    setDraft,
    draftTs,
    genLd,
    aiMsgs,
    setAiMsgs,
    aiInput,
    setAiInput,
    aiLd,
    saqs,
    saqEmail,
    setSaqEmail,
    saqSup,
    setSaqSup,
    saqDays,
    setSaqDays,
    saqSending,
    kpiLive,
    kpiTrend,
    kpiLd,
    supFilter,
    setSupFilter,
    auditLog,
    auditFilter,
    setAuditFilter,
    auditLd,
    showQuickstart,
    evidences,
    evTitle,
    setEvTitle,
    evType,
    setEvType,
    evLksg,
    setEvLksg,
    evDesc,
    setEvDesc,
    evSupId,
    setEvSupId,
    evFile,
    setEvFile,
    evUploading,
    openAddSupModal,
    openEditSupModal,
    delSupplier,
    recalc,
    importCsv,
    submitComplaint,
    triageComplaint,
    updateComplaintStatus,
    saveComplaintNote,
    createCap,
    updateActionStatus,
    saveActionNote,
    deleteAction,
    loadDraft,
    saveDraft,
    genSection,
    getSupAI,
    getSupCAP,
    sendAi,
    loadAuditLog,
    exportCSV,
    sendSaq,
    deleteSaq,
    loadKpi,
    saveKpiSnapshot,
    uploadEvidence,
    deleteEvidence,
    chipRL,
    sevChip,
    cStatusChip,
    aStatusChip,
    pChip,
    dueBadge,
    RiskBreakdown,
    setTab,
    fileRef,
    score,
    kpis,
    actionStats,
    workspaceAssist,
    BF
  } = props;

  return (
    <>
      <div className="sec-hd" style={{ marginBottom: 16 }}>
        <div>
          <div className="sec-title">{L === "de" ? "Nachweis-Tresor" : "Evidence Vault"}<span className="ltag">§10 LkSG</span></div>
          <div className="sec-sub">{L === "de" ? "§10 Abs. 1 LkSG: Aufbewahrungspflicht 7 Jahre. PDF, JPG, PNG bis 4MB." : "§10 para. 1 LkSG: Retention 7 years. PDF, JPG, PNG up to 4MB."}</div>
        </div>
        <button className="btn btn-ai btn-sm" onClick={() => { setTab("ai"); setTimeout(() => sendAi(L === "de" ? "Welche Nachweise fehlen mir noch fuer ein BAFA-Audit? Pruefe §§ 4-10 LkSG." : "What evidence am I missing for a BAFA audit? Check §§ 4-10 LkSG."), 100); }}>&#9998; {L === "de" ? "Lueckenanalyse" : "Gap analysis"}</button>
      </div>
      <div className="g2">
        <div className="card">
          <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>{L === "de" ? "Dokument hochladen" : "Upload Document"}</div>
          <div style={{ fontSize: 12.5, color: "#6B7280", marginBottom: 14 }}>{L === "de" ? "Auditberichte, CoC, Zertifikate, Trainings-Nachweise..." : "Audit reports, CoC, certificates, training records..."}</div>
          <div className="fl"><label>{L === "de" ? "Titel *" : "Title *"}</label><input className="inp" value={evTitle} onChange={e => setEvTitle(e.target.value)} placeholder={L === "de" ? "z.B. SMETA-Audit Textile Group 2025" : "e.g. SMETA Audit Textile Group 2025"} /></div>
          <div className="inp-row">
            <div className="fl"><label>{L === "de" ? "Typ" : "Type"}</label>
              <select className="sel" value={evType} onChange={e => setEvType(e.target.value)}>
                {([["audit_report","Auditbericht","Audit report"],["coc_signed","CoC unterschrieben","Signed CoC"],["training_record","Trainingsnachweis","Training record"],["cap_document","CAP-Dokument","CAP document"],["certificate","Zertifikat","Certificate"],["saq_response","SAQ-Antwort","SAQ response"],["screenshot","Screenshot","Screenshot"],["email","E-Mail","Email"],["other","Sonstiges","Other"]] as const).map(([v,de,en]) => <option key={v} value={v}>{L === "de" ? de : en}</option>)}
              </select>
            </div>
            <div className="fl"><label>LkSG §</label>
              <select className="sel" value={evLksg} onChange={e => setEvLksg(e.target.value)}>
                {([["","Allgemein","General"],["4","§4"],["5","§5"],["6","§6"],["7","§7"],["8","§8"],["9","§9"],["10","§10"]] as const).map(([v,de,en]) => <option key={v} value={v}>{L === "de" ? de : en}</option>)}
              </select>
            </div>
          </div>
          <div className="fl"><label>{L === "de" ? "Lieferant" : "Supplier"}</label>
            <select className="sel" value={evSupId} onChange={e => setEvSupId(e.target.value)}>
              <option value="">--</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="fl"><label>{L === "de" ? "Notiz" : "Note"}</label><textarea className="ta" rows={2} value={evDesc} onChange={e => setEvDesc(e.target.value)} placeholder={L === "de" ? "Audit-Befunde, Ergebnis..." : "Audit findings, outcome..."} /></div>
          <div className="fl">
            <label>{L === "de" ? "Datei (PDF/JPG/PNG, max 4MB)" : "File (PDF/JPG/PNG, max 4MB)"}</label>
            <div style={{ border: "2px dashed #E2E8E2", borderRadius: 10, padding: "14px 16px", textAlign: "center" as React.CSSProperties["textAlign"], cursor: "pointer", background: evFile ? "#F0FDF4" : "#FAFBFA" }}
              onClick={() => fileRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f && f.size < 4.5*1024*1024) setEvFile(f); else toast("err","max 4MB"); }}>
              <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" style={{ display:"none" }}
                onChange={e => { const f = e.target.files?.[0]; if (f && f.size < 4.5*1024*1024) setEvFile(f); else if(f) toast("err","max 4MB"); }} />
              {evFile
                ? <div style={{ color:"#16A34A",fontWeight:700,fontSize:13 }}>{evFile.name} ({(evFile.size/1024).toFixed(0)}KB)</div>
                : <div style={{ color:"#9CA3AF",fontSize:13 }}>{L === "de" ? "Datei hier ablegen oder klicken" : "Drop file or click"}</div>}
            </div>
          </div>
          <button className="btn btn-p" style={{ width:"100%",marginTop:4 }} onClick={uploadEvidence} disabled={evUploading || !evTitle.trim()}>
            {evUploading ? <span className="spin" /> : null}{L === "de" ? "Dokument speichern" : "Save document"}
          </button>
        </div>
        <div className="card">
          <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 14 }}>{L === "de" ? "Gespeicherte Nachweise" : "Saved Evidence"} <span style={{ color:"#9CA3AF",fontWeight:600 }}>({evidences.length})</span></div>
          {evidences.length > 0 && (
            <div style={{ display:"flex",gap:8,marginBottom:12,flexWrap:"wrap" }}>
              {Array.from(new Set(evidences.map((e: Evidence) => e.type))).map(t => {
                const n = evidences.filter((e: Evidence) => e.type === t).length;
                return <span key={t} className="stat-pill">{t.replace(/_/g," ")}: {n}</span>;
              })}
            </div>
          )}
          <div style={{ display:"flex",flexDirection:"column",gap:8,maxHeight:480,overflowY:"auto" }}>
            {evidences.map((ev: Evidence) => (
              <div key={ev.id} className="card-xs" style={{ borderLeft:"3px solid #1B3D2B" }}>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700,fontSize:13,marginBottom:3 }}>{ev.title}</div>
                    <div style={{ fontSize:11.5,color:"#6B7280",display:"flex",gap:8,flexWrap:"wrap" }}>
                      <span className="chip cu" style={{ fontSize:10 }}>{ev.type.replace(/_/g," ")}</span>
                      {ev.lksg_ref && <span className="ltag">§{ev.lksg_ref}</span>}
                      {ev.supplier_name && <span>&#127970; {ev.supplier_name}</span>}
                      {ev.file_name && <span>&#128206; {ev.file_name}{ev.file_size ? ` (${(ev.file_size/1024).toFixed(0)}KB)` : ""}</span>}
                      <span>{new Date(ev.created_at).toLocaleDateString(L === "de" ? "de-DE" : "en-GB")}</span>
                    </div>
                    {ev.description && <div style={{ fontSize:11.5,color:"#4B5563",marginTop:4 }}>{ev.description}</div>}
                  </div>
                  <div style={{ display:"flex",gap:5,flexShrink:0 }}>
                    {ev.file_name && (
                      <a className="btn btn-g btn-xs"
                        href={`${API}/evidence/${ev.id}/download?token=${encodeURIComponent(tok())}`}
                        target="_blank" rel="noreferrer">&#8595;</a>
                    )}
                    <button className="btn btn-r btn-xs" onClick={() => deleteEvidence(ev.id)}>x</button>
                  </div>
                </div>
              </div>
            ))}
            {!evidences.length && (
              <div className="empty" style={{ padding:"32px 0" }}>
                <div className="empty-ic">&#128194;</div>
                <div className="empty-t">{L === "de" ? "Noch keine Nachweise" : "No evidence yet"}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
