import { z } from "zod";

const DateInputSchema = z
  .string()
  .min(1, "Date is required")
  .superRefine((value: string, ctx) => {
    const isoMatch =
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;
    const dateOnlyMatch = /^\d{4}-\d{2}-\d{2}$/;

    if (!isoMatch.test(value) && !dateOnlyMatch.test(value)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Date must be an ISO datetime or a YYYY-MM-DD string (e.g., 2025-12-11 or 2025-12-11T10:00:00Z)",
      });
    }
  })
  .transform((value: string) => {
    const dateOnlyMatch = /^\d{4}-\d{2}-\d{2}$/;
    const jsDate = dateOnlyMatch.test(value)
      ? new Date(value + "T00:00:00.000Z")
      : new Date(value);

    if (Number.isNaN(jsDate.getTime())) {
      throw new Error("Invalid date");
    }
    return jsDate;
  });

const SessionBaseSchema = z.object({
  minutes: z
    .number()
    .int("Minutes must be an integer")
    .positive("Minutes must be greater than 0")
    .max(1_440, "Minutes in a single session cannot exceed 1440 (24h)"),
  notes: z
    .string()
    .max(2_000, "Notes must be at most 2000 characters")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  date: DateInputSchema,
});

export const CreateSessionSchema = SessionBaseSchema.extend({
  bookId: z.string().cuid("Invalid book id"),
});

export const UpdateSessionSchema = SessionBaseSchema.partial()
  .extend({
    bookId: z.string().cuid("Invalid book id").optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field must be provided to update a session",
  );

export const SessionIdParamSchema = z.object({
  id: z.string().cuid("Invalid session id"),
});

export const ListSessionsQuerySchema = z
  .object({
    bookId: z.string().cuid("Invalid book id").optional(),
    search: z.string().min(1).max(200).optional(),
    from: z
      .string()
      .min(1)
      .optional()
      .transform((value: string | undefined) =>
        value ? DateInputSchema.parse(value) : undefined,
      ),
    to: z
      .string()
      .min(1)
      .optional()
      .transform((value: string | undefined) =>
        value ? DateInputSchema.parse(value) : undefined,
      ),

    limit: z
      .string()
      .optional()
      .transform((v) =>
        v === undefined || v === ""
          ? undefined
          : Number.parseInt(v, 10),
      )
      .refine(
        (v) => v === undefined || (Number.isFinite(v) && v >= 1 && v <= 200),
        { message: "limit must be between 1 and 200" },
      ),

    offset: z
      .string()
      .optional()
      .transform((v) =>
        v === undefined || v === ""
          ? undefined
          : Number.parseInt(v, 10),
      )
      .refine(
        (v) => v === undefined || (Number.isFinite(v) && v >= 0),
        { message: "offset must be >= 0" },
      ),
  })
  .partial();

export const SessionResponseSchema = z.object({
  id: z.string().cuid(),
  bookId: z.string().cuid(),
  minutes: z.number().int(),
  notes: z.string().nullable(),
  date: z.string().datetime(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const SessionListResponseSchema = z.array(SessionResponseSchema);

export type CreateSessionInput = z.infer<typeof CreateSessionSchema>;
export type UpdateSessionInput = z.infer<typeof UpdateSessionSchema>;
export type SessionResponse = z.infer<typeof SessionResponseSchema>;
