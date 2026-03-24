import bcrypt from "bcrypt";
import jwt, {
  JsonWebTokenError,
  NotBeforeError,
  TokenExpiredError,
} from "jsonwebtoken";

import { env } from "../../config/env";
import { AppError } from "../../utils/errors";
import type { AuthTokenPayload } from "./auth.types";

const SALT_ROUNDS = 10;

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: AuthTokenPayload) {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
}

export function verifyToken(token: string): AuthTokenPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);

    if (
      !decoded ||
      typeof decoded !== "object" ||
      typeof decoded.sub !== "string"
    ) {
      throw new AppError("Unauthorized", {
        status: 401,
        code: "AUTH_UNAUTHORIZED",
      });
    }

    return {
      sub: decoded.sub,
      email: typeof decoded.email === "string" ? decoded.email : "",
    };
  } catch (error) {
    if (
      error instanceof TokenExpiredError ||
      error instanceof JsonWebTokenError ||
      error instanceof NotBeforeError
    ) {
      throw new AppError("Unauthorized", {
        status: 401,
        code: "AUTH_UNAUTHORIZED",
      });
    }

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError("Unauthorized", {
      status: 401,
      code: "AUTH_UNAUTHORIZED",
    });
  }
}
