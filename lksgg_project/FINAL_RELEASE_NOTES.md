# Final Release Notes

This package continues the route-based cleanup and adds a real component split for the workspace tabs.

## What changed

- Broke the main workspace into dedicated tab components under `frontend/components/workspace-tabs/`
- Kept all existing product features intact
- Reduced `frontend/components/AppWorkspace.tsx` from a single monolith into a slimmer orchestration layer
- Preserved route-based module pages under `/app/*`
- Left role/permission work for a later stage, as requested

## New component structure

- `SuppliersTab.tsx`
- `ActionsTab.tsx`
- `ComplaintsTab.tsx`
- `ReportsTab.tsx`
- `SaqTab.tsx`
- `KpiTab.tsx`
- `EvidenceTab.tsx`
- `MonitoringTab.tsx`
- `AiTab.tsx`
- `AuditTab.tsx`

## Why this matters

This is the first refactor step that actually lowers internal complexity instead of only rearranging the UI surface. The app is still feature-rich, but the workspace is now easier to maintain and safer to evolve.

## Honest note

This is not the final possible refactor. Dashboard and shared state are still centralized in `AppWorkspace.tsx`, so the next serious cleanup would be:

1. split dashboard into its own tab component
2. move shared helpers/types into separate files
3. introduce a central API client and store
4. move forms/modals into isolated feature components
