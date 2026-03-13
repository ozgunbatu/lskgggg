import React from "react";
import { RC, PARAM_META, PARAM_GROUPS_DE, PARAM_GROUPS_EN } from "../../lib/workspace-constants";
import type { Lang, Supplier } from "../../lib/workspace-types";

type Props = { sup: Supplier; compact?: boolean; L: Lang; hoverParam?: string | null; setHoverParam?: (key: string | null) => void };

export default function RiskBreakdown({ sup, compact = false, L, hoverParam, setHoverParam }: Props) {
  const params = sup.risk_parameters || {};
  const PG = L === "de" ? PARAM_GROUPS_DE : PARAM_GROUPS_EN;

  if (!Object.keys(params).length) return (
    <div style={{ fontSize: 12, color: "#9CA3AF", padding: 12, textAlign: "center" as const }}>
      {L === "de" ? "Noch keine Parameter — Lieferant bearbeiten für Details" : "No parameters yet — edit supplier for details"}
    </div>
  );

  return (
    <div className="score-breakdown">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#6B7280", textTransform: "uppercase" as const, letterSpacing: ".6px" }}>
            {L === "de" ? "20-Parameter Risikobewertung" : "20-Parameter Risk Assessment"}
          </div>
          <div style={{ fontSize: 10.5, color: "#9CA3AF", marginTop: 2 }}>§5 Abs.2 LkSG · Gewichtung: Land 35% · Branche 25% · Profil 25% · Vorfälle 15%</div>
        </div>
        <div style={{ textAlign: "right" as const }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: RC[sup.risk_level], lineHeight: 1 }}>{sup.risk_score}</div>
          <div style={{ fontSize: 9, color: "#9CA3AF" }}>/100</div>
        </div>
      </div>

      {PG.map(g => {
        const groupVals = g.keys.map(k => params[k] ?? 0);
        const groupAvg = groupVals.reduce((a, b) => a + b, 0) / groupVals.length;
        return (
          <div key={g.label} style={{ marginBottom: compact ? 10 : 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 3, height: 16, background: g.color, borderRadius: 2 }} />
                <span style={{ fontSize: compact ? 11 : 12, fontWeight: 800, color: "#111827" }}>{g.label}</span>
                <span style={{ fontSize: 9, fontWeight: 700, color: "#6B7280", background: "#F3F4F6", padding: "2px 6px", borderRadius: 6 }}>{g.weight}</span>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: groupAvg >= 4 ? "#DC2626" : groupAvg >= 2.5 ? "#D97706" : "#16A34A" }}>{groupAvg.toFixed(1)}/5.0</span>
            </div>

            <div style={{ display: "grid", gap: compact ? 5 : 6 }}>
              {g.keys.map(k => {
                const v = params[k] ?? 0;
                const meta = PARAM_META[k];
                const isHovered = hoverParam === k;
                return (
                  <div
                    key={k}
                    onMouseEnter={() => setHoverParam?.(k)}
                    onMouseLeave={() => setHoverParam?.(null)}
                    style={{
                      position: "relative",
                      display: "grid",
                      gridTemplateColumns: compact ? "1fr 50px" : "1fr 60px",
                      gap: 8,
                      alignItems: "center",
                      padding: compact ? "6px 8px" : "8px 10px",
                      background: isHovered ? "#F0FDF4" : "#FFFFFF",
                      border: `1px solid ${isHovered ? "#BBF7D0" : "#E5E7EB"}`,
                      borderRadius: 8,
                      transition: "all 0.15s ease",
                      cursor: "help"
                    }}
                  >
                    <div>
                      <div style={{ fontSize: compact ? 10.5 : 11.5, fontWeight: 700, color: "#374151", marginBottom: 3 }}>{meta ? (L === "de" ? meta.de : meta.en) : k}</div>
                      {!compact && meta && <div style={{ fontSize: 9.5, color: "#9CA3AF" }}>{meta.lksg}</div>}
                    </div>
                    <div style={{ textAlign: "right" as const }}>
                      <div style={{ fontSize: compact ? 13 : 15, fontWeight: 900, color: v >= 4 ? "#DC2626" : v >= 2.5 ? "#D97706" : "#16A34A", lineHeight: 1 }}>{v.toFixed(1)}</div>
                      <div style={{ fontSize: 8.5, color: "#9CA3AF" }}>/5</div>
                    </div>

                    {isHovered && meta && !compact && (
                      <div style={{ position: "absolute", top: "100%", left: 0, right: 0, marginTop: 4, zIndex: 50, background: "#111827", color: "white", padding: "10px 12px", borderRadius: 8, boxShadow: "0 10px 25px -5px rgba(0,0,0,0.25)", fontSize: 10.5, lineHeight: 1.45 }}>
                        <div style={{ fontWeight: 800, marginBottom: 4, color: "#A7F3D0" }}>{meta.lksg}</div>
                        <div>{L === "de" ? meta.guidance_de : meta.guidance_en}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
