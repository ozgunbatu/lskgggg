import type { Request, Response, NextFunction } from "express";

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  const requestId = req.header("x-request-id") || Math.random().toString(36).slice(2, 10);
  res.setHeader("x-request-id", requestId);
  res.on("finish", () => {
    const ms = Date.now() - start;
    const meta = {
      id: requestId,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      ms,
      ip: req.ip,
    };
    const line = `[http] ${meta.method} ${meta.path} ${meta.status} ${meta.ms}ms ${meta.ip} #${meta.id}`;
    if (res.statusCode >= 500) console.error(line);
    else if (res.statusCode >= 400) console.warn(line);
    else console.log(line);
  });
  next();
}
