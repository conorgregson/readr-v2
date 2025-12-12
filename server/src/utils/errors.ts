import { ZodError } from "zod";

export type AppErrorCode =
  | "BAD_REQUEST"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "INTERNAL_ERROR";

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
  const formatted = error.format();
  return new AppError("Validation failed", {
    status: 400,
    code: "VALIDATION_ERROR",
    details: formatted,
  });
}
