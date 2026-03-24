import { z } from "zod";
import {
  BookStatus,
  SeriesType,
  FormatParent,
  FormatSubtype,
} from "@prisma/client";

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

const ImportDateSchema = z
  .string()
  .min(1, "Date is required")
  .superRefine((value, ctx) => {
    if (!ISO_DATETIME_RE.test(value) && !DATE_ONLY_RE.test(value)) {
      ctx.addIssue({
        code: "custom",
        message: "Date must be an ISO datetime or a YYYY-MM-DD string",
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
  .transform((value) => parseDateInput(value));

const optionalTrimmedNullableString = (field: string, max: number) =>
  z
    .union([z.string(), z.null(), z.undefined()])
    .transform((value) => {
      if (value == null) return undefined;
      const trimmed = value.trim();
      return trimmed.length === 0 ? undefined : trimmed;
    })
    .refine(
      (value) => value === undefined || value.length <= max,
      `${field} must be at most ${max} characters`,
    );

const isbnSchema = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value) => {
    if (value == null) return undefined;
    const normalized = value.replace(/[-\s]/g, "").trim();
    return normalized.length === 0 ? undefined : normalized;
  })
  .refine(
    (value) => value === undefined || value.length <= 32,
    "ISBN must be at most 32 characters",
  );

const plannedMonthSchema = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value) => {
    if (value == null) return undefined;
    const trimmed = value.trim();
    return trimmed.length === 0 ? undefined : trimmed;
  })
  .refine(
    (value) => value === undefined || /^\d{4}-(0[1-9]|1[0-2])$/.test(value),
    "plannedMonth must be in YYYY-MM format",
  );

export const ImportBackupBookSchema = z
  .object({
    id: z
      .string()
      .min(1, "Book id is required")
      .max(128, "Book id is too long"),
    title: z.string().trim().min(1, "Title is required").max(200),
    author: z.string().trim().min(1, "Author is required").max(120),
    status: z.enum(BookStatus).optional().default(BookStatus.planned),
    genre: optionalTrimmedNullableString("Genre", 80),
    series: optionalTrimmedNullableString("Series", 120),
    seriesType: z.enum(SeriesType).nullable().optional(),
    format: z.enum(FormatParent).nullable().optional(),
    formatSubtype: z.enum(FormatSubtype).nullable().optional(),
    isbn: isbnSchema,
    plannedMonth: plannedMonthSchema,
    startedAt: z.iso.datetime().nullable().optional(),
    finishedAt: z.iso.datetime().nullable().optional(),
    createdAt: z.iso.datetime().optional(),
    updatedAt: z.iso.datetime().optional(),
  })
  .strict();

export const ImportBackupSessionSchema = z
  .object({
    id: z
      .string()
      .min(1, "Session id is required")
      .max(128, "Session id is too long")
      .optional(),
    bookId: z.string().min(1, "Session bookId is required").max(128),
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
    notes: z
      .union([z.string(), z.null(), z.undefined()])
      .transform((value) => {
        if (value == null) return undefined;
        const trimmed = value.trim();
        return trimmed.length === 0 ? undefined : trimmed;
      })
      .refine(
        (value) => value === undefined || value.length <= 2_000,
        "Notes must be at most 2000 characters",
      ),
    date: ImportDateSchema,
    createdAt: z.iso.datetime().optional(),
    updatedAt: z.iso.datetime().optional(),
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

export const ImportBackupSchema = z
  .object({
    version: z.string().trim().min(1, "version is required").max(32),
    exportedAt: z.iso.datetime().optional(),
    books: z
      .array(ImportBackupBookSchema)
      .max(5_000, "Too many books in import"),
    sessions: z
      .array(ImportBackupSessionSchema)
      .max(20_000, "Too many sessions in import"),
  })
  .strict()
  .superRefine((data, ctx) => {
    const seenBookIds = new Set<string>();
    const seenSessionIds = new Set<string>();

    for (const [index, book] of data.books.entries()) {
      if (seenBookIds.has(book.id)) {
        ctx.addIssue({
          code: "custom",
          path: ["books", index, "id"],
          message: `Duplicate imported book id: ${book.id}`,
        });
      }
      seenBookIds.add(book.id);
    }

    for (const [index, session] of data.sessions.entries()) {
      if (session.id) {
        if (seenSessionIds.has(session.id)) {
          ctx.addIssue({
            code: "custom",
            path: ["sessions", index, "id"],
            message: `Duplicate imported session id: ${session.id}`,
          });
        }
        seenSessionIds.add(session.id);
      }

      if (!seenBookIds.has(session.bookId)) {
        ctx.addIssue({
          code: "custom",
          path: ["sessions", index, "bookId"],
          message: `Session references unknown imported book id: ${session.bookId}`,
        });
      }
    }
  });

export const BackupBookResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  author: z.string(),
  status: z.enum(BookStatus),
  genre: z.string().nullable(),
  series: z.string().nullable(),
  seriesType: z.enum(SeriesType).nullable(),
  format: z.enum(FormatParent).nullable(),
  formatSubtype: z.enum(FormatSubtype).nullable(),
  isbn: z.string().nullable(),
  plannedMonth: z.string().nullable(),
  startedAt: z.iso.datetime().nullable(),
  finishedAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const BackupSessionResponseSchema = z.object({
  id: z.string(),
  bookId: z.string(),
  pages: z.number().int().nullable(),
  minutes: z.number().int().nullable(),
  notes: z.string().nullable(),
  date: z.iso.datetime(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const BackupExportResponseSchema = z.object({
  version: z.string(),
  exportedAt: z.iso.datetime(),
  books: z.array(BackupBookResponseSchema),
  sessions: z.array(BackupSessionResponseSchema),
});

export const BackupImportResponseSchema = z.object({
  importedBooks: z.number().int().nonnegative(),
  importedSessions: z.number().int().nonnegative(),
});

export type ImportBackupInput = z.infer<typeof ImportBackupSchema>;
export type BackupExportResponse = z.infer<typeof BackupExportResponseSchema>;
export type BackupImportResponse = z.infer<typeof BackupImportResponseSchema>;
