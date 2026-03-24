import { z } from "zod";

const ISO_DATETIME_RE =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;

const DATE_ONLY_RE = /^\d{4}-\d{2}-\d{2}$/;

function parseDateInput(value: string): Date {
  const jsDate = DATE_ONLY_RE.test(value)
    ? new Date(value + "T00:00:00.000Z")
    : new Date(value);

  if (Number.isNaN(jsDate.getTime())) {
    throw new Error("Invalid date");
  }

  return jsDate;
}

const DateInputSchema = z
  .string()
  .min(1, "Date is required")
  .superRefine((value: string, ctx) => {
    if (!ISO_DATETIME_RE.test(value) && !DATE_ONLY_RE.test(value)) {
      ctx.addIssue({
        code: "custom",
        message:
          "Date must be an ISO datetime or a YYYY-MM-DD string (e.g., 2025-12-11 or 2025-12-11T10:00:00Z)",
      });
      return;
    }

    const jsDate = DATE_ONLY_RE.test(value)
      ? new Date(value + "T00:00:00.000Z")
      : new Date(value);

    if (Number.isNaN(jsDate.getTime())) {
      ctx.addIssue({
        code: "custom",
        message: "Invalid date",
      });
    }
  })
  .transform((value: string) => parseDateInput(value));

const normalizeOptionalNotesToUndefined = z
  .union([z.string(), z.undefined()])
  .transform((value) => {
    if (value === undefined) return undefined;
    const trimmed = value.trim();
    return trimmed.length === 0 ? undefined : trimmed;
  })
  .refine(
    (value) => value === undefined || value.length <= 2_000,
    "Notes must be at most 2000 characters",
  );

const normalizeOptionalNotesToNull = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value) => {
    if (value == null) return value;
    const trimmed = value.trim();
    return trimmed.length === 0 ? null : trimmed;
  })
  .refine(
    (value) => value == null || value.length <= 2_000,
    "Notes must be at most 2000 characters",
  );

const FromDateQuerySchema = z
  .string()
  .min(1)
  .superRefine((value, ctx) => {
    if (!ISO_DATETIME_RE.test(value) && !DATE_ONLY_RE.test(value)) {
      ctx.addIssue({
        code: "custom",
        message: "from must be an ISO datetime or a YYYY-MM-DD string",
      });
      return;
    }

    const jsDate = DATE_ONLY_RE.test(value)
      ? new Date(value + "T00:00:00.000Z")
      : new Date(value);

    if (Number.isNaN(jsDate.getTime())) {
      ctx.addIssue({
        code: "custom",
        message: "Invalid from date",
      });
    }
  })
  .transform((value) => parseDateInput(value));

const ToDateQuerySchema = z
  .string()
  .min(1)
  .superRefine((value, ctx) => {
    if (!ISO_DATETIME_RE.test(value) && !DATE_ONLY_RE.test(value)) {
      ctx.addIssue({
        code: "custom",
        message: "to must be an ISO datetime or a YYYY-MM-DD string",
      });
      return;
    }

    const jsDate = DATE_ONLY_RE.test(value)
      ? new Date(value + "T23:59:59.999Z")
      : new Date(value);

    if (Number.isNaN(jsDate.getTime())) {
      ctx.addIssue({
        code: "custom",
        message: "Invalid to date",
      });
    }
  })
  .transform((value) => {
    if (DATE_ONLY_RE.test(value)) {
      return new Date(value + "T23:59:59.999Z");
    }
    return parseDateInput(value);
  });

const SessionBaseSchema = z
  .object({
    pages: z
      .number()
      .int("Pages must be an integer")
      .min(0, "Pages cannot be negative")
      .max(10_000, "Pages is too large")
      .optional(),

    minutes: z
      .number()
      .int("Minutes must be an integer")
      .min(0, "Minutes cannot be negative")
      .max(1_440, "Minutes in a single session cannot exceed 1440 (24h)")
      .optional(),

    notes: normalizeOptionalNotesToUndefined,
    date: DateInputSchema,
  })
  .strict()
  .superRefine((data, ctx) => {
    const hasPages = typeof data.pages === "number";
    const hasMinutes = typeof data.minutes === "number";

    if (!hasPages && !hasMinutes) {
      ctx.addIssue({
        code: "custom",
        path: ["pages"],
        message: "At least one of pages or minutes must be provided",
      });
    }
  });

export const CreateSessionSchema = SessionBaseSchema.safeExtend({
  bookId: z.cuid("Invalid book id"),
}).strict();

export const UpdateSessionSchema = z
  .object({
    bookId: z.cuid("Invalid book id").optional(),
    pages: z
      .number()
      .int("Pages must be an integer")
      .min(0, "Pages cannot be negative")
      .max(10_000, "Pages is too large")
      .nullable()
      .optional(),
    minutes: z
      .number()
      .int("Minutes must be an integer")
      .min(0, "Minutes cannot be negative")
      .max(1_440, "Minutes in a single session cannot exceed 1440 (24h)")
      .nullable()
      .optional(),
    notes: normalizeOptionalNotesToNull,
    date: DateInputSchema.optional(),
  })
  .strict()
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field must be provided to update a session",
  );

export const RestoreSessionSchema = z
  .object({
    id: z.cuid("Invalid session id"),
    bookId: z.cuid("Invalid book id"),
    pages: z
      .number()
      .int("Pages must be an integer")
      .min(0, "Pages cannot be negative")
      .max(10_000, "Pages is too large")
      .nullable()
      .optional(),
    minutes: z
      .number()
      .int("Minutes must be an integer")
      .min(0, "Minutes cannot be negative")
      .max(1_440, "Minutes in a single session cannot exceed 1440 (24h)")
      .nullable()
      .optional(),
    notes: normalizeOptionalNotesToNull,
    date: DateInputSchema,
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  })
  .strict()
  .superRefine((data, ctx) => {
    const hasPages = typeof data.pages === "number";
    const hasMinutes = typeof data.minutes === "number";

    if (!hasPages && !hasMinutes) {
      ctx.addIssue({
        code: "custom",
        path: ["pages"],
        message: "At least one of pages or minutes must be provided",
      });
    }
  });

export type RestoreSessionInput = z.infer<typeof RestoreSessionSchema>;

export const SessionIdParamSchema = z
  .object({
    id: z.cuid("Invalid session id"),
  })
  .strict();

export const ListSessionsQuerySchema = z
  .object({
    bookId: z.cuid("Invalid book id").optional(),
    search: z.string().min(1).max(200).optional(),
    from: FromDateQuerySchema.optional(),
    to: ToDateQuerySchema.optional(),
    limit: z
      .string()
      .optional()
      .transform((v) =>
        v === undefined || v === "" ? undefined : Number.parseInt(v, 10),
      )
      .refine(
        (v) => v === undefined || (Number.isFinite(v) && v >= 1 && v <= 200),
        { message: "limit must be between 1 and 200" },
      ),
    offset: z
      .string()
      .optional()
      .transform((v) =>
        v === undefined || v === "" ? undefined : Number.parseInt(v, 10),
      )
      .refine((v) => v === undefined || (Number.isFinite(v) && v >= 0), {
        message: "offset must be >= 0",
      }),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.from && data.to && data.from > data.to) {
      ctx.addIssue({
        code: "custom",
        path: ["from"],
        message: "from must be less than or equal to to",
      });
    }
  });

export const SessionResponseSchema = z.object({
  id: z.string(),
  bookId: z.string(),
  pages: z.number().int().nullable(),
  minutes: z.number().int().nullable(),
  notes: z.string().nullable(),
  date: z.iso.datetime(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const SessionListResponseSchema = z.array(SessionResponseSchema);

export type CreateSessionInput = z.infer<typeof CreateSessionSchema>;
export type UpdateSessionInput = z.infer<typeof UpdateSessionSchema>;
export type SessionResponse = z.infer<typeof SessionResponseSchema>;
