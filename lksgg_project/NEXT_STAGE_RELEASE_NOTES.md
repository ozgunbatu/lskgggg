# Next Stage Refactor

This pass focuses on internal cleanup rather than visible feature changes.

## What changed
- Extracted a shared frontend API layer to `frontend/lib/api.ts`
- Reused the API base URL consistently across auth and app requests
- Moved workspace header into `frontend/components/workspace/WorkspaceHeader.tsx`
- Moved workspace focus cards into `frontend/components/workspace/WorkspaceFocus.tsx`
- Moved the settings/governance screen into `frontend/components/workspace-tabs/SettingsTab.tsx`
- Centralized authenticated download handling for exports

## Why this matters
- Smaller `AppWorkspace.tsx`
- Cleaner separation between shell, settings, and request logic
- Safer next step for splitting the dashboard and remaining modal/form logic

## Still next
- Split dashboard into its own component
- Split supplier modal and CAP modal into standalone feature components
- Introduce a shared store for core app data
