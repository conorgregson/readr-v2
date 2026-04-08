import "dotenv/config";
import { z } from "zod";
import type { SignOptions } from "jsonwebtoken";

function parsePositiveInt(name: string, fallback: number) {
  return z
    .string()
    .optional()
    .transform((value) => {
      if (!value) return fallback;
      const parsed = Number.parseInt(value, 10);
      if (!Number.isInteger(parsed) || parsed <= 0) {
        throw new Error(`${name} must be a positive integer`);
      }
      return parsed;
    });
}

const EnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: parsePositiveInt("PORT", 4000),

  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  JWT_EXPIRES_IN: z.string().min(1, "JWT_EXPIRES_IN is required").default("7d"),

  CORS_ALLOWED_ORIGINS: z
    .string()
    .optional()
    .default("http://localhost:5173,http://127.0.0.1:5173")
    .transform((value) =>
      value
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean),
    ),

  AUTH_RATE_LIMIT_WINDOW_MS: parsePositiveInt(
    "AUTH_RATE_LIMIT_WINDOW_MS",
    15 * 60 * 1000,
  ),

  AUTH_RATE_LIMIT_MAX: parsePositiveInt("AUTH_RATE_LIMIT_MAX", 10),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("[startup] Invalid environment configuration", {
    issues: parsed.error.format(),
  });
  process.exit(1);
}

export const env = {
  ...parsed.data,
  JWT_EXPIRES_IN: parsed.data.JWT_EXPIRES_IN as SignOptions["expiresIn"],
};
