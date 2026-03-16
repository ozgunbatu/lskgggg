"use client";

import buildWorkspaceBaseCtx, { type WorkspaceFeatureSliceArgs } from "./feature-slices/buildWorkspaceBaseCtx";
import useSuppliersSlice from "./feature-slices/useSuppliersSlice";
import useComplaintsSlice from "./feature-slices/useComplaintsSlice";
import useReportsSlice from "./feature-slices/useReportsSlice";
import usePassiveWorkspaceSlice from "./feature-slices/usePassiveWorkspaceSlice";

export default function useWorkspaceFeatureSlices(args: WorkspaceFeatureSliceArgs) {
  const baseCtx = buildWorkspaceBaseCtx(args);

  const dashboardCtx = usePassiveWorkspaceSlice(baseCtx);
  const suppliersCtx = useSuppliersSlice(baseCtx);
  const actionsCtx = usePassiveWorkspaceSlice(baseCtx);
  const complaintsCtx = useComplaintsSlice(baseCtx);
  const reportsCtx = useReportsSlice(baseCtx);
  const saqCtx = usePassiveWorkspaceSlice(baseCtx);
  const kpiCtx = usePassiveWorkspaceSlice(baseCtx);
  const evidenceCtx = usePassiveWorkspaceSlice(baseCtx);
  const monitoringCtx = usePassiveWorkspaceSlice(baseCtx);
  const aiCtx = usePassiveWorkspaceSlice(baseCtx);
  const auditCtx = usePassiveWorkspaceSlice(baseCtx);

  return {
    dashboardCtx,
    suppliersCtx,
    actionsCtx,
    complaintsCtx,
    reportsCtx,
    saqCtx,
    kpiCtx,
    evidenceCtx,
    monitoringCtx,
    aiCtx,
    auditCtx,
  };
}
