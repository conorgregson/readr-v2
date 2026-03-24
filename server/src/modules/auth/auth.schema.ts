import { z } from "zod";

const email = z.string().trim().email("Valid email is required");

const password = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be 72 characters or fewer");

export const RegisterSchema = z
  .object({
    email,
    password,
  })
  .strict();

export const LoginSchema = z
  .object({
    email,
    password,
  })
  .strict();

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
