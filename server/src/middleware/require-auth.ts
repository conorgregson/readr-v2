import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../modules/auth/auth.utils";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const header = req.header("Authorization");

    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({
        ok: false,
        error: { message: "Unauthorized", code: "AUTH_UNAUTHORIZED" },
      });
    }

    const token = header.slice(7).trim();
    const payload = verifyToken(token);

    req.auth = {
      userId: payload.sub,
      email: payload.email,
    };

    next();
  } catch {
    return res.status(401).json({
      ok: false,
      error: { message: "Unauthorized", code: "AUTH_UNAUTHORIZED" },
    });
  }
}
