import type { NextFunction, Request, Response } from "express";
import rateLimit from "express-rate-limit";

import { env } from "../config/env";

export function createAuthRateLimiter() {
  if (env.NODE_ENV === "test") {
    return (_req: Request, _res: Response, next: NextFunction) => next();
  }

  return rateLimit({
    windowMs: env.AUTH_RATE_LIMIT_WINDOW_MS,
    max: env.AUTH_RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      console.warn("[auth] Rate limit exceeded", {
        method: req.method,
        path: req.originalUrl,
        ip: req.ip ?? null,
        origin: req.get("origin") ?? null,
        windowMs: env.AUTH_RATE_LIMIT_WINDOW_MS,
        max: env.AUTH_RATE_LIMIT_MAX,
      });

      return res.status(429).json({
        ok: false,
        error: {
          message: "Too many requests, please try again later.",
          code: "RATE_LIMITED",
        },
      });
    },
  });
}
