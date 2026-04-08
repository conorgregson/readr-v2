import { ZodError } from "zod";

export type AppErrorCode =
  | "BAD_REQUEST"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "INTERNAL_ERROR"
  | "CONFLICT"
  | "FORBIDDEN"
  | "REQUEST_TOO_LARGE"
  | "AUTH_EMAIL_ALREADY_IN_USE"
  | "AUTH_INVALID_CREDENTIALS"
  | "AUTH_UNAUTHORIZED";

export class AppError extends Error {
  public status: number;
  public code: AppErrorCode;
  public details?: unknown;
  public context?: Record<string, unknown>;

  constructor(
    message: string,
    options?: {
      status?: number;
      code?: AppErrorCode;
      details?: unknown;
      context?: Record<string, unknown>;
    },
  ) {
    super(message);
    this.name = "AppError";
    this.status = options?.status ?? 500;
    this.code = options?.code ?? "INTERNAL_ERROR";
    this.details = options?.details;
    this.context = options?.context;
  }
}

export function zodToAppError(error: ZodError): AppError {
  return new AppError("Validation failed", {
    status: 400,
    code: "VALIDATION_ERROR",
    details: error.format(),
  });
}

export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) return error;

  if (error instanceof Error) {
    return new AppError(error.message || "Internal server error", {
      status: 500,
      code: "INTERNAL_ERROR",
      context: {
        causeName: error.name,
      },
    });
  }

  return new AppError("Internal server error", {
    status: 500,
    code: "INTERNAL_ERROR",
  });
}
