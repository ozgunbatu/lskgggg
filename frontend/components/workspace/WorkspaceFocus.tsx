import type { WorkspaceCard } from "@/lib/workspace-types";

export default function WorkspaceFocus({ cards }: { cards: WorkspaceCard[] }) {
  return (
    <div className="workspace-focus">
      {cards.map((card, idx) => (
        <div key={`${card.kicker}-${idx}`} className="focus-card">
          <div className="focus-kicker">{card.kicker}</div>
          <div className="focus-value">{card.value}</div>
          {card.chip && <div className="focus-chip">{card.chip}</div>}
          <div className="focus-copy">{card.copy}</div>
          <div className="focus-action">
            <button className={"btn btn-sm " + (idx === 0 ? "btn-p" : "btn-g")} onClick={card.action}>{card.cta} →</button>
          </div>
        </div>
      ))}
    </div>
  );
}
