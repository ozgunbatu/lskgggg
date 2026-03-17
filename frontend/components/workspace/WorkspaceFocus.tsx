import type { WorkspaceCard } from "@/lib/workspace-types";

const PALETTES = [
  { accent: "#22c55e", bg: "rgba(34,197,94,0.07)", border: "rgba(34,197,94,0.18)", text: "#4ade80" },
  { accent: "#60a5fa", bg: "rgba(96,165,250,0.07)", border: "rgba(96,165,250,0.18)", text: "#7dd3fc" },
  { accent: "#f87171", bg: "rgba(248,113,113,0.07)", border: "rgba(248,113,113,0.18)", text: "#fca5a5" },
  { accent: "#fb923c", bg: "rgba(251,146,60,0.07)",  border: "rgba(251,146,60,0.18)",  text: "#fdba74" },
];

export default function WorkspaceFocus({ cards }: { cards: WorkspaceCard[] }) {
  return (
    <div className="workspace-focus">
      {cards.map((card, i) => {
        const p = PALETTES[i % PALETTES.length];
        return (
          <div
            key={i}
            className="focus-card"
            style={{ borderColor: p.border, background: `linear-gradient(160deg, var(--c1) 0%, ${p.bg} 100%)` }}
          >
            {/* Top line */}
            <div style={{
              position:"absolute", top:0, left:0, right:0, height:1,
              background: `linear-gradient(90deg, transparent, ${p.accent}50, transparent)`,
            }} />

            <div className="focus-kicker" style={{ color: p.accent, opacity: 0.6 }}>
              {card.kicker}
            </div>

            <div className="focus-value" style={{ color: p.text }}>
              {card.value}
            </div>

            {card.chip && (
              <div style={{
                display:"inline-flex", alignItems:"center",
                fontSize: 10.5, fontWeight: 600,
                color: p.accent, background: p.bg,
                border: `1px solid ${p.border}`,
                borderRadius: 20, padding: "2px 8px",
                marginBottom: 6, width: "fit-content",
              }}>
                {card.chip}
              </div>
            )}

            <div className="focus-copy">{card.copy}</div>

            <div className="focus-action">
              <button
                onClick={card.action}
                style={{
                  display:"inline-flex", alignItems:"center", gap:5,
                  fontSize:11.5, fontWeight:600, padding:"4px 10px",
                  borderRadius: "var(--r1)",
                  background: p.bg, color: p.accent,
                  border: `1px solid ${p.border}`,
                  cursor:"pointer", transition:"all 120ms",
                }}
              >
                {card.cta} →
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
