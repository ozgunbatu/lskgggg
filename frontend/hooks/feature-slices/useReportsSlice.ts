"use client";

import type { WorkspaceTabProps } from "@/lib/workspace-types";

export default function useReportsSlice(base: WorkspaceTabProps): WorkspaceTabProps {
  const evidenceSorted = [...base.evidences].sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return {
    ...base,
    evidences: evidenceSorted,
    actions: [...base.actions].sort((a, b) => {
      const aDate = a.due_date ? new Date(a.due_date).getTime() : Number.MAX_SAFE_INTEGER;
      const bDate = b.due_date ? new Date(b.due_date).getTime() : Number.MAX_SAFE_INTEGER;
      return aDate - bDate;
    }),
  };
}
