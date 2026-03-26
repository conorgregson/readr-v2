import type { NextFunction, Request, Response } from "express";
import rateLimit from "express-rate-limit";

function parsePositiveInt(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function createAuthRateLimiter() {
  if (process.env.NODE_ENV === "test") {
    return (_req: Request, _res: Response, next: NextFunction) => next();
  }

  return rateLimit({
    windowMs: parsePositiveInt(
      process.env.AUTH_RATE_LIMIT_WINDOW_MS,
      15 * 60 * 1000,
    ),
    max: parsePositiveInt(process.env.AUTH_RATE_LIMIT_MAX, 10),
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      ok: false,
      error: {
        message: "Too many requests, please try again later.",
        code: "RATE_LIMITED",
      },
    },
  });
}
