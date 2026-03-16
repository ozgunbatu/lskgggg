import { Request, Response, NextFunction } from "express";
import { db } from "../lib/db";
import type { AuthClaims } from "./auth";

export const ROLE_ORDER = ["viewer", "analyst", "manager", "approver", "admin"] as const;
export type AppRole = typeof ROLE_ORDER[number];

function roleRank(role?: string) {
  const idx = ROLE_ORDER.indexOf((role || "viewer") as AppRole);
  return idx === -1 ? 0 : idx;
}

export function hasMinRole(role: string | undefined, minimum: AppRole) {
  return roleRank(role) >= roleRank(minimum);
}

export function requireMinRole(minimum: AppRole) {
  return (req: Request, res: Response, next: NextFunction) => {
    const auth = req.auth as AuthClaims | undefined;
    if (!auth) return res.status(401).json({ error: "Unauthorized" });
    if (!hasMinRole(auth.role, minimum)) {
      return res.status(403).json({ error: `Requires ${minimum} role`, requiredRole: minimum, currentRole: auth.role || "viewer" });
    }
    return next();
  };
}

export const requireWriteAccess = requireMinRole("analyst");
export const requireApprovalAccess = requireMinRole("approver");

export async function logApprovalEvent(companyId: string, userEmail: string | undefined, action: string, entityType: string, entityId: string, entityName?: string, newValue?: any) {
  await db.query(
    `INSERT INTO audit_log(company_id,user_email,action,entity_type,entity_id,entity_name,new_value)
     VALUES($1,$2,$3,$4,$5,$6,$7)`,
    [companyId, userEmail || null, action, entityType, entityId, entityName || null, newValue ? JSON.stringify(newValue) : null]
  ).catch(() => {});
}
