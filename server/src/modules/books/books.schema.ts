import { z } from "zod";
import {
  BookStatus,
  SeriesType,
  FormatParent,
  FormatSubtype,
} from "@prisma/client";

export const BookStatusSchema = z.enum(BookStatus);
export const SeriesTypeSchema = z.enum(SeriesType);
export const FormatParentSchema = z.enum(FormatParent);
export const FormatSubtypeSchema = z.enum(FormatSubtype);

const trimmedRequiredString = (field: string, max: number) =>
  z
    .string()
    .trim()
    .min(1, `${field} is required`)
    .max(max, `${field} must be at most ${max} characters`);

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

const BookCreateBaseSchema = z
  .object({
    title: trimmedRequiredString("Title", 200),
    author: trimmedRequiredString("Author", 120),
    status: BookStatusSchema.optional().default(BookStatus.planned),
    genre: optionalTrimmedNullableString("Genre", 80),
    series: optionalTrimmedNullableString("Series", 120),
    seriesType: SeriesTypeSchema.optional(),
    format: FormatParentSchema.optional(),
    formatSubtype: FormatSubtypeSchema.optional(),
    isbn: isbnSchema,
    plannedMonth: plannedMonthSchema,
  })
  .strict();

export const CreateBookSchema = BookCreateBaseSchema.superRefine(
  (data, ctx) => {
    if (data.formatSubtype) {
      const isDigitalSubtype =
        data.formatSubtype === FormatSubtype.ebook ||
        data.formatSubtype === FormatSubtype.Audiobook ||
        data.formatSubtype === FormatSubtype.PDF;

      const isPhysicalSubtype =
        data.formatSubtype === FormatSubtype.Hardcover ||
        data.formatSubtype === FormatSubtype.Paperback;

      if (data.format === FormatParent.digital && isPhysicalSubtype) {
        ctx.addIssue({
          code: "custom",
          path: ["formatSubtype"],
          message: "formatSubtype does not match format=digital",
        });
      }

      if (data.format === FormatParent.physical && isDigitalSubtype) {
        ctx.addIssue({
          code: "custom",
          path: ["formatSubtype"],
          message: "formatSubtype does not match format=physical",
        });
      }
    }
  },
);

export const UpdateBookSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    author: z.string().trim().min(1).max(120).optional(),
    status: BookStatusSchema.optional(),
    genre: optionalTrimmedNullableString("Genre", 80),
    series: optionalTrimmedNullableString("Series", 120),
    seriesType: SeriesTypeSchema.nullable().optional(),
    format: FormatParentSchema.nullable().optional(),
    formatSubtype: FormatSubtypeSchema.nullable().optional(),
    isbn: isbnSchema,
    plannedMonth: plannedMonthSchema,
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided to update a book",
  })
  .superRefine((data, ctx) => {
    if (data.formatSubtype) {
      const isDigitalSubtype =
        data.formatSubtype === FormatSubtype.ebook ||
        data.formatSubtype === FormatSubtype.Audiobook ||
        data.formatSubtype === FormatSubtype.PDF;

      const isPhysicalSubtype =
        data.formatSubtype === FormatSubtype.Hardcover ||
        data.formatSubtype === FormatSubtype.Paperback;

      if (data.format === FormatParent.digital && isPhysicalSubtype) {
        ctx.addIssue({
          code: "custom",
          path: ["formatSubtype"],
          message: "formatSubtype does not match format=digital",
        });
      }

      if (data.format === FormatParent.physical && isDigitalSubtype) {
        ctx.addIssue({
          code: "custom",
          path: ["formatSubtype"],
          message: "formatSubtype does not match format=physical",
        });
      }
    }
  });

export const BookIdParamSchema = z
  .object({
    id: z.cuid("Invalid book id"),
  })
  .strict();

export const ListBooksQuerySchema = z
  .object({
    search: z.string().trim().min(1).max(200).optional(),
    status: BookStatusSchema.optional(),
    limit: z
      .string()
      .optional()
      .transform((value) =>
        value === undefined || value === ""
          ? undefined
          : Number.parseInt(value, 10),
      )
      .refine(
        (value) =>
          value === undefined ||
          (Number.isInteger(value) && value >= 1 && value <= 100),
        { message: "limit must be between 1 and 100" },
      ),
    offset: z
      .string()
      .optional()
      .transform((value) =>
        value === undefined || value === ""
          ? undefined
          : Number.parseInt(value, 10),
      )
      .refine(
        (value) =>
          value === undefined || (Number.isInteger(value) && value >= 0),
        { message: "offset must be >= 0" },
      ),
  })
  .strict();

export const BookResponseSchema = z.object({
  id: z.cuid(),
  title: z.string(),
  author: z.string(),
  status: BookStatusSchema,
  genre: z.string().nullable(),
  series: z.string().nullable(),
  seriesType: SeriesTypeSchema.nullable(),
  format: FormatParentSchema.nullable(),
  formatSubtype: FormatSubtypeSchema.nullable(),
  isbn: z.string().nullable(),
  plannedMonth: z.string().nullable(),
  startedAt: z.iso.datetime().nullable(),
  finishedAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const BookListResponseSchema = z.array(BookResponseSchema);

export type CreateBookInput = z.infer<typeof CreateBookSchema>;
export type UpdateBookInput = z.infer<typeof UpdateBookSchema>;
export type BookResponse = z.infer<typeof BookResponseSchema>;
