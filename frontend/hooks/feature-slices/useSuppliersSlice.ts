"use client";

import type { WorkspaceTabProps } from "@/lib/workspace-types";

export default function useSuppliersSlice(base: WorkspaceTabProps): WorkspaceTabProps {
  return {
    ...base,
    suppliers: [...base.suppliers].sort((a, b) => {
      if (b.risk_score !== a.risk_score) return b.risk_score - a.risk_score;
      return a.name.localeCompare(b.name);
    }),
  };
}
