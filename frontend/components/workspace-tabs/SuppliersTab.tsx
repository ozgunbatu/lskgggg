"use client";

export default function SuppliersTab(props: any) {
  const { L, suppliers, kpis, loading, expanded, setExpanded, supFilter, setSupFilter,
    openAddSupModal, openEditSupModal, delSupplier, recalc, importCsv, exportCSV,
    csv, setCsv, setShowCapModal, setCapPara, chipRL, getSupAI, getSupCAP,
    supAI, supCAP, supLd, RiskBreakdown, fileRef, approvalMeta, setTab } = props;

  const writable = approvalMeta?.currentRole !== "viewer";
  const RL_COL: Record<string,string> = { high:"var(--red)", medium:"var(--amb)", low:"var(--g-lo)", unknown:"var(--t3)" };

  const visible = suppliers.filter((s:any) => {
    const q = (supFilter.search||"").toLowerCase();
    return (!q || s.name?.toLowerCase().includes(q) || s.country?.toLowerCase().includes(q) || s.industry?.toLowerCase().includes(q))
      && (!supFilter.risk || s.risk_level === supFilter.risk)
      && (!supFilter.country || s.country === supFilter.country);
  });

  const counts = {
    high: suppliers.filter((s:any)=>s.risk_level==="high").length,
    medium: suppliers.filter((s:any)=>s.risk_level==="medium").length,
    low: suppliers.filter((s:any)=>s.risk_level==="low").length,
  };

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:12 }}>

      {/* Stats */}
      <div className="kpi-row">
        {[
          { lbl:L==="de"?"Gesamt":"Total", val:kpis.total, col:"var(--t1)", acc:"var(--b2)" },
          { lbl:L==="de"?"Hochrisiko":"High risk", val:counts.high, col:"var(--red)", acc:"var(--red)" },
          { lbl:L==="de"?"Mittelrisiko":"Medium", val:counts.medium, col:"var(--amb)", acc:"var(--amb)" },
          { lbl:L==="de"?"Länder":"Countries", val:kpis.countries, col:"var(--blu)", acc:"var(--blu)" },
        ].map(k => (
          <div key={k.lbl} className="kpi">
            <div className="kpi-accent" style={{ background:k.acc }}/>
            <div className="kpi-lbl">{k.lbl}</div>
            <div className="kpi-val" style={{ color:k.col,fontSize:24 }}>{k.val}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display:"flex",gap:8,alignItems:"center",flexWrap:"wrap" }}>
        <input className="inp" style={{ height:34,width:200,fontSize:12.5 }}
          placeholder={L==="de"?"Suchen…":"Search…"} value={supFilter.search||""}
          onChange={e => setSupFilter((f:any) => ({ ...f, search: e.target.value }))}/>
        <select className="sel" style={{ height:34,width:130,fontSize:12.5 }}
          value={supFilter.risk||""} onChange={e => setSupFilter((f:any) => ({ ...f, risk: e.target.value }))}>
          <option value="">{L==="de"?"Alle Risiken":"All risks"}</option>
          <option value="high">{L==="de"?"Hochrisiko":"High"}</option>
          <option value="medium">{L==="de"?"Mittelrisiko":"Medium"}</option>
          <option value="low">{L==="de"?"Niedrig":"Low"}</option>
        </select>
        <select className="sel" style={{ height:34,width:130,fontSize:12.5 }}
          value={supFilter.country||""} onChange={e => setSupFilter((f:any) => ({ ...f, country: e.target.value }))}>
          <option value="">{L==="de"?"Alle Länder":"All countries"}</option>
          {[...new Set(suppliers.map((s:any)=>s.country))].filter(Boolean).sort().map((c:any) =>
            <option key={c} value={c}>{c}</option>)}
        </select>
        <div style={{ flex:1 }}/>
        <button className="btn btn-g btn-sm" onClick={() => exportCSV("/suppliers/export/csv","lieferanten.csv")}>↓ CSV</button>
        <button className="btn btn-g btn-sm" onClick={recalc} disabled={loading||!writable}>
          {loading?<span className="spin-d"/>:"↺"} {L==="de"?"Berechnen":"Recalc"}
        </button>
        <button className="btn btn-p btn-sm" onClick={openAddSupModal} disabled={!writable}>
          + {L==="de"?"Lieferant":"Supplier"}
        </button>
      </div>

      {/* Table */}
      {kpis.total > 0 ? (
        <div className="tbl-wrap">
          <table>
            <thead><tr>
              <th>{L==="de"?"Lieferant":"Supplier"}</th>
              <th>{L==="de"?"Land":"Country"}</th>
              <th>{L==="de"?"Branche":"Industry"}</th>
              <th>{L==="de"?"Risiko":"Risk"}</th>
              <th>Score</th>
              <th>Docs</th>
              <th/>
            </tr></thead>
            <tbody>
              {visible.map((s:any) => {
                const isExp = expanded === s.id;
                const rCol = RL_COL[s.risk_level]||"var(--t3)";
                return (
                  <>
                    <tr key={s.id} className="clickable" onClick={() => setExpanded(isExp?null:s.id)}>
                      <td>
                        <div style={{ fontWeight:600,fontSize:13,color:"var(--t1)" }}>{s.name}</div>
                        {s.notes && <div style={{ fontSize:11,color:"var(--t3)",marginTop:1 }}>{s.notes.substring(0,48)}{s.notes.length>48?"…":""}</div>}
                      </td>
                      <td><span className="mono" style={{ color:"var(--t2)" }}>{s.country||"—"}</span></td>
                      <td style={{ fontSize:12,color:"var(--t2)" }}>{s.industry||"—"}</td>
                      <td>
                        <span className={chipRL(s.risk_level)} style={{ fontSize:10.5 }}>
                          {s.risk_level==="high"?(L==="de"?"Hoch":"High"):s.risk_level==="medium"?(L==="de"?"Mittel":"Med"):s.risk_level==="low"?(L==="de"?"Niedrig":"Low"):(L==="de"?"—":"—")}
                        </span>
                      </td>
                      <td>
                        <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                          <div style={{ width:48,height:3,borderRadius:2,background:"var(--c3)",overflow:"hidden" }}>
                            <div style={{ width:`${s.risk_score}%`,height:"100%",background:rCol }}/>
                          </div>
                          <span style={{ fontSize:12,fontWeight:700,color:rCol,fontVariantNumeric:"tabular-nums" }}>{s.risk_score}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display:"flex",gap:4 }}>
                          {s.has_audit && <span className="chip cl" style={{ fontSize:10 }}>Audit</span>}
                          {s.has_code_of_conduct && <span className="chip cb" style={{ fontSize:10 }}>CoC</span>}
                          {!s.has_audit && !s.has_code_of_conduct && <span style={{ color:"var(--t4)",fontSize:12 }}>—</span>}
                        </div>
                      </td>
                      <td>
                        <div className="brow" style={{ gap:4 }}>
                          <button className="btn btn-g btn-xs" onClick={e=>{e.stopPropagation();writable&&openEditSupModal(s);}} disabled={!writable}>Edit</button>
                          <button className="btn btn-r btn-xs" onClick={e=>{e.stopPropagation();writable&&delSupplier(s.id,s.name);}} disabled={!writable}>✕</button>
                        </div>
                      </td>
                    </tr>
                    {isExp && (
                      <tr key={s.id+"_exp"}>
                        <td colSpan={7} style={{ background:"var(--c2)",padding:"16px 18px",borderTop:"1px solid var(--b1)" }}>
                          <div className="g2">
                            <div>
                              <div className={`al al-${s.risk_level==="high"?"err":s.risk_level==="medium"?"warn":"ok"}`} style={{ marginBottom:12 }}>
                                <span className="al-icon">{s.risk_level==="high"?"⚠":"ℹ"}</span>
                                <div style={{ fontSize:12.5 }}>
                                  <strong>§{s.risk_level==="high"?"6":"4"} LkSG: </strong>
                                  {s.risk_level==="high"?(L==="de"?"Sofortiger CAP + Audit erforderlich.":"Immediate CAP + Audit required."):s.risk_level==="medium"?(L==="de"?"Präventionsmaßnahmen einleiten.":"Implement preventive measures."):(L==="de"?"Periodisches Monitoring ausreichend.":"Periodic monitoring sufficient.")}
                                </div>
                              </div>
                              <div style={{ display:"flex",gap:6,flexWrap:"wrap",marginBottom:12 }}>
                                {s.workers&&<span className="stat-pill">👥 {s.workers.toLocaleString()}</span>}
                                {s.annual_spend_eur&&<span className="stat-pill">€ {(s.annual_spend_eur/1000).toFixed(0)}k</span>}
                                {s.certification_count?<span className="stat-pill">✓ {s.certification_count} Certs</span>:null}
                              </div>
                              <div className="brow">
                                <button className="btn btn-ai btn-xs" onClick={()=>writable&&getSupAI(s)} disabled={supLd[s.id]||!writable}>
                                  {supLd[s.id]?<span className="spin"/>:"✦"} {L==="de"?"KI-Analyse":"AI Analysis"}
                                </button>
                                {s.risk_level==="high"&&(
                                  <button className="btn btn-ai btn-xs" onClick={()=>writable&&getSupCAP(s)} disabled={!writable}>
                                    ⚡ {L==="de"?"KI-CAP":"AI CAP"}
                                  </button>
                                )}
                                <button className="btn btn-p btn-xs" onClick={()=>{writable&&setCapPara(s.risk_level==="high"?"6":"4");setShowCapModal(true);}} disabled={!writable}>+ CAP</button>
                              </div>
                              {supAI[s.id]&&<div style={{ background:"var(--c2)",border:"1px solid var(--b2)",borderRadius:"var(--r2)",padding:12,marginTop:10,fontSize:12.5,lineHeight:1.7,whiteSpace:"pre-wrap",color:"var(--t2)" }}>{supAI[s.id]}</div>}
                              {supCAP[s.id]&&<div style={{ background:"var(--amb-5)",border:"1px solid var(--amb-15)",borderRadius:"var(--r2)",padding:12,marginTop:8,fontSize:12.5,lineHeight:1.7,whiteSpace:"pre-wrap",color:"var(--amb)" }}><strong>KI-CAP (§6 LkSG):{"\n"}</strong>{supCAP[s.id]}</div>}
                            </div>
                            <RiskBreakdown sup={s}/>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty card">
          <div className="empty-ic">◎</div>
          <div className="empty-t">{L==="de"?"Keine Lieferanten":"No suppliers"}</div>
          <div className="empty-c">{L==="de"?"CSV importieren oder ersten Lieferanten manuell anlegen.":"Import a CSV or add the first supplier manually."}</div>
          <div className="brow" style={{ justifyContent:"center",marginTop:14 }}>
            <button className="btn btn-p btn-sm" onClick={openAddSupModal} disabled={!writable}>+ {L==="de"?"Anlegen":"Add"}</button>
          </div>
        </div>
      )}

      {/* CSV import */}
      <div className="card">
        <div className="sec-title" style={{ marginBottom:4 }}>{L==="de"?"CSV-Import":"CSV Import"}</div>
        <div className="sec-sub" style={{ marginBottom:12 }}>{L==="de"?"Format: name,country,industry,spend,workers":"Format: name,country,industry,spend,workers"}</div>
        <textarea className="ta" rows={4} value={csv} onChange={e=>setCsv(e.target.value)}
          style={{ fontFamily:"'DM Mono',monospace",fontSize:11,marginBottom:8 }}
          placeholder={"name,country,industry\nExample GmbH,DE,Automotive"}/>
        <button className="btn btn-p btn-sm" onClick={importCsv} disabled={loading||!writable}>
          {loading?<span className="spin-d"/>:null} {L==="de"?"Importieren":"Import CSV"}
        </button>
      </div>
    </div>
  );
}
