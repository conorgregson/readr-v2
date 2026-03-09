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

const MonthSchema = z
  .string()
  .regex(/^\d{4}-\d{2}$/, "plannedMonth must be in YYYY-MM format");

const BookBaseSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be at most 200 characters"),

  author: z
    .string()
    .min(1, "Author is required")
    .max(120, "Author must be at most 120 characters"),

  genre: z
    .string()
    .min(1, "Genre cannot be empty")
    .max(80, "Genre must be at most 80 characters")
    .optional()
    .or(z.literal("").transform(() => undefined)),

  series: z
    .string()
    .min(1, "Series cannot be empty")
    .max(120, "Series must be at most 120 characters")
    .optional()
    .or(z.literal("").transform(() => undefined)),

  seriesType: SeriesTypeSchema.optional(),

  format: FormatParentSchema.optional(),

  formatSubtype: FormatSubtypeSchema.optional(),

  isbn: z
    .string()
    .min(1, "ISBN cannot be empty")
    .max(32, "ISBN must be at most 32 characters")
    .optional()
    .or(z.literal("").transform(() => undefined)),

  plannedMonth: MonthSchema.optional().or(
    z.literal("").transform(() => undefined),
  ),

  status: BookStatusSchema.optional(),
});

export const CreateBookSchema = BookBaseSchema.transform((data) => ({
  ...data,
  status: data.status ?? BookStatus.planned,
}));

export const UpdateBookSchema = BookBaseSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  "At least one field must be provided to update a book",
);

export const BookIdParamSchema = z.object({
  id: z.cuid("Invalid book id"),
});

export const ListBooksQuerySchema = z
  .object({
    search: z.string().min(1).max(200).optional(),
    status: BookStatusSchema.optional(),

    limit: z
      .string()
      .optional()
      .transform((v) =>
        v === undefined || v === "" ? undefined : Number.parseInt(v, 10),
      )
      .refine(
        (v) => v === undefined || (Number.isFinite(v) && v >= 1 && v <= 100),
        { message: "limit must be between 1 and 100" },
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
  .partial();

export const BookResponseSchema = z.object({
  id: z.cuid(),
  title: z.string(),
  author: z.string(),
  genre: z.string().nullable(),
  series: z.string().nullable(),
  seriesType: SeriesTypeSchema.nullable(),
  format: FormatParentSchema.nullable(),
  formatSubtype: FormatSubtypeSchema.nullable(),
  isbn: z.string().nullable(),
  plannedMonth: z.string().nullable(),
  status: BookStatusSchema,
  startedAt: z.iso.datetime().nullable(),
  finishedAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const BookListResponseSchema = z.array(BookResponseSchema);

export type CreateBookInput = z.infer<typeof CreateBookSchema>;
export type UpdateBookInput = z.infer<typeof UpdateBookSchema>;
export type BookResponse = z.infer<typeof BookResponseSchema>;
