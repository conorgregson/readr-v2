import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors";
import { verifyToken } from "../modules/auth/auth.utils";

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.header("Authorization");

    if (!header) {
      return next(
        new AppError("Unauthorized", {
          status: 401,
          code: "AUTH_UNAUTHORIZED",
        }),
      );
    }

    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token?.trim()) {
      return next(
        new AppError("Unauthorized", {
          status: 401,
          code: "AUTH_UNAUTHORIZED",
        }),
      );
    }

    const payload = verifyToken(token.trim());

    req.auth = {
      userId: payload.sub,
      email: payload.email,
    };

    next();
  } catch (error) {
    next(error);
  }
}
