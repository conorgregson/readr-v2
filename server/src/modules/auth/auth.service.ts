import { prisma } from "../../db/client";
import { AppError } from "../../utils/errors";
import { toAuthUser } from "./auth.mapper";
import {
  comparePassword,
  hashPassword,
  normalizeEmail,
  signToken,
} from "./auth.utils";
import type { LoginInput, RegisterInput } from "./auth.schema";

export async function register(input: RegisterInput) {
  const email = normalizeEmail(input.email);

  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    throw new AppError("Email already in use", {
      status: 400,
      code: "AUTH_EMAIL_ALREADY_IN_USE",
    });
  }

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: { email, passwordHash },
    select: { id: true, email: true },
  });

  const safeUser = toAuthUser(user);

  const token = signToken({
    sub: safeUser.id,
    email: safeUser.email,
  });

  return { token, user: safeUser };
}

export async function login(input: LoginInput) {
  const email = normalizeEmail(input.email);

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError("Invalid credentials", {
      status: 401,
      code: "AUTH_INVALID_CREDENTIALS",
    });
  }

  const valid = await comparePassword(input.password, user.passwordHash);

  if (!valid) {
    throw new AppError("Invalid credentials", {
      status: 401,
      code: "AUTH_INVALID_CREDENTIALS",
    });
  }

  const safeUser = toAuthUser(user);

  const token = signToken({
    sub: safeUser.id,
    email: safeUser.email,
  });

  return { token, user: safeUser };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true },
  });

  if (!user) {
    throw new AppError("Unauthorized", {
      status: 401,
      code: "AUTH_UNAUTHORIZED",
    });
  }

  return toAuthUser(user);
}
