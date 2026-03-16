import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export type AuthClaims = {
  userId: string;
  companyId: string;
  role: string;
  email?: string;
};

declare global {
  namespace Express {
    interface Request {
      auth?: AuthClaims;
    }
  }
}

function getToken(req: Request) {
  const header = String(req.headers.authorization || "");
  if (header.startsWith("Bearer ")) return header.slice(7);
  const cookie = String(req.headers.cookie || "");
  const match = cookie.match(/(?:^|; )lksg_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : "";
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = getToken(req);
  if (!token) return res.status(401).json({ error: "Missing auth token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthClaims;
    req.auth = decoded;
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid/expired token" });
  }
}
