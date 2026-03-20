import type { Request, Response, NextFunction } from "express";
import { sendOk, sendCreated } from "../../utils/http";
import { validateBody } from "../../utils/http";
import { LoginSchema, RegisterSchema } from "./auth.schema";
import { login, register, getMe } from "./auth.service";

export async function registerHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const body = (req as any).validatedBody;
    const data = await register(body);
    sendCreated(res, data);
  } catch (e) {
    next(e);
  }
}

export async function loginHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const body = (req as any).validatedBody;
    const data = await login(body);
    sendOk(res, data);
  } catch (e) {
    next(e);
  }
}

export async function meHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.auth!.userId;
    const user = await getMe(userId);
    sendOk(res, { user });
  } catch (e) {
    next(e);
  }
}

export const validateRegister = validateBody(RegisterSchema);
export const validateLogin = validateBody(LoginSchema);
