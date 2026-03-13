"use client";

import type { WorkspaceTabProps } from "../../lib/workspace-types";

const complaintPriority: Record<string, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

export default function useComplaintsSlice(base: WorkspaceTabProps): WorkspaceTabProps {
  return {
    ...base,
    complaints: [...base.complaints].sort((a, b) => {
      const severityGap = (complaintPriority[b.severity] || 0) - (complaintPriority[a.severity] || 0);
      if (severityGap !== 0) return severityGap;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }),
  };
}
