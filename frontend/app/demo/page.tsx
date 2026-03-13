"use client";
import Link from "next/link";

const steps = [
  { title: "Company setup", desc: "See how a compliance lead configures company profile, complaint channel and policy defaults in minutes." },
  { title: "Supplier import", desc: "Preview CSV import, risk scoring, supplier health and evidence collection from one workspace." },
  { title: "BAFA-ready reporting", desc: "Walk through approval-aware reporting, audit trail, SLA visibility and export flow." },
];

const highlights = [
  "Role-aware workspace with read-only and approval states",
  "Guided launchpad, module checklists and smart next-action rail",
  "Supplier risk, complaints, evidence, reports and monitoring in one flow",
  "Approval inbox, timeline and SLA visibility for report governance",
];

export default function DemoPage() {
  return (
    <main style={{minHeight:"100vh",background:"linear-gradient(180deg,#f5f8f6 0%,#ffffff 45%,#eef4ef 100%)",color:"#102217"}}>
      <section style={{maxWidth:1180,margin:"0 auto",padding:"56px 24px 28px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:16,flexWrap:"wrap",marginBottom:28}}>
          <Link href="/" style={{fontWeight:800,fontSize:24,color:"#143524",textDecoration:"none"}}>LkSG<span style={{opacity:.8}}>Compass</span></Link>
          <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
            <Link href="/pricing" style={{padding:"12px 18px",border:"1px solid #cfe0d4",borderRadius:12,textDecoration:"none",color:"#143524",fontWeight:600}}>Pricing</Link>
            <Link href="/register" style={{padding:"12px 18px",borderRadius:12,textDecoration:"none",background:"#143524",color:"white",fontWeight:700}}>Create account</Link>
          </div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1.1fr .9fr",gap:28,alignItems:"stretch"}}>
          <div style={{background:"rgba(255,255,255,.86)",backdropFilter:"blur(12px)",border:"1px solid #dbe8de",borderRadius:28,padding:"34px 32px",boxShadow:"0 20px 80px rgba(20,53,36,.08)"}}>
            <div style={{display:"inline-flex",padding:"8px 12px",borderRadius:999,background:"#ecf5ee",border:"1px solid #d7e8db",fontWeight:700,fontSize:13,marginBottom:18}}>Interactive product demo</div>
            <h1 style={{fontSize:"clamp(34px,6vw,64px)",lineHeight:1,letterSpacing:"-0.04em",margin:"0 0 16px",fontWeight:900}}>See the platform like a buyer would.</h1>
            <p style={{fontSize:18,lineHeight:1.6,color:"#4b6354",maxWidth:680,margin:"0 0 24px"}}>This guided demo shows the exact flow you need in a serious compliance sale: supplier onboarding, risk prioritization, complaint handling, approvals and BAFA-ready reporting. Because apparently buyers enjoy clarity.</p>
            <div style={{display:"flex",gap:14,flexWrap:"wrap",marginBottom:20}}>
              <Link href="/register" style={{padding:"14px 20px",borderRadius:14,background:"#143524",color:"white",textDecoration:"none",fontWeight:800}}>Start free workspace</Link>
              <Link href="/app/dashboard" style={{padding:"14px 20px",borderRadius:14,border:"1px solid #cfe0d4",color:"#143524",textDecoration:"none",fontWeight:700}}>Open app shell</Link>
            </div>
            <div style={{display:"grid",gap:10}}>
              {highlights.map((h) => (
                <div key={h} style={{display:"flex",gap:10,alignItems:"flex-start",padding:"12px 14px",borderRadius:16,background:"#f8fbf9",border:"1px solid #e3eee6"}}>
                  <div style={{width:24,height:24,borderRadius:999,background:"#143524",color:"white",display:"grid",placeItems:"center",fontSize:14,flex:"0 0 24px"}}>✓</div>
                  <div style={{fontSize:15,lineHeight:1.5,color:"#244233"}}>{h}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{display:"grid",gap:16}}>
            {steps.map((s, i) => (
              <div key={s.title} style={{background:"#fff",border:"1px solid #dbe8de",borderRadius:24,padding:24,boxShadow:"0 10px 40px rgba(20,53,36,.06)"}}>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                  <div style={{width:38,height:38,borderRadius:14,background:"#143524",color:"white",display:"grid",placeItems:"center",fontWeight:900}}>{i + 1}</div>
                  <div style={{fontSize:20,fontWeight:800,color:"#102217"}}>{s.title}</div>
                </div>
                <p style={{margin:0,fontSize:15,lineHeight:1.6,color:"#52695a"}}>{s.desc}</p>
              </div>
            ))}
            <div style={{background:"linear-gradient(135deg,#143524,#29563e)",borderRadius:24,padding:24,color:"white",boxShadow:"0 18px 60px rgba(20,53,36,.18)"}}>
              <div style={{fontSize:13,fontWeight:800,opacity:.8,letterSpacing:".08em",textTransform:"uppercase",marginBottom:10}}>Best for</div>
              <div style={{fontSize:28,fontWeight:900,lineHeight:1.05,marginBottom:10}}>Compliance, procurement and legal buyers who need proof fast.</div>
              <p style={{margin:0,fontSize:15,lineHeight:1.6,opacity:.9}}>Use this page as your pre-demo handoff. It frames the value before the buyer sees the full workspace.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
