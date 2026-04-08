import type { Request, Response, NextFunction } from "express";
import type { ZodTypeAny } from "zod";
import { ZodError } from "zod";
import { AppError, zodToAppError } from "./errors";

function getRequestContext(req: Request) {
  return {
    method: req.method,
    path: req.originalUrl || req.url,
    origin: req.get("origin") ?? null,
    ip: req.ip ?? null,
  };
}

function logWarn(message: string, meta: Record<string, unknown>) {
  console.warn(message, meta);
}

function logError(message: string, meta: Record<string, unknown>) {
  console.error(message, meta);
}

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
  return res.status(200).json({ ok: true, data });
}

export function sendCreated(res: Response, data: unknown) {
  return res.status(201).json({ ok: true, data });
}

export function sendNoContent(res: Response) {
  return res.status(204).send();
}

export function notFoundHandler(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  next(
    new AppError("Route not found", {
      status: 404,
      code: "NOT_FOUND",
      context: getRequestContext(req),
    }),
  );
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  const requestContext = getRequestContext(req);

  if (err instanceof SyntaxError && "body" in err) {
    logWarn("Malformed JSON body", {
      ...requestContext,
    });

    return res.status(400).json({
      ok: false,
      error: {
        message: "Malformed JSON body",
        code: "BAD_REQUEST",
      },
    });
  }

  if (
    typeof err === "object" &&
    err !== null &&
    "type" in err &&
    err.type === "entity.too.large"
  ) {
    logWarn("Request body too large", {
      ...requestContext,
    });

    return res.status(413).json({
      ok: false,
      error: {
        message: "Request body too large",
        code: "REQUEST_TOO_LARGE",
      },
    });
  }

  if (err instanceof AppError) {
    const meta = {
      ...requestContext,
      status: err.status,
      code: err.code,
      details: err.code === "VALIDATION_ERROR" ? err.details : undefined,
      context: err.context,
    };

    if (err.status >= 500) {
      logError("Application error", meta);
    } else {
      logWarn("Application error", meta);
    }

    return res.status(err.status).json({
      ok: false,
      error: {
        message: err.message,
        code: err.code,
        ...(err.code === "VALIDATION_ERROR" ? { details: err.details } : {}),
      },
    });
  }

  logError("Unexpected error", {
    ...requestContext,
    err,
  });

  return res.status(500).json({
    ok: false,
    error: {
      message: "Internal server error",
      code: "INTERNAL_ERROR",
    },
  });
}
