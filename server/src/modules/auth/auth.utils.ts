import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { AuthTokenPayload } from "./auth.types";

const SALT_ROUNDS = 10;

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not configured");
  return secret;
}

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
  return jwt.sign(payload, getSecret(), { expiresIn: "7d" });
}

export function verifyToken(token: string): AuthTokenPayload {
  const decoded = jwt.verify(token, getSecret());

  if (
    !decoded ||
    typeof decoded !== "object" ||
    typeof decoded.sub !== "string"
  ) {
    throw new Error("Invalid token");
  }

  return {
    sub: decoded.sub,
    email: decoded.email as string,
  };
}
