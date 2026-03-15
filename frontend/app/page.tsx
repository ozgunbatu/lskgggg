"use client";
import { useEffect, useRef, useState } from "react";
type Lang = "de" | "en";
function getLang(): Lang { if (typeof window === "undefined") return "de"; return (localStorage.getItem("lang") as Lang) || "de"; }
function setLang(l: Lang) { if (typeof window !== "undefined") localStorage.setItem("lang", l); }

// --- Inline SVG Icons -------------------------------------------------------
const Icon = {
  Check: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2 7l3.5 3.5L12 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  X: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  Arrow: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Shield: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 2L3 5v5c0 4 3 7 7 8 4-1 7-4 7-8V5l-7-3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  ),
  Globe: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M2 10h16M10 2c-2 2-3 5-3 8s1 6 3 8M10 2c2 2 3 5 3 8s-1 6-3 8" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  FileText: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M11 2H5a1 1 0 00-1 1v14a1 1 0 001 1h10a1 1 0 001-1V7l-5-5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M11 2v5h5M7 11h6M7 14h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  Bell: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 2a6 6 0 00-6 6v3l-1.5 2.5h15L16 11V8a6 6 0 00-6-6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M8.5 16a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  Lock: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="4" y="9" width="12" height="9" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M7 9V7a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  Zap: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M11 2L4 11h6l-1 7 7-9h-6l1-7z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  ),
  Map: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M1 5l6-3 6 3 6-3v13l-6 3-6-3-6 3V5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M7 2v13M13 5v13" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  Menu: () => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
};

// --- Dashboard Mockup --------------------------------------------------------
function DashboardMockup() {
  return (
    <div style={{
      background: "#fff", border: "1px solid #e6e6e6", borderRadius: 16,
      overflow: "hidden", boxShadow: "0 24px 64px rgba(0,0,0,0.1)",
      userSelect: "none",
    }}>
      {/* Window chrome */}
      <div style={{ background: "#f6f7f6", borderBottom: "1px solid #e6e6e6", padding: "10px 16px", display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#fecaca" }} />
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#fef08a" }} />
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#bbf7d0" }} />
        <div style={{ flex: 1, marginLeft: 12, background: "#e6e6e6", borderRadius: 6, height: 20, display: "flex", alignItems: "center", padding: "0 10px" }}>
          <span style={{ fontSize: 10, color: "#9ca3af", fontFamily: "monospace" }}>app.lksgcompass.de/dashboard</span>
        </div>
      </div>
      {/* Nav */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e6e6e6", padding: "10px 20px", display: "flex", alignItems: "center", gap: 16 }}>
        <span style={{ fontWeight: 800, fontSize: 13, color: "#1B3D2B" }}>LkSGCompass</span>
        {["Dashboard","Lieferanten","Berichte","Monitoring"].map(t => (
          <span key={t} style={{ fontSize: 11, color: t === "Dashboard" ? "#1B3D2B" : "#9ca3af", fontWeight: t === "Dashboard" ? 700 : 400, padding: "3px 8px", background: t === "Dashboard" ? "#f0f5f1" : "transparent", borderRadius: 6 }}>{t}</span>
        ))}
        <div style={{ marginLeft: "auto", background: "#1B3D2B", color: "#fff", borderRadius: 8, padding: "4px 12px", fontSize: 11, fontWeight: 700 }}>Neuer Bericht</div>
      </div>
      {/* Content */}
      <div style={{ padding: 20 }}>
        {/* KPI row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 16 }}>
          {[
            { label: "Compliance Score", value: "84", sub: "/100", color: "#1B3D2B" },
            { label: "Lieferanten", value: "47", sub: " aktiv", color: "#0b0f0c" },
            { label: "Hochrisiko", value: "6", sub: " kritisch", color: "#C0392B" },
          ].map(k => (
            <div key={k.label} style={{ background: "#f6f7f6", borderRadius: 10, padding: "12px 14px", border: "1px solid #e6e6e6" }}>
              <div style={{ fontSize: 10, color: "#9ca3af", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>{k.label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: k.color, lineHeight: 1 }}>
                {k.value}<span style={{ fontSize: 12, color: "#9ca3af" }}>{k.sub}</span>
              </div>
            </div>
          ))}
        </div>
        {/* Table */}
        <div style={{ border: "1px solid #e6e6e6", borderRadius: 10, overflow: "hidden" }}>
          <div style={{ background: "#f6f7f6", padding: "8px 14px", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 80px", gap: 8 }}>
            {["Lieferant","Land","Branche","Risiko"].map(h => (
              <span key={h} style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.8 }}>{h}</span>
            ))}
          </div>
          {[
            { name: "Textile Group", country: "Bangladesch", industry: "Textil", risk: "Hoch", rc: "#fff0ef", tc: "#8b1d13", bc: "#ffc5c0" },
            { name: "TechParts Co.", country: "China", industry: "Elektronik", risk: "Mittel", rc: "#fff7e8", tc: "#7a3e00", bc: "#ffe3b5" },
            { name: "AutoSteelworks", country: "Mexiko", industry: "Automotive", risk: "Mittel", rc: "#fff7e8", tc: "#7a3e00", bc: "#ffe3b5" },
            { name: "EcoBuild AG", country: "Deutschland", industry: "Bau", risk: "Niedrig", rc: "#eefbf2", tc: "#125b2c", bc: "#bde5c7" },
          ].map((r, i) => (
            <div key={i} style={{ padding: "10px 14px", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 80px", gap: 8, borderTop: "1px solid #f0f0f0", alignItems: "center" }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#0b0f0c" }}>{r.name}</span>
              <span style={{ fontSize: 11, color: "#6b7280" }}>{r.country}</span>
              <span style={{ fontSize: 11, color: "#6b7280" }}>{r.industry}</span>
              <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 100, background: r.rc, color: r.tc, border: `1px solid ${r.bc}`, textAlign: "center" }}>{r.risk}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Report Mockup -----------------------------------------------------------
function ReportMockup() {
  return (
    <div style={{ background: "#fff", border: "1px solid #e6e6e6", borderRadius: 14, padding: 20, boxShadow: "0 8px 32px rgba(0,0,0,0.06)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#0b0f0c" }}>BAFA Jahresbericht 2025</div>
          <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>PDF  -  Generiert in 4 Sekunden</div>
        </div>
        <div style={{ background: "#f0f5f1", color: "#1B3D2B", fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 100, border: "1px solid #d1e7d9" }}>§10 LkSG ?</div>
      </div>
      {[
        { n: "01", label: "Unternehmensstruktur", done: true },
        { n: "02", label: "Risikoanalyse & Pravention", done: true },
        { n: "03", label: "Abhilfemassnahmen", done: true },
        { n: "04", label: "Beschwerdeverfahren", done: true },
        { n: "05", label: "Wirksamkeitskontrolle", done: true },
      ].map(s => (
        <div key={s.n} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #f6f7f6" }}>
          <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#f0f5f1", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontSize: 9, fontWeight: 800, color: "#1B3D2B" }}>{s.n}</span>
          </div>
          <span style={{ fontSize: 12, color: "#374151", flex: 1 }}>{s.label}</span>
          <div style={{ color: "#1B3D2B", display: "flex", alignItems: "center" }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" fill="#f0f5f1" stroke="#bde5c7"/><path d="M4 7l2 2 4-4" stroke="#1B3D2B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </div>
      ))}
      <div style={{ marginTop: 14, background: "#1B3D2B", borderRadius: 8, padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v8M4 6l3 3 3-3M2 11h10" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>PDF herunterladen</span>
      </div>
    </div>
  );
}

// --- Monitoring Mockup -------------------------------------------------------
function MonitoringMockup() {
  return (
    <div style={{ background: "#fff", border: "1px solid #e6e6e6", borderRadius: 14, padding: 20, boxShadow: "0 8px 32px rgba(0,0,0,0.06)" }}>
      <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 14 }}>Live Monitoring</div>
      {[
        { type: "Sanktionen", name: "Supplier A GmbH", status: "Klar", sc: "#eefbf2", tc: "#125b2c", bc: "#bde5c7" },
        { type: "ESG Signal", name: "Textile Group", status: "Prufen", sc: "#fff7e8", tc: "#7a3e00", bc: "#ffe3b5" },
        { type: "Nachrichten", name: "TechParts Co.", status: "Neu", sc: "#eff6ff", tc: "#1e40af", bc: "#bfdbfe" },
        { type: "Sanktionen", name: "EcoBuild AG", status: "Klar", sc: "#eefbf2", tc: "#125b2c", bc: "#bde5c7" },
      ].map((r, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: "1px solid #f6f7f6" }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: r.tc, flexShrink: 0 }} />
          <span style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", width: 72, flexShrink: 0 }}>{r.type}</span>
          <span style={{ fontSize: 12, color: "#374151", flex: 1 }}>{r.name}</span>
          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 100, background: r.sc, color: r.tc, border: `1px solid ${r.bc}` }}>{r.status}</span>
        </div>
      ))}
    </div>
  );
}

// --- Main Page ---------------------------------------------------------------
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [visible, setVisible] = useState<Set<string>>(new Set());
  const [lang, setLangState] = useState<Lang>("de");
  useEffect(()=>{setLangState(getLang());},[]);
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    observer.current = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting && e.target.id) {
          setVisible(prev => new Set([...prev, e.target.id]));
        }
      }),
      { threshold: 0.08 }
    );
    document.querySelectorAll("[data-a]").forEach(el => observer.current?.observe(el));
    return () => observer.current?.disconnect();
  }, []);

  const a = (id: string, delay = 0): React.HTMLAttributes<HTMLDivElement> => ({
    id,
    "data-a": "1" as any,
    style: {
      opacity: visible.has(id) ? 1 : 0,
      transform: visible.has(id) ? "translateY(0)" : "translateY(28px)",
      transition: `opacity 0.7s cubic-bezier(.16,1,.3,1) ${delay}s, transform 0.7s cubic-bezier(.16,1,.3,1) ${delay}s`,
    },
  });

  const sectors = [
    { icon: "?", label: "Textil & Bekleidung" },
    { icon: "?", label: "Bergbau & Rohstoffe" },
    { icon: "?", label: "Landwirtschaft" },
    { icon: "?", label: "Elektronik" },
    { icon: "?", label: "Logistik" },
    { icon: "?", label: "Automotive" },
    { icon: "?", label: "Bauwirtschaft" },
    { icon: "??", label: "Industriedienstleister" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300;12..96,400;12..96,500;12..96,700;12..96,800&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=DM+Mono:wght@400;500&display=swap');

        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{
          --bg:#f6f7f6; --bg2:#eef0ee; --card:#fff;
          --line:#e6e6e6; --line2:#d4dcd6;
          --text:#0b0f0c; --muted:#6b7280; --muted2:#9ca3af;
          --g:#1B3D2B; --g2:#2d5c3f; --g3:#f0f5f1; --g4:#d1e7d9;
          --danger:#C0392B; --warn:#B45309;
          --serif:'Bricolage Grotesque',system-ui,sans-serif;
          --body:'DM Sans',system-ui,sans-serif;
          --mono:'DM Mono',monospace;
        }
        html{scroll-behavior:smooth}
        body{background:var(--bg);color:var(--text);font-family:var(--body);-webkit-font-smoothing:antialiased;overflow-x:hidden;line-height:1.6}
        a{text-decoration:none;color:inherit}
        button{cursor:pointer;border:none;background:none;font-family:inherit}

        /* NAV */
        .lp-nav{
          position:fixed;top:0;left:0;right:0;z-index:200;
          transition:all 0.3s ease;
        }
        .lp-nav.on{
          background:rgba(246,247,246,0.96);
          backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);
          border-bottom:1px solid var(--line);
        }
        .lp-nav-i{
          max-width:1180px;margin:0 auto;
          display:flex;align-items:center;justify-content:space-between;
          padding:20px 32px;
        }
        .lp-logo{font-family:var(--serif);font-weight:800;font-size:20px;color:var(--g);letter-spacing:-0.5px}
        .lp-logo em{font-style:normal;color:var(--text)}
        .lp-links{display:flex;align-items:center;gap:6px}
        .lp-links a{font-size:14px;font-weight:500;color:var(--muted);padding:6px 12px;border-radius:8px;transition:color 0.2s,background 0.2s}
        .lp-links a:hover{color:var(--text);background:var(--bg2)}
        .lp-lang-btns{display:flex;gap:3px;margin-left:10px}
        .lp-lb{background:none;border:1.5px solid #e8eae8;font-family:'DM Sans',system-ui;font-size:11px;font-weight:700;color:#9ca3af;padding:3px 9px;border-radius:6px;cursor:pointer;transition:all 0.15s}
        .lp-lb-on{border-color:#1B3D2B;color:#1B3D2B;background:#f0f5f1}
        .nav-cta{
          background:var(--g);color:#fff !important;
          padding:9px 20px !important;border-radius:10px;font-weight:700 !important;
          transition:background 0.2s,transform 0.15s,box-shadow 0.2s !important;
          box-shadow:0 2px 12px rgba(27,61,43,0.25);
          margin-left:6px;
        }
        .nav-cta:hover{background:var(--g2) !important;transform:translateY(-1px) !important;box-shadow:0 4px 20px rgba(27,61,43,0.3) !important}
        .lp-hamburger{display:none;padding:8px;color:var(--text)}
        .lp-mobile-menu{
          display:none;position:fixed;inset:0;z-index:300;
          background:rgba(246,247,246,0.98);backdrop-filter:blur(20px);
          flex-direction:column;align-items:center;justify-content:center;gap:24px;
        }
        .lp-mobile-menu.open{display:flex}
        .lp-mobile-menu a{font-family:var(--serif);font-size:24px;font-weight:700;color:var(--text)}
        .lp-mobile-close{position:absolute;top:24px;right:24px;font-size:28px;color:var(--muted);background:none;border:none;cursor:pointer}

        /* HERO */
        .lp-hero{
          padding:130px 32px 80px;
          position:relative;overflow:hidden;
          min-height:100vh;display:flex;align-items:center;
        }
        .hero-mesh{
          position:absolute;inset:0;z-index:0;pointer-events:none;
          background:
            radial-gradient(ellipse 900px 600px at 60% -10%, rgba(27,61,43,0.08) 0%, transparent 60%),
            radial-gradient(ellipse 500px 400px at 90% 60%, rgba(27,61,43,0.04) 0%, transparent 50%),
            radial-gradient(ellipse 600px 400px at -10% 80%, rgba(27,61,43,0.04) 0%, transparent 50%);
        }
        .hero-dots{
          position:absolute;inset:0;z-index:0;pointer-events:none;
          background-image:radial-gradient(circle, rgba(27,61,43,0.08) 1px, transparent 1px);
          background-size:32px 32px;
          mask-image:radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent);
          -webkit-mask-image:radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent);
        }
        .hero-inner{
          max-width:1180px;margin:0 auto;
          display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center;
          position:relative;z-index:1;width:100%;
        }
        .hero-left{}
        .hero-badge{
          display:inline-flex;align-items:center;gap:8px;
          background:var(--g3);border:1px solid var(--g4);
          border-radius:100px;padding:6px 14px;margin-bottom:24px;
          font-family:var(--mono);font-size:11px;font-weight:500;color:var(--g);letter-spacing:0.5px;
        }
        .badge-pulse{
          width:7px;height:7px;border-radius:50%;background:var(--g);
          box-shadow:0 0 0 0 rgba(27,61,43,0.4);
          animation:pulse 2.5s ease infinite;
        }
        @keyframes pulse{
          0%{box-shadow:0 0 0 0 rgba(27,61,43,0.4)}
          70%{box-shadow:0 0 0 8px rgba(27,61,43,0)}
          100%{box-shadow:0 0 0 0 rgba(27,61,43,0)}
        }
        .hero-h1{
          font-family:var(--serif);
          font-size:clamp(40px,4.5vw,62px);
          font-weight:800;line-height:1.1;
          letter-spacing:-1.5px;color:var(--text);
          margin-bottom:20px;
        }
        .hero-h1 em{font-style:normal;color:var(--g)}
        .hero-sub{font-size:17px;color:var(--muted);line-height:1.72;margin-bottom:36px;max-width:460px;font-weight:400}
        .hero-ctas{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:36px}
        .btn-primary{
          display:inline-flex;align-items:center;gap:8px;
          background:var(--g);color:#fff;
          padding:14px 26px;border-radius:12px;font-weight:700;font-size:15px;
          transition:background 0.2s,transform 0.15s,box-shadow 0.2s;
          box-shadow:0 4px 24px rgba(27,61,43,0.28);
        }
        .btn-primary:hover{background:var(--g2);transform:translateY(-2px);box-shadow:0 8px 32px rgba(27,61,43,0.35)}
        .btn-ghost{
          display:inline-flex;align-items:center;gap:8px;
          border:1.5px solid var(--line2);color:var(--text);background:var(--card);
          padding:13px 22px;border-radius:12px;font-weight:600;font-size:15px;
          transition:border-color 0.2s,transform 0.15s,box-shadow 0.2s;
        }
        .btn-ghost:hover{border-color:var(--muted);transform:translateY(-2px);box-shadow:0 4px 16px rgba(0,0,0,0.06)}
        .hero-proof{display:flex;gap:20px;align-items:center;flex-wrap:wrap}
        .hero-proof-item{font-size:13px;color:var(--muted);display:flex;align-items:center;gap:6px}
        .hero-proof-item svg{color:var(--g);flex-shrink:0}

        .hero-right{position:relative}
        .mockup-float{
          animation:float 6s ease-in-out infinite;
        }
        @keyframes float{
          0%,100%{transform:translateY(0)}
          50%{transform:translateY(-12px)}
        }
        .mockup-badge{
          position:absolute;bottom:-20px;left:-20px;
          background:var(--card);border:1px solid var(--line);border-radius:12px;
          padding:12px 16px;box-shadow:0 8px 24px rgba(0,0,0,0.1);
          display:flex;align-items:center;gap:10px;min-width:200px;
        }
        .mockup-badge-dot{width:8px;height:8px;border-radius:50%;background:#22c55e;box-shadow:0 0 8px rgba(34,197,94,0.5)}
        .mockup-badge-text{font-size:12px;font-weight:600;color:var(--text)}
        .mockup-badge-sub{font-size:11px;color:var(--muted)}

        /* STATS BAR */
        .lp-stats{
          background:var(--card);border-top:1px solid var(--line);border-bottom:1px solid var(--line);
          padding:28px 32px;
        }
        .lp-stats-i{
          max-width:1180px;margin:0 auto;
          display:grid;grid-template-columns:repeat(4,1fr);gap:24px;
        }
        .lp-stat{text-align:center;padding:4px 0}
        .lp-stat-n{font-family:var(--serif);font-size:34px;font-weight:800;color:var(--g);line-height:1}
        .lp-stat-l{font-size:13px;color:var(--muted);margin-top:6px;font-weight:500}

        /* SECTIONS */
        .lp-sec{padding:96px 32px}
        .lp-sec.bg{background:var(--card)}
        .lp-sec-i{max-width:1180px;margin:0 auto}
        .lp-chip-label{
          display:inline-flex;align-items:center;gap:6px;
          font-family:var(--mono);font-size:11px;font-weight:500;
          color:var(--g);letter-spacing:1.5px;text-transform:uppercase;
          background:var(--g3);border:1px solid var(--g4);
          border-radius:100px;padding:4px 12px;margin-bottom:16px;
        }
        .lp-h2{
          font-family:var(--serif);
          font-size:clamp(30px,3.5vw,48px);
          font-weight:800;line-height:1.15;letter-spacing:-1px;
          color:var(--text);margin-bottom:16px;
        }
        .lp-h2 em{font-style:normal;color:var(--g)}
        .lp-sub{font-size:16px;color:var(--muted);max-width:520px;line-height:1.75;font-weight:400}

        /* SECTORS */
        .sectors-grid{
          display:grid;grid-template-columns:repeat(4,1fr);
          gap:12px;margin-top:48px;
        }
        .sector-card{
          background:var(--card);border:1px solid var(--line);border-radius:14px;
          padding:20px 18px;display:flex;align-items:center;gap:12px;
          transition:border-color 0.2s,box-shadow 0.2s,transform 0.2s;
        }
        .sector-card:hover{border-color:var(--g4);box-shadow:0 4px 16px rgba(27,61,43,0.08);transform:translateY(-2px)}
        .sector-icon{font-size:22px;flex-shrink:0}
        .sector-label{font-size:14px;font-weight:600;color:var(--text)}

        /* FEATURES */
        .features-layout{display:flex;flex-direction:column;gap:80px;margin-top:64px}
        .feature-row{
          display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center;
        }
        .feature-row.rev{direction:rtl}
        .feature-row.rev > *{direction:ltr}
        .feature-tag{
          font-family:var(--mono);font-size:10px;font-weight:600;
          color:var(--g);background:var(--g3);border:1px solid var(--g4);
          border-radius:100px;padding:3px 10px;letter-spacing:1px;text-transform:uppercase;
          display:inline-block;margin-bottom:14px;
        }
        .feature-title{font-family:var(--serif);font-size:clamp(24px,2.5vw,34px);font-weight:800;letter-spacing:-0.8px;line-height:1.2;margin-bottom:14px}
        .feature-desc{font-size:15px;color:var(--muted);line-height:1.75;margin-bottom:20px}
        .feature-points{display:flex;flex-direction:column;gap:10px}
        .fp{display:flex;align-items:flex-start;gap:10px;font-size:14px;color:var(--muted)}
        .fp-icon{width:20px;height:20px;border-radius:6px;background:var(--g3);display:flex;align-items:center;justify-content:center;flex-shrink:0;color:var(--g);margin-top:1px}

        /* STEPS */
        .steps-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:32px;margin-top:48px;position:relative}
        .steps-line{
          position:absolute;top:26px;left:12%;right:12%;
          height:1px;background:linear-gradient(90deg,transparent,var(--g4),transparent);
          z-index:0;
        }
        .step-card{text-align:center;position:relative;z-index:1}
        .step-num{
          width:52px;height:52px;border-radius:50%;
          background:var(--g);color:#fff;
          display:flex;align-items:center;justify-content:center;
          font-family:var(--serif);font-size:18px;font-weight:800;
          margin:0 auto 18px;
          box-shadow:0 4px 16px rgba(27,61,43,0.25);
        }
        .step-title{font-size:15px;font-weight:700;margin-bottom:8px}
        .step-desc{font-size:13px;color:var(--muted);line-height:1.6}

        /* PRICING */
        .pricing-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-top:48px}
        .plan{
          background:var(--card);border:1.5px solid var(--line);
          border-radius:18px;padding:36px 28px;
          transition:transform 0.25s,box-shadow 0.25s;
          position:relative;
        }
        .plan:hover{transform:translateY(-4px);box-shadow:0 16px 48px rgba(0,0,0,0.09)}
        .plan.featured{border-color:var(--g);border-width:2px}
        .plan-badge{
          position:absolute;top:-13px;left:50%;transform:translateX(-50%);
          background:var(--g);color:#fff;font-family:var(--mono);
          font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;
          padding:4px 18px;border-radius:100px;white-space:nowrap;
        }
        .plan-tier{font-family:var(--mono);font-size:10px;font-weight:700;color:var(--muted2);text-transform:uppercase;letter-spacing:2px;margin-bottom:16px}
        .plan-price{font-family:var(--serif);font-size:50px;font-weight:800;color:var(--text);line-height:1;margin-bottom:4px;letter-spacing:-2px}
        .plan-price sup{font-size:20px;vertical-align:super;letter-spacing:0}
        .plan-price-text{font-size:28px;letter-spacing:-0.5px}
        .plan-period{font-size:13px;color:var(--muted);margin-bottom:28px}
        .plan hr{border:none;border-top:1px solid var(--line);margin-bottom:24px}
        .plan-feats{list-style:none;display:flex;flex-direction:column;gap:11px;margin-bottom:32px}
        .plan-feat{display:flex;align-items:flex-start;gap:9px;font-size:14px;color:var(--muted);line-height:1.5}
        .feat-yes{color:var(--g);flex-shrink:0;margin-top:2px}
        .feat-no{color:var(--muted2);flex-shrink:0;margin-top:2px}
        .plan-feat.off{color:var(--muted2)}
        .plan-btn{
          display:block;width:100%;text-align:center;padding:13px;border-radius:10px;
          font-weight:700;font-size:14px;font-family:var(--body);transition:all 0.2s;
        }
        .plan-btn.solid{background:var(--g);color:#fff;border:none}
        .plan-btn.solid:hover{background:var(--g2)}
        .plan-btn.outline{background:transparent;color:var(--text);border:1.5px solid var(--line)}
        .plan-btn.outline:hover{border-color:var(--muted);background:var(--bg2)}

        /* LEGAL STRIP */
        .legal-strip{background:var(--g3);border-top:1px solid var(--g4);border-bottom:1px solid var(--g4);padding:56px 32px}
        .legal-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:28px;margin-top:36px}
        .legal-item{}
        .legal-ico{width:36px;height:36px;border-radius:10px;background:var(--card);border:1px solid var(--g4);display:flex;align-items:center;justify-content:center;margin-bottom:12px;color:var(--g)}
        .legal-item h3{font-size:14px;font-weight:700;color:var(--g);margin-bottom:6px}
        .legal-item p{font-size:13px;color:var(--muted);line-height:1.6}

        /* CTA */
        .lp-cta{background:var(--g);padding:96px 32px;text-align:center;position:relative;overflow:hidden}
        .cta-mesh{position:absolute;inset:0;background:radial-gradient(ellipse 60% 80% at 50% 0%, rgba(255,255,255,0.06) 0%, transparent 60%)}
        .cta-inner{max-width:620px;margin:0 auto;position:relative;z-index:1}
        .cta-label{font-family:var(--mono);font-size:11px;color:rgba(255,255,255,0.4);letter-spacing:2px;text-transform:uppercase;margin-bottom:16px}
        .cta-h2{font-family:var(--serif);font-size:clamp(34px,4vw,54px);font-weight:800;color:#fff;line-height:1.15;letter-spacing:-1px;margin-bottom:18px}
        .cta-h2 em{font-style:normal;color:rgba(255,255,255,0.5)}
        .cta-sub{font-size:16px;color:rgba(255,255,255,0.6);margin-bottom:36px;font-weight:400}
        .cta-btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
        .btn-white{background:#fff;color:var(--g);padding:14px 28px;border-radius:12px;font-weight:700;font-size:15px;transition:background 0.2s,transform 0.15s;box-shadow:0 4px 20px rgba(0,0,0,0.15)}
        .btn-white:hover{background:#f0f5f1;transform:translateY(-2px)}
        .btn-white-ghost{border:1.5px solid rgba(255,255,255,0.25);color:rgba(255,255,255,0.85);padding:13px 24px;border-radius:12px;font-weight:600;font-size:15px;transition:border-color 0.2s}
        .btn-white-ghost:hover{border-color:rgba(255,255,255,0.5)}
        .cta-note{font-size:12px;color:rgba(255,255,255,0.35);margin-top:20px;font-family:var(--mono)}

        /* FOOTER */
        .lp-footer{background:#0b0f0c;padding:56px 32px 32px}
        .footer-i{max-width:1180px;margin:0 auto}
        .footer-top{display:flex;justify-content:space-between;gap:40px;margin-bottom:48px;flex-wrap:wrap}
        .footer-brand{}
        .footer-logo{font-family:var(--serif);font-weight:800;font-size:18px;color:#fff;margin-bottom:10px;letter-spacing:-0.5px}
        .footer-logo em{font-style:normal;color:rgba(255,255,255,0.3)}
        .footer-desc{font-size:13px;color:rgba(255,255,255,0.35);line-height:1.65;max-width:240px;margin-top:8px}
        .footer-cols{display:flex;gap:56px;flex-wrap:wrap}
        .footer-col h4{font-family:var(--mono);font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:rgba(255,255,255,0.25);margin-bottom:16px}
        .footer-col a{display:block;font-size:14px;color:rgba(255,255,255,0.45);margin-bottom:10px;transition:color 0.2s}
        .footer-col a:hover{color:#fff}
        .footer-bottom{display:flex;justify-content:space-between;align-items:center;padding-top:28px;border-top:1px solid rgba(255,255,255,0.07);flex-wrap:wrap;gap:16px}
        .footer-copy{font-size:12px;color:rgba(255,255,255,0.25);font-family:var(--mono)}
        .footer-legal{display:flex;gap:16px}
        .footer-legal a{font-size:12px;color:rgba(255,255,255,0.3);transition:color 0.2s}
        .footer-legal a:hover{color:rgba(255,255,255,0.7)}
        .footer-badges{display:flex;gap:8px;flex-wrap:wrap}
        .footer-badge{font-family:var(--mono);font-size:10px;font-weight:600;border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.25);padding:3px 10px;border-radius:100px}

        /* RESPONSIVE */
        @media(max-width:1024px){
          .hero-inner{grid-template-columns:1fr;gap:48px}
          .hero-right{max-width:560px}
          .feature-row,.feature-row.rev{grid-template-columns:1fr;direction:ltr;gap:40px}
          .sectors-grid{grid-template-columns:repeat(2,1fr)}
          .steps-grid{grid-template-columns:repeat(2,1fr)}
          .steps-line{display:none}
          .pricing-grid{grid-template-columns:1fr}
          .legal-grid{grid-template-columns:repeat(2,1fr)}
          .lp-stats-i{grid-template-columns:repeat(2,1fr)}
        }
        @media(max-width:768px){
          .lp-nav-i{padding:16px 20px}
          .lp-links>a:not(.nav-cta){display:none}
          .lp-hamburger{display:flex}
          .lp-hero{padding:110px 20px 64px;min-height:auto}
          .lp-sec{padding:64px 20px}
          .legal-strip{padding:48px 20px}
          .lp-cta{padding:72px 20px}
          .lp-footer{padding:48px 20px 28px}
          .lp-stats{padding:20px}
          .footer-top{flex-direction:column}
          .footer-cols{gap:32px}
          .footer-bottom{flex-direction:column;align-items:flex-start}
          .hero-h1{letter-spacing:-0.5px}
        }
        @media(max-width:600px){
          .sectors-grid{grid-template-columns:1fr 1fr}
          .steps-grid{grid-template-columns:1fr}
          .legal-grid{grid-template-columns:1fr}
          .lp-stats-i{grid-template-columns:1fr 1fr}
          .hero-ctas{flex-direction:column}
          .btn-primary,.btn-ghost{justify-content:center}
        }
      `}</style>

      {/* MOBILE MENU */}
      <div className={`lp-mobile-menu${menuOpen ? " open" : ""}`}>
        <button className="lp-mobile-close" onClick={() => setMenuOpen(false)}>?</button>
        {[["#sektoren","Sektoren"],["#funktionen","Funktionen"],["#preise","Preise"],["#datenschutz","Datenschutz"]].map(([h,l]) => (
          <a key={h} href={h} onClick={() => setMenuOpen(false)}>{l}</a>
        ))}
        <a href="/login" onClick={() => setMenuOpen(false)} style={{ fontSize: 16, color: "var(--muted)" }}>Einloggen</a>
        <a href="/demo" onClick={() => setMenuOpen(false)} style={{ background: "var(--g)", color: "#fff", padding: "14px 32px", borderRadius: 12, fontSize: 16, fontWeight: 700 }}>Interaktive Demo</a>
      </div>

      {/* NAV */}
      <nav className={`lp-nav${scrolled ? " on" : ""}`}>
        <div className="lp-nav-i">
          <a href="/" className="lp-logo">LkSG<em>Compass</em></a>
          <div className="lp-links">
            <a href="#sektoren">Sektoren</a>
            <a href="#funktionen">Funktionen</a>
            <a href="#preise">Preise</a>
            <a href="#datenschutz">Datenschutz</a>
            <a href="/pricing">Pricing</a>
            <a href="/login">{lang==="de"?"Einloggen":"Log in"}</a>
            <a href="/demo" className="nav-cta">{lang==="de"?"Live-Demo ansehen":"View live demo"}</a>
            <div className="lp-lang-btns">
              <button className={`lp-lb${lang==="de"?" lp-lb-on":""}`} onClick={()=>{setLang("de");setLangState("de");}}>DE</button>
              <button className={`lp-lb${lang==="en"?" lp-lb-on":""}`} onClick={()=>{setLang("en");setLangState("en");}}>EN</button>
            </div>
          </div>
          <button className="lp-hamburger" onClick={() => setMenuOpen(true)} aria-label="Menu offnen">
            <Icon.Menu />
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="lp-hero">
        <div className="hero-mesh" />
        <div className="hero-dots" />
        <div className="hero-inner">
          <div className="hero-left">
            <div className="hero-badge">
              <span className="badge-pulse" />
              LkSG  -  BAFA  -  CSDDD-ready
            </div>
            <h1 className="hero-h1" style={{ opacity: 1 }}>
              {lang==="de"?<>Supply-Chain-<br/>Compliance fur<br/><em>8 Schlussel&shy;branchen.</em></>:<>Supply Chain<br/>Compliance for<br/><em>German law.</em></>}
            </h1>
            <p className="hero-sub">
              {lang==="de"?"LkSGCompass automatisiert Risikoanalyse, Lieferanten-Screening und BAFA-Berichterstattung -- fur Unternehmen mit internationalen Lieferketten in Textil, Logistik, Automotive und mehr.":"LkSGCompass automates risk analysis, supplier screening and BAFA reporting -- for companies with international supply chains in textile, logistics, automotive and more."}
            </p>
            <div className="hero-ctas">
              <a href="/demo" className="btn-primary">
                {lang==="de"?"Live-Demo ansehen":"View live demo"} <Icon.Arrow />
              </a>
              <a href="/pricing" className="btn-ghost">
                {lang==="de"?"Preise ansehen":"View pricing"}
              </a>
            </div>
            <div className="hero-proof">
              {["Keine Kreditkarte notig","DSGVO-konform","EU-Hosting"].map(t => (
                <div key={t} className="hero-proof-item">
                  <Icon.Check /> {t}
                </div>
              ))}
            </div>
          </div>
          <div className="hero-right">
            <div className="mockup-float">
              <DashboardMockup />
            </div>
            <div className="mockup-badge">
              <div className="mockup-badge-dot" />
              <div>
                <div className="mockup-badge-text">Compliance Score</div>
                <div className="mockup-badge-sub">84/100  -  aktualisiert jetzt</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <div className="lp-stats">
        <div className="lp-stats-i">
          {[
            { n: "200+", l: "Lander im Risiko-Datensatz" },
            { n: "8", l: "Schlusselbranchen abgedeckt" },
            { n: "§10", l: "LkSG BAFA-konform" },
            { n: "<5 min", l: "bis zum ersten Bericht" },
          ].map((s, i) => (
            <div key={i} className="lp-stat" {...a(`stat-${i}`, i * 0.08)}>
              <div className="lp-stat-n">{s.n}</div>
              <div className="lp-stat-l">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTORS */}
      <section className="lp-sec" id="sektoren">
        <div className="lp-sec-i">
          <div {...a("sec-hd")}>
            <div className="lp-chip-label">Branchenabdeckung</div>
            <h2 className="lp-h2">Entwickelt fur Unternehmen<br />mit <em>internationalen Lieferketten.</em></h2>
            <p className="lp-sub">Ob Textil aus Sudasien, Elektronik aus Fernost oder Rohstoffe aus Afrika -- LkSGCompass bewertet Risiken in allen 8 vom LkSG erfassten Schlusselbranchen.</p>
          </div>
          <div className="sectors-grid">
            {sectors.map((s, i) => (
              <div key={i} className="sector-card" {...a(`sec-${i}`, 0.1 + i * 0.05)}>
                <div className="sector-icon">{s.icon}</div>
                <div className="sector-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="lp-sec bg" id="funktionen">
        <div className="lp-sec-i">
          <div {...a("feat-hd")}>
            <div className="lp-chip-label">Funktionen</div>
            <h2 className="lp-h2">Vom Import bis zum<br /><em>BAFA-Bericht.</em></h2>
          </div>

          <div className="features-layout">
            {/* Feature 1 */}
            <div className="feature-row" {...a("f1")}>
              <div>
                <div className="feature-tag">Auto Compliance</div>
                <h3 className="feature-title">CSV rein -- BAFA-Bericht raus.</h3>
                <p className="feature-desc">Laden Sie Ihre Lieferantenliste hoch. LkSGCompass analysiert automatisch Landerrisiken, Branchenspezifika und gewichtet alle §10-relevanten Dimensionen. In unter 5 Minuten.</p>
                <div className="feature-points">
                  {["200+ Lander nach Menschenrechten, Korruption, Arbeitsstandards","8 Branchenklassifizierungen mit eigenen Risikogewichten","Jahrliche Aktualisierung der Landerdaten"].map((p, i) => (
                    <div key={i} className="fp">
                      <div className="fp-icon"><Icon.Check /></div>
                      {p}
                    </div>
                  ))}
                </div>
              </div>
              <DashboardMockup />
            </div>

            {/* Feature 2 */}
            <div className="feature-row rev" {...a("f2")}>
              <div>
                <div className="feature-tag">BAFA Report Generator</div>
                <h3 className="feature-title">Alle 5 Pflichtabschnitte. Sofort als PDF.</h3>
                <p className="feature-desc">Der integrierte Report-Generator erstellt den vollstandigen Jahresbericht nach §10 Abs. 2 LkSG -- strukturiert nach dem offiziellen BAFA-Fragebogen, editierbar, per Klick als PDF.</p>
                <div className="feature-points">
                  {["Alle 5 Pflichtabschnitte (§10 Abs. 2 Nr. 1-5 LkSG)","Bearbeitbarer Entwurfsmodus vor PDF-Export","Automatische Lieferantenubersicht als Anhang"].map((p, i) => (
                    <div key={i} className="fp">
                      <div className="fp-icon"><Icon.FileText /></div>
                      {p}
                    </div>
                  ))}
                </div>
              </div>
              <ReportMockup />
            </div>

            {/* Feature 3 */}
            <div className="feature-row" {...a("f3")}>
              <div>
                <div className="feature-tag">Sanctions & Monitoring</div>
                <h3 className="feature-title">Echtzeit-Screening. Automatisch.</h3>
                <p className="feature-desc">Screening aller Lieferanten gegen EU- und OFAC-Sanktionslisten, ESG-Signale und Nachrichtenmonitoring -- kontinuierlich und ohne manuellen Aufwand.</p>
                <div className="feature-points">
                  {["EU- und OFAC-Sanktionslisten-Abgleich","ESG-Signal-Erkennung fur alle Lieferanten","News-Monitoring via GDELT (kein API-Key notig)"].map((p, i) => (
                    <div key={i} className="fp">
                      <div className="fp-icon"><Icon.Bell /></div>
                      {p}
                    </div>
                  ))}
                </div>
              </div>
              <MonitoringMockup />
            </div>

            {/* Feature 4 -- Whistleblowing */}
            <div className="feature-row rev" {...a("f4")}>
              <div>
                <div className="feature-tag">Hinweisgebersystem</div>
                <h3 className="feature-title">Offentliches Meldeportal. Anonym. DSGVO-konform.</h3>
                <p className="feature-desc">Jedes Unternehmen erhalt ein eigenes, offentlich zugangliches Hinweisgeberportal -- gemass EU-Whistleblower-Richtlinie 2019/1937 und §§ 10, 12 HinSchG. Kein technischer Aufwand, sofort einsatzbereit.</p>
                <div className="feature-points">
                  {["Anonyme Einreichung ohne Login","Eigene Portal-URL pro Unternehmen (z.B. /complaints/ihr-unternehmen)","Vollstandige Fallverwaltung im Dashboard"].map((p, i) => (
                    <div key={i} className="fp">
                      <div className="fp-icon"><Icon.Lock /></div>
                      {p}
                    </div>
                  ))}
                </div>
              </div>
              {/* Whistleblowing Mockup */}
              <div style={{ background: "#fff", border: "1px solid #e6e6e6", borderRadius: 14, padding: 24, boxShadow: "0 8px 32px rgba(0,0,0,0.06)" }}>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>Offentliches Meldeportal</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#0b0f0c" }}>Hinweisgebersystem</div>
                  <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>Anonym  -  Verschlusselt  -  DSGVO-konform</div>
                </div>
                {[
                  { label: "Lieferant", type: "select", val: "Textile Group GmbH" },
                  { label: "Kategorie", type: "select", val: "Menschenrechte" },
                ].map(f => (
                  <div key={f.label} style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>{f.label}</div>
                    <div style={{ background: "#f6f7f6", border: "1px solid #e6e6e6", borderRadius: 8, padding: "9px 12px", fontSize: 13, color: "#374151" }}>{f.val}</div>
                  </div>
                ))}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Beschreibung</div>
                  <div style={{ background: "#f6f7f6", border: "1px solid #e6e6e6", borderRadius: 8, padding: "9px 12px", fontSize: 13, color: "#9ca3af", minHeight: 72 }}>Sachverhalt beschreiben...</div>
                </div>
                <div style={{ background: "#1B3D2B", borderRadius: 8, padding: "11px 14px", textAlign: "center", fontSize: 13, fontWeight: 700, color: "#fff" }}>Meldung anonym absenden</div>
                <div style={{ fontSize: 11, color: "#9ca3af", textAlign: "center", marginTop: 10 }}>Kontaktangaben sind optional</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="lp-sec">
        <div className="lp-sec-i">
          <div {...a("how-hd")} style={{ textAlign: "center", maxWidth: 560, margin: "0 auto" }}>
            <div className="lp-chip-label">So funktioniert es</div>
            <h2 className="lp-h2">In vier Schritten zur<br /><em>vollstandigen Compliance.</em></h2>
            <p className="lp-sub" style={{ margin: "0 auto" }}>Kein IT-Projekt. Keine Monate der Einfuhrung. Am ersten Tag einsatzbereit.</p>
          </div>
          <div className="steps-grid">
            <div className="steps-line" />
            {[
              { n: "1", icon: <Icon.Zap />, title: "Lieferanten importieren", desc: "CSV hochladen oder manuell erfassen. Bulk-Import fur bestehende Lieferantenlisten." },
              { n: "2", icon: <Icon.Globe />, title: "Automatische Risikoanalyse", desc: "Landerspezifisches Scoring nach 4 gewichteten Dimensionen pro Lieferant." },
              { n: "3", icon: <Icon.Bell />, title: "Monitoring starten", desc: "Sanktionslisten, ESG und News werden kontinuierlich und automatisch gepruft." },
              { n: "4", icon: <Icon.FileText />, title: "BAFA-Bericht generieren", desc: "Einen Klick -- vollstandiger LkSG-Jahresbericht als PDF, bereit zur Prufung." },
            ].map((s, i) => (
              <div key={i} className="step-card" {...a(`step-${i}`, i * 0.12)}>
                <div className="step-num">{s.n}</div>
                <h3 className="step-title">{s.title}</h3>
                <p className="step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="lp-sec bg" id="preise">
        <div className="lp-sec-i">
          <div {...a("price-hd")} style={{ textAlign: "center" }}>
            <div className="lp-chip-label">Preise</div>
            <h2 className="lp-h2">Transparent.<br /><em>Keine versteckten Kosten.</em></h2>
            <p className="lp-sub" style={{ margin: "0 auto" }}>Alle Plane beinhalten Kernfunktionen. Jederzeit kundbar. Keine Kreditkarte fur den Einstieg.</p>
          </div>
          <div className="pricing-grid">
            {[
              {
                tier: "Starter", price: "149", period: "? / Monat, jahrlich",
                feats: ["Bis zu 50 Lieferanten","Automatische Risikoanalyse","BAFA-PDF-Bericht","Hinweisgebersystem","E-Mail-Support"],
                off: ["Sanctions Screening","ESG & News Monitoring"],
                cta: "Starter wahlen", solid: false, featured: false, href: "/register",
              },
              {
                tier: "Growth", price: "499", period: "? / Monat, jahrlich",
                feats: ["Bis zu 500 Lieferanten","Automatische Risikoanalyse","BAFA-PDF-Bericht","Hinweisgebersystem","Sanctions Screening (EU + OFAC)","ESG & News Monitoring","Priority-Support"],
                off: [],
                cta: "Growth wahlen", solid: true, featured: true, href: "/register",
              },
              {
                tier: "Enterprise", price: null, period: "Individuelles Angebot",
                feats: ["Unbegrenzte Lieferanten","Alle Growth-Features","API-Zugang","SAP / ERP Integration","Dedicated Account Manager","AVV nach Art. 28 DSGVO"],
                off: [],
                cta: "Kontakt aufnehmen", solid: false, featured: false, href: "mailto:hello@lksgcompass.de",
              },
            ].map((plan, i) => (
              <div key={i} className={`plan${plan.featured ? " featured" : ""}`} {...a(`plan-${i}`, i * 0.1)}>
                {plan.featured && <div className="plan-badge">Beliebtester Plan</div>}
                <div className="plan-tier">{plan.tier}</div>
                <div className="plan-price">
                  {plan.price ? <><sup>?</sup>{plan.price}</> : <span className="plan-price-text">Individuell</span>}
                </div>
                <div className="plan-period">{plan.period}</div>
                <hr />
                <ul className="plan-feats">
                  {plan.feats.map((f, j) => (
                    <li key={j} className="plan-feat">
                      <span className="feat-yes"><Icon.Check /></span> {f}
                    </li>
                  ))}
                  {plan.off.map((f, j) => (
                    <li key={j} className="plan-feat off">
                      <span className="feat-no"><Icon.X /></span> {f}
                    </li>
                  ))}
                </ul>
                <a href={plan.href} className={`plan-btn ${plan.solid ? "solid" : "outline"}`}>{plan.cta}</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LEGAL / DATENSCHUTZ */}
      <section className="legal-strip" id="datenschutz">
        <div className="lp-sec-i">
          <div {...a("legal-hd")}>
            <div className="lp-chip-label">Datenschutz & Sicherheit</div>
            <h2 className="lp-h2" style={{ fontSize: "clamp(26px,3vw,40px)" }}>Gebaut mit <em>DSGVO</em> von Anfang an.</h2>
          </div>
          <div className="legal-grid">
            {[
              { icon: <Icon.Globe />, title: "EU-Hosting", text: "Alle Daten ausschliesslich auf Servern in der Europaischen Union. Kein Transfer in Drittlander." },
              { icon: <Icon.Shield />, title: "DSGVO Art. 28", text: "Auftragsverarbeitungsvertrag (AVV) auf Anfrage. Vollstandige Datenschutzerklarung verfugbar." },
              { icon: <Icon.Lock />, title: "TLS + bcrypt", text: "Alle Verbindungen verschlusselt. Passworter mit bcrypt gehasht. JWT mit kurzer Laufzeit." },
              { icon: <Icon.FileText />, title: "Recht auf Loschung", text: "Vollstandige Datenloschung auf Anfrage nach Art. 17 DSGVO -- nachweisbar und unwiderruflich." },
            ].map((item, i) => (
              <div key={i} className="legal-item" {...a(`legal-${i}`, i * 0.08)}>
                <div className="legal-ico">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="lp-cta">
        <div className="cta-mesh" />
        <div className="cta-inner" {...a("cta-main")}>
          <div className="cta-label">Jetzt loslegen</div>
          <h2 className="cta-h2">LkSG-Compliance.<br /><em>Ab heute.</em></h2>
          <p className="cta-sub">Kein Kreditkarte. In 5 Minuten einsatzbereit. Jederzeit kundbar.</p>
          <div className="cta-btns">
            <a href="/demo" className="btn-white">Interaktive Demo starten →</a>
            <a href="/pricing" className="btn-white-ghost">Pakete vergleichen</a>
          </div>
          <p className="cta-note">• DSGVO-konform · • EU-Hosting · • Keine Vertragsbindung · • AVV auf Anfrage</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="lp-footer">
        <div className="footer-i">
          <div className="footer-top">
            <div className="footer-brand">
              <div className="footer-logo">LkSG<em>Compass</em></div>
              <p className="footer-desc">Supply Chain Due Diligence Plattform -- LkSG, CSDDD, BAFA. DSGVO-konform, EU-Hosting.</p>
            </div>
            <div className="footer-cols">
              <div className="footer-col">
                <h4>Produkt</h4>
                <a href="#sektoren">Sektoren</a>
                <a href="#funktionen">Funktionen</a>
                <a href="#preise">Preise</a>
                <a href="/demo">Demo starten</a>
                <a href="/login">{lang==="de"?"Einloggen":"Log in"}</a>
              </div>
              <div className="footer-col">
                <h4>Compliance</h4>
                <a href="#">LkSG Uberblick</a>
                <a href="#">BAFA-Anforderungen</a>
                <a href="#">CSDDD 2026</a>
                <a href="#">Hinweisgebergesetz</a>
              </div>
              <div className="footer-col">
                <h4>Rechtliches</h4>
                <a href="/impressum">Impressum</a>
                <a href="/datenschutz">Datenschutzerklarung</a>
                <a href="/agb">AGB</a>
                <a href="mailto:datenschutz@lksgcompass.de">Datenschutzbeauftragter</a>
              </div>
              <div className="footer-col">
                <h4>Kontakt</h4>
                <a href="mailto:hello@lksgcompass.de">hello@lksgcompass.de</a>
                <a href="/pricing">Pricing</a>
                <a href="mailto:partner@lksgcompass.de">Partnerprogramm</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="footer-copy">? {new Date().getFullYear()} LkSGCompass. Alle Rechte vorbehalten.</div>
            <div className="footer-legal">
              <a href="/impressum">Impressum</a>
              <a href="/datenschutz">Datenschutz</a>
              <a href="/agb">AGB</a>
            </div>
            <div className="footer-badges">
              <span className="footer-badge">DSGVO</span>
              <span className="footer-badge">EU-Hosting</span>
              <span className="footer-badge">TLS/HTTPS</span>
              <span className="footer-badge">bcrypt</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
