import type { WorkspaceCard } from "@/lib/workspace-types";

const CARD_COLORS = [
  { accent: "var(--g2)", glow: "rgba(34,197,94,0.12)", text: "var(--g)" },
  { accent: "var(--blue)", glow: "rgba(96,165,250,0.10)", text: "var(--blue)" },
  { accent: "var(--amber)", glow: "rgba(251,191,36,0.10)", text: "var(--amber)" },
  { accent: "var(--purple)", glow: "rgba(192,132,252,0.10)", text: "var(--purple)" },
];

export default function WorkspaceFocus({ cards }: { cards: WorkspaceCard[] }) {
  return (
    <div className="workspace-focus">
      {cards.map((card, idx) => {
        const color = CARD_COLORS[idx % CARD_COLORS.length];
        return (
          <div
            key={`${card.kicker}-${idx}`}
            className="focus-card"
            style={{
              boxShadow: card.urgent ? `0 0 0 1px ${color.accent}30, inset 0 0 40px ${color.glow}` : undefined,
              borderColor: card.urgent ? `${color.accent}30` : undefined,
            }}
          >
            {/* Top accent line */}
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 1,
              background: `linear-gradient(90deg, transparent, ${color.accent}60, transparent)`,
            }} />

            {/* Kicker */}
            <div className="focus-kicker" style={{ color: color.text, opacity: 0.7 }}>
              {card.kicker}
            </div>

            {/* Value */}
            <div className="focus-value" style={{ color: color.text }}>
              {card.value}
            </div>

            {/* Chip */}
            {card.chip && (
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                fontSize: 11,
                fontWeight: 600,
                color: color.text,
                background: `${color.accent}12`,
                border: `1px solid ${color.accent}25`,
                borderRadius: 20,
                padding: "2px 9px",
                marginBottom: 6,
                width: "fit-content",
              }}>
                {card.chip}
              </div>
            )}

            {/* Copy */}
            <div className="focus-copy">{card.copy}</div>

            {/* CTA */}
            <div className="focus-action">
              <button
                className="btn btn-sm"
                style={{
                  background: `${color.accent}14`,
                  color: color.text,
                  border: `1px solid ${color.accent}25`,
                }}
                onClick={card.action}
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
