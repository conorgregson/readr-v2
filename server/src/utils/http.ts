import type { Request, Response, NextFunction } from "express";
import type { ZodTypeAny } from "zod";
import { ZodError } from "zod";
import { AppError, zodToAppError } from "./errors";

/**
 * Validate request body using a Zod schema.
 */
export function validateBody(schema: ZodTypeAny) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req.body);
      (req as any).validatedBody = parsed;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(zodToAppError(error));
      } else {
        next(error);
      }
    }
  };
}

/**
 * Validate request query using a Zod schema.
 */
export function validateQuery(schema: ZodTypeAny) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req.query);
      (req as any).validatedQuery = parsed;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(zodToAppError(error));
      } else {
        next(error);
      }
    }
  };
}

/**
 * Validate route params using a Zod schema.
 */
export function validateParams(schema: ZodTypeAny) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req.params);
      (req as any).validatedParams = parsed;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(zodToAppError(error));
      } else {
        next(error);
      }
    }
  };
}

export function sendOk(res: Response, data: unknown) {
  res.status(200).json({ ok: true, data });
}

export function sendCreated(res: Response, data: unknown) {
  res.status(201).json({ ok: true, data });
}

/**
 * Central error handler (must be last middleware).
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof AppError) {
    return res.status(err.status).json({
      ok: false,
      error: {
        message: err.message,
        code: err.code,
        details: err.details,
      },
    });
  }

  console.error("Unexpected error:", err);

  return res.status(500).json({
    ok: false,
    error: {
      message: "Internal server error",
      code: "INTERNAL_ERROR",
    },
  });
}
