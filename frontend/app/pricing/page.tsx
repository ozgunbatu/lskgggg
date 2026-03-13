import Link from "next/link";

const plans = [
  { name: "Starter", price: "149€", subtitle: "For smaller supplier portfolios", features: ["Up to 50 suppliers", "Risk scoring", "Complaint portal", "BAFA PDF export"], cta: "/register", ctaLabel: "Start Starter" },
  { name: "Growth", price: "499€", subtitle: "For operating teams", features: ["Up to 500 suppliers", "Monitoring", "Evidence workflows", "Approval-ready reporting", "Priority support"], cta: "/demo", ctaLabel: "View Growth demo", featured: true },
  { name: "Enterprise", price: "Custom", subtitle: "For multi-team governance", features: ["Unlimited suppliers", "Approvals + SLA", "Integration support", "Dedicated onboarding", "AVV / DPA support"], cta: "mailto:hello@lksgcompass.de", ctaLabel: "Talk to sales" },
];

export default function PricingPage() {
  return (
    <main style={{minHeight:"100vh",background:"#f5f8f6",padding:"56px 24px"}}>
      <div style={{maxWidth:1180,margin:"0 auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:16,flexWrap:"wrap",marginBottom:24}}>
          <Link href="/" style={{fontWeight:800,fontSize:24,color:"#143524",textDecoration:"none"}}>LkSGCompass</Link>
          <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
            <Link href="/demo" style={{padding:"12px 18px",border:"1px solid #cfe0d4",borderRadius:12,textDecoration:"none",color:"#143524",fontWeight:700}}>Interactive demo</Link>
            <Link href="/register" style={{padding:"12px 18px",borderRadius:12,textDecoration:"none",background:"#143524",color:"white",fontWeight:800}}>Create account</Link>
          </div>
        </div>

        <div style={{maxWidth:760,marginBottom:30}}>
          <div style={{display:"inline-flex",padding:"8px 12px",borderRadius:999,background:"#ecf5ee",border:"1px solid #d7e8db",fontWeight:700,fontSize:13,marginBottom:16}}>Pricing</div>
          <h1 style={{fontSize:"clamp(34px,6vw,62px)",lineHeight:1.02,letterSpacing:"-0.04em",margin:"0 0 14px",color:"#102217"}}>Clear packages for a product that is finally less chaotic.</h1>
          <p style={{fontSize:18,lineHeight:1.6,color:"#52695a",margin:0}}>Choose the plan that matches your supplier volume and governance depth. The whole point is faster compliance operations, not decorative software furniture.</p>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:20}}>
          {plans.map((plan) => (
            <div key={plan.name} style={{background:plan.featured?"linear-gradient(180deg,#143524,#234a36)":"#fff",color:plan.featured?"#fff":"#143524",border:"1px solid " + (plan.featured?"#143524":"#dbe8de"),borderRadius:28,padding:28,boxShadow:"0 18px 60px rgba(20,53,36,.08)",position:"relative"}}>
              {plan.featured && <div style={{position:"absolute",top:16,right:16,padding:"7px 10px",borderRadius:999,background:"rgba(255,255,255,.12)",fontWeight:800,fontSize:12}}>Most popular</div>}
              <div style={{fontSize:14,fontWeight:800,opacity:.75,textTransform:"uppercase",letterSpacing:".08em",marginBottom:10}}>{plan.name}</div>
              <div style={{fontSize:44,fontWeight:900,letterSpacing:"-0.04em",lineHeight:1,marginBottom:8}}>{plan.price}</div>
              <div style={{fontSize:15,opacity:.8,marginBottom:20}}>{plan.subtitle}</div>
              <div style={{display:"grid",gap:12,marginBottom:24}}>
                {plan.features.map((feature) => (
                  <div key={feature} style={{display:"flex",gap:10,alignItems:"flex-start",fontSize:15,lineHeight:1.5}}>
                    <span style={{width:22,height:22,borderRadius:999,display:"grid",placeItems:"center",background:plan.featured?"rgba(255,255,255,.14)":"#eef5f0",fontSize:13}}>✓</span>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              <a href={plan.cta} style={{display:"inline-block",padding:"14px 18px",borderRadius:14,textDecoration:"none",fontWeight:800,background:plan.featured?"#fff":"#143524",color:plan.featured?"#143524":"#fff"}}>{plan.ctaLabel}</a>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
