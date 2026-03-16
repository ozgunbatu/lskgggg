import type { Lang } from "@/lib/workspace-types";

type Props = {
  L: Lang;
  icon: string;
  title: string;
  copy: string;
  cta?: string;
  onCta?: () => void;
};

export default function WorkspaceEmptyState({ icon, title, copy, cta, onCta }: Props) {
  return (
    <div className="empty">
      <div className="empty-ic">{icon}</div>
      <div className="empty-t">{title}</div>
      <div className="empty-c">{copy}</div>
      {cta && onCta && (
        <button
          className="btn btn-g btn-sm"
          style={{ marginTop: 16 }}
          onClick={onCta}
        >
          {cta}
        </button>
      )}
    </div>
  );
}
