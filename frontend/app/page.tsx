"use client";
import { useEffect, useRef, useState, useCallback } from "react";

const SCENES = [
  { id: "intro", duration: 5000, subtitle: "Stellen Sie sich vor: Ein BAFA-Brief liegt auf Ihrem Schreibtisch.", bg: "#060d05", accent: "#22c55e" },
  { id: "problem", duration: 6000, subtitle: "§3 LkSG verpflichtet über 1.000 Unternehmen zur Sorgfaltspflicht. Verstöße: bis zu 2% des Jahresumsatzes.", bg: "#0a0a0a", accent: "#f87171" },
  { id: "dashboard", duration: 7000, subtitle: "LkSGCompass — Sidebar-Navigation, Compliance-Score immer sichtbar, klickbare KPI-Karten.", bg: "#060d05", accent: "#22c55e" },
  { id: "score", duration: 6000, subtitle: "Der Compliance-Score bewertet Ihre Lieferkette in Echtzeit — §9 LkSG. Heute: 84 von 100.", bg: "#060d05", accent: "#22c55e" },
  { id: "suppliers", duration: 7000, subtitle: "§5 Risikoregister: Lieferanten automatisch klassifiziert, KI-Analyse per Klick, CSV-Import.", bg: "#071209", accent: "#4ade80" },
  { id: "risk", duration: 7000, subtitle: "§5 Risikoanalyse: 20-Parameter-Modell. KI-CAP für Hochrisiko-Lieferanten — automatisch.", bg: "#071209", accent: "#fb923c" },
  { id: "complaints", duration: 6000, subtitle: "§8 Hinweisgebersystem: Öffentliches Portal, anonyme Meldungen, KI-Triage, lückenloser Trail.", bg: "#0a0508", accent: "#a78bfa" },
  { id: "legal", duration: 7000, subtitle: "Rechtsassistent: KI-generierte Vorlagen für CoC, SAQ, Auditchecklisten und Vertragsklauseln.", bg: "#050a10", accent: "#60a5fa" },
  { id: "report", duration: 7000, subtitle: "BAFA-Bericht §10: 10 Pflichtabschnitte, KI-generiert, direkt editierbar — Freigabe-Workflow inklusive.", bg: "#060d05", accent: "#22c55e" },
  { id: "defense", duration: 6000, subtitle: "Nachweise-Tresor §10: Auditberichte, CoC, SAQ — 7 Jahre revisionssicher gespeichert.", bg: "#060d05", accent: "#22c55e" },
  { id: "cta", duration: 8000, subtitle: "LkSGCompass. Compliance, die funktioniert. Jetzt 14 Tage kostenlos testen.", bg: "#060d05", accent: "#22c55e" },
];

function SceneIntro({ p }: { p: number }) {
  return (
    <div style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",gap:32 }}>
      <div style={{ opacity:Math.min(1,p*3),transform:`translateY(${(1-Math.min(1,p*2))*30}px)`,textAlign:"center" }}>
        <div style={{ fontSize:12,letterSpacing:"0.25em",color:"#c4f135",textTransform:"uppercase",marginBottom:20 }}>LkSGCompass</div>
        <div style={{ fontSize:"clamp(36px,7vw,80px)",fontWeight:800,color:"#fff",lineHeight:1.1,fontFamily:"'Bricolage Grotesque',sans-serif" }}>
          LkSG-Compliance.<br /><span style={{ color:"#c4f135" }}>Automatisiert.</span>
        </div>
        <div style={{ fontSize:18,color:"#6b7c6e",marginTop:24 }}>Von §4 bis §10 — vollständig abgedeckt.</div>
      </div>
      <div style={{ display:"flex",gap:48,marginTop:24,opacity:Math.min(1,Math.max(0,p*4-1)) }}>
        {[["1.000+","Unternehmen betroffen"],["2%","Umsatz Bußgeld"],["§4–§10","Vollabdeckung"]].map(([n,l])=>(
          <div key={n} style={{ textAlign:"center" }}>
            <div style={{ fontSize:36,fontWeight:800,color:"#c4f135",fontFamily:"'Bricolage Grotesque',sans-serif" }}>{n}</div>
            <div style={{ fontSize:12,color:"#6b7c6e",marginTop:4 }}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SceneProblem({ p }: { p: number }) {
  const items=[
    {icon:"⚠️",title:"§5 Risikoanalyse",desc:"Kein strukturierter Prozess"},
    {icon:"📋",title:"BAFA-Bericht §10",desc:"Wochen manueller Arbeit"},
    {icon:"⚖️",title:"Rechtsvorlagen §6",desc:"Teurer Anwalt nötig"},
    {icon:"🔔",title:"Hinweisgeber §8",desc:"Fehlende Dokumentation"},
  ];
  return (
    <div style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",gap:40 }}>
      <div style={{ fontSize:"clamp(24px,4vw,48px)",fontWeight:800,color:"#fff",textAlign:"center",fontFamily:"'Bricolage Grotesque',sans-serif" }}>
        Das Problem ohne <span style={{ color:"#ff4444" }}>LkSGCompass</span>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:16,maxWidth:600 }}>
        {items.map((item,i)=>(
          <div key={i} style={{ background:"rgba(255,68,68,0.08)",border:"1px solid rgba(255,68,68,0.2)",borderRadius:16,padding:"20px 24px",opacity:Math.min(1,Math.max(0,p*4-i*0.5)),transform:`translateY(${Math.max(0,(1-p*3+i*0.2)*20)}px)` }}>
            <div style={{ fontSize:28,marginBottom:8 }}>{item.icon}</div>
            <div style={{ fontSize:15,fontWeight:700,color:"#fff",marginBottom:4 }}>{item.title}</div>
            <div style={{ fontSize:13,color:"#ff6666" }}>{item.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SceneDashboard({ p }: { p: number }) {
  const metrics=[
    {label:"Compliance-Score",value:"84/100",color:"#22c55e"},
    {label:"Lieferanten",value:"47",color:"#4ade80"},
    {label:"Offene Maßnahmen",value:"3",color:"#f59e0b"},
    {label:"BAFA-Status",value:"Ready",color:"#38bdf8"},
  ];
  return (
    <div style={{ height:"100%",display:"flex",flexDirection:"column",justifyContent:"center",padding:"0 40px",gap:24 }}>
      <div style={{ fontSize:12,letterSpacing:"0.2em",color:"#c4f135",textTransform:"uppercase" }}>Dashboard</div>
      <div style={{ fontSize:"clamp(22px,3.5vw,40px)",fontWeight:800,color:"#fff",fontFamily:"'Bricolage Grotesque',sans-serif" }}>Alle Pflichten auf einen Blick</div>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12,maxWidth:520 }}>
        {metrics.map((m,i)=>(
          <div key={i} style={{ background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:16,padding:"20px 24px",opacity:Math.min(1,Math.max(0,p*5-i*0.6)) }}>
            <div style={{ fontSize:28,fontWeight:800,color:m.color,fontFamily:"'Bricolage Grotesque',sans-serif" }}>{m.value}</div>
            <div style={{ fontSize:12,color:"#6b7c6e",marginTop:4 }}>{m.label}</div>
          </div>
        ))}
      </div>
      <div style={{ display:"flex",gap:8,flexWrap:"wrap",opacity:Math.min(1,Math.max(0,p*3-1)) }}>
        {["§4 Grundsatzerklärung ✓","§5 Risikoanalyse ✓","§6 Präventionsmaßnahmen ✓","§8 Beschwerdeverfahren ✓","§10 Bericht ✓"].map(t=>(
          <div key={t} style={{ fontSize:11,padding:"4px 10px",background:"rgba(196,241,53,0.1)",color:"#c4f135",borderRadius:20,border:"1px solid rgba(196,241,53,0.2)" }}>{t}</div>
        ))}
      </div>
    </div>
  );
}

function SceneScore({ p }: { p: number }) {
  const score=Math.round(p*84);
  const r=70, circ=2*Math.PI*r;
  return (
    <div style={{ height:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:80,padding:"0 60px",flexWrap:"wrap" }}>
      <div style={{ position:"relative",width:180,height:180 }}>
        <svg width="180" height="180" style={{ transform:"rotate(-90deg)" }}>
          <circle cx="90" cy="90" r={r} fill="none" stroke="rgba(196,241,53,0.1)" strokeWidth="8"/>
          <circle cx="90" cy="90" r={r} fill="none" stroke="#c4f135" strokeWidth="8" strokeDasharray={`${(score/100)*circ} ${circ}`} strokeLinecap="round"/>
        </svg>
        <div style={{ position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center" }}>
          <div style={{ fontSize:48,fontWeight:800,color:"#c4f135",fontFamily:"'Bricolage Grotesque',sans-serif" }}>{score}</div>
          <div style={{ fontSize:12,color:"#6b7c6e" }}>von 100</div>
        </div>
      </div>
      <div style={{ flex:1,minWidth:240 }}>
        <div style={{ fontSize:12,color:"#c4f135",letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:12 }}>Compliance-Score</div>
        <div style={{ fontSize:"clamp(20px,3vw,36px)",fontWeight:800,color:"#fff",marginBottom:20,fontFamily:"'Bricolage Grotesque',sans-serif" }}>Echtzeit-Bewertung<br/>Ihrer Lieferkette</div>
        {[{label:"Risikoanalyse",pct:92,color:"#c4f135"},{label:"Präventionsmaßnahmen",pct:85,color:"#4ade80"},{label:"Lieferantenbewertung",pct:78,color:"#f59e0b"}].map((item,i)=>(
          <div key={i} style={{ marginBottom:12,opacity:Math.min(1,Math.max(0,p*4-i*0.5)) }}>
            <div style={{ display:"flex",justifyContent:"space-between",fontSize:12,color:"#8a9a8d",marginBottom:4 }}>
              <span>{item.label}</span><span style={{ color:item.color }}>{item.pct}%</span>
            </div>
            <div style={{ height:4,background:"rgba(255,255,255,0.06)",borderRadius:2 }}>
              <div style={{ height:"100%",width:`${item.pct*p}%`,background:item.color,borderRadius:2 }}/>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SceneSuppliers({ p }: { p: number }) {
  const suppliers=[
    {name:"Guangzhou Textil GmbH",country:"CN",risk:"Hoch",score:45},
    {name:"Müller Automotive KG",country:"DE",risk:"Niedrig",score:92},
    {name:"Dhaka Garments Ltd",country:"BD",risk:"Kritisch",score:28},
    {name:"Lyon Logistics SA",country:"FR",risk:"Niedrig",score:88},
    {name:"Mumbai Parts Pvt",country:"IN",risk:"Mittel",score:67},
  ];
  const rc=(r: string)=>r==="Kritisch"?"#ff4444":r==="Hoch"?"#f59e0b":r==="Mittel"?"#38bdf8":"#4ade80";
  return (
    <div style={{ height:"100%",display:"flex",flexDirection:"column",justifyContent:"center",padding:"0 40px",gap:20 }}>
      <div>
        <div style={{ fontSize:12,color:"#4ade80",letterSpacing:"0.2em",textTransform:"uppercase" }}>Lieferantenmanagement §5</div>
        <div style={{ fontSize:"clamp(20px,3vw,36px)",fontWeight:800,color:"#fff",fontFamily:"'Bricolage Grotesque',sans-serif",marginTop:6 }}>147 Lieferanten überwacht</div>
      </div>
      <div style={{ display:"flex",flexDirection:"column",gap:8,maxWidth:560 }}>
        {suppliers.map((s,i)=>(
          <div key={i} style={{ display:"flex",alignItems:"center",gap:12,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:12,padding:"12px 16px",opacity:Math.min(1,Math.max(0,p*6-i*0.7)),transform:`translateX(${Math.max(0,(1-p*4+i*0.2)*-20)}px)` }}>
            <div style={{ width:32,height:32,borderRadius:8,background:"rgba(255,255,255,0.06)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"#8a9a8d",fontWeight:700 }}>{s.country}</div>
            <div style={{ flex:1,fontSize:13,color:"#e8f0e9",fontWeight:600 }}>{s.name}</div>
            <div style={{ fontSize:11,padding:"3px 8px",borderRadius:20,background:`${rc(s.risk)}15`,color:rc(s.risk),border:`1px solid ${rc(s.risk)}30` }}>{s.risk}</div>
            <div style={{ fontSize:13,fontWeight:700,color:s.score>80?"#4ade80":s.score>60?"#f59e0b":"#ff4444",width:32,textAlign:"right" }}>{s.score}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SceneRisk({ p }: { p: number }) {
  const areas=[
    {name:"Arbeitsrechte",risk:72,countries:["Bangladesch","Myanmar"]},
    {name:"Umwelt",risk:45,countries:["China","Indien"]},
    {name:"Kinderarbeit",risk:28,countries:["Pakistan"]},
    {name:"Zwangsarbeit",risk:15,countries:[]},
  ];
  return (
    <div style={{ height:"100%",display:"flex",alignItems:"center",gap:60,padding:"0 60px",flexWrap:"wrap" }}>
      <div style={{ flex:1,minWidth:240 }}>
        <div style={{ fontSize:12,color:"#f59e0b",letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:12 }}>§5 Risikoanalyse</div>
        <div style={{ fontSize:"clamp(20px,3vw,36px)",fontWeight:800,color:"#fff",fontFamily:"'Bricolage Grotesque',sans-serif",marginBottom:8 }}>KI erkennt Risiken<br/>automatisch</div>
        <div style={{ fontSize:14,color:"#6b7c6e",lineHeight:1.6,marginBottom:24 }}>Über 80 Risikoländer — kontinuierlich aktualisiert.</div>
        <div style={{ fontSize:11,padding:"6px 14px",background:"rgba(245,158,11,0.1)",color:"#f59e0b",borderRadius:20,border:"1px solid rgba(245,158,11,0.2)",display:"inline-block" }}>⚡ KI-Analyse läuft...</div>
      </div>
      <div style={{ flex:1,minWidth:260,display:"flex",flexDirection:"column",gap:14 }}>
        {areas.map((a,i)=>(
          <div key={i} style={{ opacity:Math.min(1,Math.max(0,p*5-i*0.6)) }}>
            <div style={{ display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:6 }}>
              <span style={{ color:"#e8f0e9" }}>{a.name}</span>
              <span style={{ color:a.risk>60?"#ff4444":a.risk>40?"#f59e0b":"#4ade80" }}>{a.risk}%</span>
            </div>
            <div style={{ height:6,background:"rgba(255,255,255,0.06)",borderRadius:3 }}>
              <div style={{ height:"100%",width:`${a.risk*Math.min(1,p*2)}%`,background:a.risk>60?"#ff4444":a.risk>40?"#f59e0b":"#4ade80",borderRadius:3 }}/>
            </div>
            {a.countries.length>0&&<div style={{ marginTop:4,display:"flex",gap:6 }}>{a.countries.map(c=><span key={c} style={{ fontSize:10,color:"#6b7c6e" }}>📍{c}</span>)}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

function SceneComplaints({ p }: { p: number }) {
  return (
    <div style={{ height:"100%",display:"flex",alignItems:"center",gap:60,padding:"0 60px",flexWrap:"wrap" }}>
      <div style={{ flex:1,minWidth:240 }}>
        <div style={{ fontSize:12,color:"#a78bfa",letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:12 }}>§8 Hinweisgebersystem</div>
        <div style={{ fontSize:"clamp(20px,3vw,36px)",fontWeight:800,color:"#fff",fontFamily:"'Bricolage Grotesque',sans-serif",marginBottom:12 }}>Anonyme Meldungen.<br/>Lückenlos dokumentiert.</div>
        <div style={{ display:"flex",flexDirection:"column",gap:8,marginTop:20 }}>
          {[{icon:"🔒",text:"Vollständige Anonymität"},{icon:"⚡",text:"Automatische Eskalation"},{icon:"📋",text:"BAFA-konforme Dokumentation"},{icon:"🌍",text:"Mehrsprachig verfügbar"}].map((item,i)=>(
            <div key={i} style={{ display:"flex",gap:10,alignItems:"center",opacity:Math.min(1,Math.max(0,p*5-i*0.5)) }}>
              <span style={{ fontSize:18 }}>{item.icon}</span>
              <span style={{ fontSize:13,color:"#a0b0a3" }}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ flex:1,minWidth:260,opacity:Math.min(1,p*2) }}>
        <div style={{ background:"rgba(167,139,250,0.08)",border:"1px solid rgba(167,139,250,0.2)",borderRadius:20,padding:24 }}>
          <div style={{ fontSize:11,color:"#a78bfa",marginBottom:16,letterSpacing:"0.1em" }}>NEUE MELDUNG — VERTRAULICH</div>
          <div style={{ display:"flex",gap:10,alignItems:"flex-start",marginBottom:16 }}>
            <div style={{ width:32,height:32,borderRadius:"50%",background:"rgba(167,139,250,0.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>👤</div>
            <div style={{ background:"rgba(255,255,255,0.04)",borderRadius:12,padding:"10px 14px",flex:1 }}>
              <div style={{ fontSize:12,color:"#c0ccc2",lineHeight:1.6 }}>"Lieferant in Dhaka zahlt unter Mindestlohn und beschäftigt Minderjährige."</div>
            </div>
          </div>
          <div style={{ display:"flex",gap:8 }}>
            {[{label:"Kritisch",color:"#ff4444"},{label:"§7 Abhilfemaßnahme",color:"#f59e0b"}].map(t=>(
              <span key={t.label} style={{ fontSize:10,padding:"3px 8px",borderRadius:20,background:`${t.color}15`,color:t.color,border:`1px solid ${t.color}30` }}>{t.label}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SceneLegal({ p }: { p: number }) {
  const templates=[
    {icon:"📝",title:"Lieferantenkodex",para:"§6 Abs.2"},
    {icon:"⚖️",title:"Vertragsklausel",para:"§6 Abs.3"},
    {icon:"📊",title:"SAQ",para:"§5 Abs.2"},
    {icon:"🔍",title:"Auditprotokoll",para:"§6 Abs.3"},
    {icon:"🛡️",title:"Whistleblower",para:"HinSchG §16"},
    {icon:"📋",title:"Risikomethodik",para:"§5"},
  ];
  return (
    <div style={{ height:"100%",display:"flex",flexDirection:"column",justifyContent:"center",padding:"0 40px",gap:20 }}>
      <div>
        <div style={{ fontSize:12,color:"#38bdf8",letterSpacing:"0.2em",textTransform:"uppercase" }}>Rechtsassistent — KI-powered</div>
        <div style={{ fontSize:"clamp(20px,3vw,36px)",fontWeight:800,color:"#fff",fontFamily:"'Bricolage Grotesque',sans-serif",marginTop:6 }}>6 rechtssichere Vorlagen.<br/>In Sekunden generiert.</div>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,maxWidth:580 }}>
        {templates.map((t,i)=>(
          <div key={i} style={{ background:"rgba(56,189,248,0.06)",border:"1px solid rgba(56,189,248,0.15)",borderRadius:14,padding:"14px 16px",opacity:Math.min(1,Math.max(0,p*7-i*0.5)),transform:`scale(${Math.min(1,Math.max(0.9,p*4-i*0.2))})` }}>
            <div style={{ fontSize:22,marginBottom:6 }}>{t.icon}</div>
            <div style={{ fontSize:12,fontWeight:600,color:"#e8f0e9" }}>{t.title}</div>
            <div style={{ fontSize:10,color:"#38bdf8",marginTop:3 }}>{t.para}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SceneReport({ p }: { p: number }) {
  const steps=["§4 Grundsatzerklärung analysiert","§5 Risikoanalyse zusammengefasst","§6 Maßnahmen dokumentiert","§8 Beschwerden ausgewertet","§10 Berichtsentwurf erstellt","BAFA-Format validiert ✓"];
  const done=Math.floor(p*steps.length*1.2);
  return (
    <div style={{ height:"100%",display:"flex",alignItems:"center",gap:60,padding:"0 60px",flexWrap:"wrap" }}>
      <div style={{ flex:1,minWidth:240 }}>
        <div style={{ fontSize:12,color:"#c4f135",letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:12 }}>BAFA-Bericht §10</div>
        <div style={{ fontSize:"clamp(20px,3vw,36px)",fontWeight:800,color:"#fff",fontFamily:"'Bricolage Grotesque',sans-serif",marginBottom:12 }}>KI schreibt Ihren<br/>Rechenschaftsbericht</div>
        <div style={{ fontSize:14,color:"#6b7c6e",lineHeight:1.6,marginBottom:24 }}>Was früher Wochen dauerte — in Minuten fertig. Vollständig BAFA-konform.</div>
        <div style={{ display:"inline-flex",alignItems:"center",gap:8,background:"rgba(196,241,53,0.1)",border:"1px solid rgba(196,241,53,0.2)",borderRadius:20,padding:"8px 16px" }}>
          <div style={{ width:8,height:8,borderRadius:"50%",background:"#c4f135",animation:"pulse 1s infinite" }}/>
          <span style={{ fontSize:12,color:"#c4f135" }}>KI generiert...</span>
        </div>
      </div>
      <div style={{ flex:1,minWidth:240,display:"flex",flexDirection:"column",gap:10 }}>
        {steps.map((s,i)=>(
          <div key={i} style={{ display:"flex",gap:10,alignItems:"center",opacity:i<done?1:0.2,transition:"opacity 0.3s" }}>
            <div style={{ width:20,height:20,borderRadius:"50%",background:i<done?"rgba(196,241,53,0.2)":"rgba(255,255,255,0.05)",border:`1px solid ${i<done?"#c4f135":"rgba(255,255,255,0.1)"}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
              {i<done&&<span style={{ fontSize:10,color:"#c4f135" }}>✓</span>}
            </div>
            <span style={{ fontSize:12,color:i<done?"#a0b0a3":"#3d4d3f" }}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SceneDefense({ p }: { p: number }) {
  const lines=['{ "§5_risikoanalyse": "abgeschlossen",','  "§6_praevention": "200 Maßnahmen",','  "§7_abhilfe": "3 Fälle gelöst",','  "§8_beschwerde": "12 Meldungen",','  "§9_meldung": "aktuell",','  "§10_bericht": "BAFA-ready" }'];
  return (
    <div style={{ height:"100%",display:"flex",alignItems:"center",gap:60,padding:"0 60px",flexWrap:"wrap" }}>
      <div style={{ flex:1,minWidth:240 }}>
        <div style={{ fontSize:12,color:"#c4f135",letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:12 }}>Verteidigungsakte §10</div>
        <div style={{ fontSize:"clamp(20px,3vw,36px)",fontWeight:800,color:"#fff",fontFamily:"'Bricolage Grotesque',sans-serif",marginBottom:12 }}>BAFA-Prüfung?<br/>Ein Klick genügt.</div>
        <div style={{ fontSize:14,color:"#6b7c6e",lineHeight:1.6,marginBottom:24 }}>§5–§10 Nachweise als strukturierter Export. 200 Audit-Trail-Einträge. Sofort verfügbar.</div>
        <div style={{ display:"inline-flex",alignItems:"center",gap:8,background:"rgba(196,241,53,0.15)",border:"1px solid rgba(196,241,53,0.3)",borderRadius:12,padding:"12px 20px",opacity:Math.min(1,p*3) }}>
          <span style={{ fontSize:16 }}>📥</span>
          <span style={{ fontSize:13,fontWeight:700,color:"#c4f135" }}>Verteidigungsakte herunterladen</span>
        </div>
      </div>
      <div style={{ flex:1,minWidth:240,opacity:Math.min(1,p*2) }}>
        <div style={{ background:"rgba(196,241,53,0.04)",border:"1px solid rgba(196,241,53,0.15)",borderRadius:16,padding:20,fontFamily:"monospace",fontSize:11 }}>
          <div style={{ color:"#6b7c6e",marginBottom:10 }}>verteidigungsakte_2024.json</div>
          {lines.map((line,i)=>(
            <div key={i} style={{ color:i===0?"#c4f135":"#4ade80",lineHeight:1.8,opacity:Math.min(1,Math.max(0,p*8-i*0.5)) }}>{line}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SceneCTA({ p }: { p: number }) {
  return (
    <div style={{ height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:32,padding:"0 40px",textAlign:"center" }}>
      <div style={{ opacity:Math.min(1,p*2),transform:`translateY(${(1-Math.min(1,p*2))*20}px)` }}>
        <div style={{ fontSize:12,letterSpacing:"0.25em",color:"#c4f135",textTransform:"uppercase",marginBottom:20 }}>LkSGCompass</div>
        <div style={{ fontSize:"clamp(28px,5vw,60px)",fontWeight:800,color:"#fff",lineHeight:1.15,fontFamily:"'Bricolage Grotesque',sans-serif" }}>
          Compliance,<br/>die <span style={{ color:"#c4f135" }}>funktioniert.</span>
        </div>
        <div style={{ fontSize:18,color:"#6b7c6e",marginTop:20,marginBottom:36 }}>14 Tage kostenlos. Keine Kreditkarte. Sofort einsatzbereit.</div>
        <div style={{ display:"flex",gap:16,justifyContent:"center",flexWrap:"wrap" }}>
          <a href="/register" style={{ display:"inline-flex",alignItems:"center",gap:8,background:"#c4f135",color:"#0a1a08",padding:"16px 32px",borderRadius:14,fontSize:16,fontWeight:800,textDecoration:"none",fontFamily:"'Bricolage Grotesque',sans-serif" }}>
            Kostenlos starten →
          </a>
          <a href="/pricing" style={{ display:"inline-flex",alignItems:"center",gap:8,background:"rgba(255,255,255,0.06)",color:"#e8f0e9",padding:"16px 32px",borderRadius:14,fontSize:16,fontWeight:600,textDecoration:"none",border:"1px solid rgba(255,255,255,0.1)" }}>
            Pakete vergleichen
          </a>
        </div>
      </div>
      <div style={{ display:"flex",gap:32,marginTop:16,opacity:Math.min(1,Math.max(0,p*3-1)) }}>
        {["DSGVO-konform","EU-Hosting (Frankfurt)","AVV auf Anfrage"].map(t=>(
          <div key={t} style={{ fontSize:12,color:"#4d5e50",display:"flex",alignItems:"center",gap:6 }}>
            <span style={{ color:"#c4f135" }}>✓</span> {t}
          </div>
        ))}
      </div>
    </div>
  );
}

const COMPS: Record<string,(props:{p:number})=>React.JSX.Element> = {
  intro:SceneIntro, problem:SceneProblem, dashboard:SceneDashboard,
  score:SceneScore, suppliers:SceneSuppliers, risk:SceneRisk,
  complaints:SceneComplaints, legal:SceneLegal, report:SceneReport,
  defense:SceneDefense, cta:SceneCTA,
};

export default function DemoPage() {
  const [idx, setIdx] = useState(0);
  const [sp, setSp] = useState(0);
  const [tp, setTp] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [music, setMusic] = useState(false);
  const [showUI, setShowUI] = useState(false);
  const [ended, setEnded] = useState(false);
  const rafRef = useRef<number>();
  const startRef = useRef(0);
  const pausedRef = useRef(0);
  const total = SCENES.reduce((s,sc) => s+sc.duration, 0);
  const audioRef = useRef<{ctx:AudioContext,gain:GainNode,playing:boolean}|null>(null);
  const noteTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const playNote = useCallback((ctx: AudioContext, gain: GainNode, freq: number) => {
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = "sine"; osc.frequency.value = freq;
    env.gain.setValueAtTime(0, ctx.currentTime);
    env.gain.linearRampToValueAtTime(0.35, ctx.currentTime+0.01);
    env.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime+0.22);
    osc.connect(env); env.connect(gain);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime+0.25);
  }, []);

  const startMusicLoop = useCallback(() => {
    if (!audioRef.current) return;
    const {ctx, gain, playing: isPlaying} = audioRef.current;
    if (!isPlaying) return;
    const bach = [261,329,392,523,659,523,392,329,261,329,392,523,659,523,392,329,
                  246,329,392,493,659,493,392,329,246,311,392,493,622,493,392,311];
    let n = 0;
    const loop = () => {
      if (!audioRef.current?.playing) return;
      playNote(ctx, gain, bach[n % bach.length]);
      n++;
      noteTimerRef.current = setTimeout(loop, 185);
    };
    loop();
  }, [playNote]);

  const toggleMusic = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const gain = ctx.createGain(); gain.gain.value = 0.05; gain.connect(ctx.destination);
        audioRef.current = {ctx, gain, playing: true};
        setMusic(true);
        startMusicLoop();
      } catch {}
    } else {
      audioRef.current.playing = !audioRef.current.playing;
      setMusic(audioRef.current.playing);
      if (audioRef.current.playing) startMusicLoop();
      else if (noteTimerRef.current) clearTimeout(noteTimerRef.current);
    }
  }, [startMusicLoop]);

  useEffect(() => {
    if (!playing || ended) return;
    const tick = (now: number) => {
      if (!startRef.current) startRef.current = now - pausedRef.current;
      const el = now - startRef.current;
      const cl = Math.min(el, total);
      setTp(cl / total);
      let acc=0, si=0;
      for (let i=0;i<SCENES.length;i++) {
        if (el < acc+SCENES[i].duration) { si=i; setSp((el-acc)/SCENES[i].duration); break; }
        acc+=SCENES[i].duration; si=i;
      }
      setIdx(Math.min(si, SCENES.length-1));
      if (el >= total) { setEnded(true); setPlaying(false); return; }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if(rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [playing, ended, total]);

  const toggle = () => {
    if (ended) {
      startRef.current=0; pausedRef.current=0;
      setEnded(false); setIdx(0); setSp(0); setTp(0); setPlaying(true); return;
    }
    if (playing) { if(rafRef.current) cancelAnimationFrame(rafRef.current); pausedRef.current=tp*total; startRef.current=0; }
    setPlaying(p=>!p);
  };

  const scene = SCENES[idx];
  const Comp = COMPS[scene.id];

  return (
    <div style={{ width:"100vw",height:"100vh",background:scene.bg,position:"fixed",inset:0,overflow:"hidden",transition:"background 1.5s ease",fontFamily:"'DM Sans','Bricolage Grotesque',system-ui,sans-serif",cursor:showUI?"default":"none" }}
      onMouseMove={()=>{ setShowUI(true); setTimeout(()=>setShowUI(false),3000); }}
      onClick={toggle}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,700;12..96,800&family=DM+Sans:wght@400;600&display=swap');
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes fin{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        *{box-sizing:border-box;margin:0;padding:0}
      `}</style>

      {/* SCENE */}
      <div style={{ width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center" }}>
        <div style={{ width:"100%",maxWidth:900,height:"100%",animation:"fin 0.6s ease" }} key={idx}>
          <Comp p={Math.max(0,Math.min(1,sp))} />
        </div>
      </div>

      {/* SUBTITLE */}
      <div style={{ position:"absolute",bottom:80,left:0,right:0,display:"flex",justifyContent:"center",padding:"0 60px",pointerEvents:"none" }}>
        <div style={{ background:"rgba(0,0,0,0.78)",backdropFilter:"blur(12px)",borderRadius:12,padding:"12px 24px",maxWidth:680,textAlign:"center",border:"1px solid rgba(255,255,255,0.08)" }} key={idx+"-s"}>
          <p style={{ fontSize:15,color:"#e8f0e9",lineHeight:1.65,fontWeight:400,animation:"fin 0.4s ease" }}>{scene.subtitle}</p>
        </div>
      </div>

      {/* PROGRESS */}
      <div style={{ position:"absolute",bottom:0,left:0,right:0,height:3,background:"rgba(255,255,255,0.08)" }}>
        <div style={{ height:"100%",background:scene.accent,width:`${tp*100}%`,transition:"width 0.1s linear" }}/>
      </div>

      {/* DOTS */}
      <div style={{ position:"absolute",bottom:10,left:0,right:0,display:"flex",justifyContent:"center",gap:8,opacity:showUI?1:0.25,transition:"opacity 0.5s",pointerEvents:"all" }}>
        {SCENES.map((_,i)=>(
          <div key={i} style={{ width:i===idx?20:6,height:6,borderRadius:3,background:i===idx?scene.accent:i<idx?"rgba(255,255,255,0.4)":"rgba(255,255,255,0.15)",transition:"all 0.3s",cursor:"pointer" }}
            onClick={e=>{ e.stopPropagation(); const off=SCENES.slice(0,i).reduce((s,sc)=>s+sc.duration,0); startRef.current=0; pausedRef.current=off+100; setIdx(i); setSp(0); setEnded(false); setPlaying(true); }}
          />
        ))}
      </div>

      {/* TOP BAR */}
      <div style={{ position:"absolute",top:0,left:0,right:0,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"20px 28px",background:"linear-gradient(to bottom,rgba(0,0,0,0.5),transparent)",opacity:showUI?1:0,transition:"opacity 0.5s" }}>
        <a href="/" style={{ fontSize:14,fontWeight:700,color:"#c4f135",textDecoration:"none",letterSpacing:"0.1em" }}>LkSGCompass</a>
        <div style={{ display:"flex",gap:12,alignItems:"center" }}>
          <button onClick={toggleMusic} style={{ background:music?"rgba(196,241,53,0.15)":"rgba(255,255,255,0.08)",border:`1px solid ${music?"rgba(196,241,53,0.3)":"rgba(255,255,255,0.15)"}`,borderRadius:20,padding:"6px 14px",cursor:"pointer",color:music?"#c4f135":"#8a9a8d",display:"flex",alignItems:"center",gap:6,fontSize:12 }}>
            ♪ {music?"Musik an":"Musik aus"}
          </button>
          <a href="/register" onClick={e=>e.stopPropagation()} style={{ background:"#c4f135",color:"#0a1a08",padding:"8px 18px",borderRadius:20,fontSize:13,fontWeight:700,textDecoration:"none" }}>
            Jetzt starten →
          </a>
        </div>
      </div>

      {/* PAUSE ICON */}
      {showUI&&!ended&&(
        <div style={{ position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none" }}>
          <div style={{ width:72,height:72,borderRadius:"50%",background:"rgba(0,0,0,0.6)",backdropFilter:"blur(8px)",border:"1px solid rgba(255,255,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center",animation:"fin 0.2s ease" }}>
            {playing
              ? <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
              : <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg>}
          </div>
        </div>
      )}

      {/* ENDED */}
      {ended&&(
        <div style={{ position:"absolute",inset:0,background:"rgba(0,0,0,0.75)",backdropFilter:"blur(10px)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:24,animation:"fin 0.5s ease" }} onClick={e=>e.stopPropagation()}>
          <div style={{ fontSize:12,color:"#c4f135",letterSpacing:"0.2em" }}>DEMO BEENDET</div>
          <div style={{ fontSize:"clamp(24px,4vw,48px)",fontWeight:800,color:"#fff",textAlign:"center",fontFamily:"'Bricolage Grotesque',sans-serif" }}>Bereit anzufangen?</div>
          <div style={{ display:"flex",gap:14,flexWrap:"wrap",justifyContent:"center" }}>
            <a href="/register" style={{ background:"#c4f135",color:"#0a1a08",padding:"14px 28px",borderRadius:14,fontSize:15,fontWeight:800,textDecoration:"none" }}>14 Tage kostenlos starten →</a>
            <button onClick={toggle} style={{ background:"rgba(255,255,255,0.08)",color:"#e8f0e9",padding:"14px 28px",borderRadius:14,fontSize:15,border:"1px solid rgba(255,255,255,0.12)",cursor:"pointer" }}>↺ Nochmal ansehen</button>
          </div>
          <a href="/pricing" style={{ fontSize:13,color:"#6b7c6e",textDecoration:"underline" }}>Preise vergleichen</a>
        </div>
      )}
    </div>
  );
}
