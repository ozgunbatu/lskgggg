export type WorkspaceRole = "viewer" | "analyst" | "manager" | "approver" | "admin" | string;

const ORDER: WorkspaceRole[] = ["viewer", "analyst", "manager", "approver", "admin"];

function rank(role: WorkspaceRole) {
  const idx = ORDER.indexOf(role);
  return idx === -1 ? 0 : idx;
}

export function hasMinRole(role: WorkspaceRole, min: WorkspaceRole) {
  return rank(role) >= rank(min);
}

export function canWrite(role: WorkspaceRole) {
  return hasMinRole(role, "analyst");
}

export function canManageCases(role: WorkspaceRole) {
  return hasMinRole(role, "manager");
}

export function canApprove(role: WorkspaceRole) {
  return hasMinRole(role, "approver");
}
