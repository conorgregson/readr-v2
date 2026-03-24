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

  constructor(
    message: string,
    options?: {
      status?: number;
      code?: AppErrorCode;
      details?: unknown;
    },
  ) {
    super(message);
    this.name = "AppError";
    this.status = options?.status ?? 500;
    this.code = options?.code ?? "INTERNAL_ERROR";
    this.details = options?.details;
  }
}

export function zodToAppError(error: ZodError): AppError {
  return new AppError("Validation failed", {
    status: 400,
    code: "VALIDATION_ERROR",
    details: error.format(),
  });
}
