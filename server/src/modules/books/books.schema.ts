import { z } from "zod";
import { BookStatus } from "@prisma/client";

export const BookStatusSchema = z.nativeEnum(BookStatus);

const BookBaseSchema = z
  .object({
    title: z
      .string()
      .min(1, "Title is required")
      .max(200, "Title must be at most 200 characters"),
    author: z
      .string()
      .min(1, "Author cannot be empty")
      .max(120, "Author must be at most 120 characters")
      .optional()
      .or(z.literal("").transform(() => undefined)),
    genre: z
      .string()
      .min(1, "Genre cannot be empty")
      .max(80, "Genre must be at most 80 characters")
      .optional()
      .or(z.literal("").transform(() => undefined)),
    status: BookStatusSchema.optional(),
    pageCount: z
      .number()
      .int()
      .positive("Page count must be a positive integer")
      .max(10_000, "Page count is too large")
      .optional(),
    currentPage: z
      .number()
      .int()
      .min(0, "Current page cannot be negative")
      .max(10_000, "Current page is too large")
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (
      typeof data.pageCount === "number" &&
      typeof data.currentPage === "number" &&
      data.currentPage > data.pageCount
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["currentPage"],
        message: "Current page cannot be greater than total page count",
      });
    }
  });

export const CreateBookSchema = BookBaseSchema.transform((data) => ({
  status: data.status ?? BookStatus.PLANNED,
  ...data,
}));

export const UpdateBookSchema = BookBaseSchema.partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field must be provided to update a book",
  )
  .superRefine((data, ctx) => {
    if (
      typeof data.pageCount === "number" &&
      typeof data.currentPage === "number" &&
      data.currentPage > data.pageCount
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["currentPage"],
        message: "Current page cannot be greater than total page count",
      });
    }
  });

export const BookIdParamSchema = z.object({
  id: z.string().cuid("Invalid book id"),
});

export const ListBooksQuerySchema = z
  .object({
    search: z.string().min(1).max(200).optional(),
    status: BookStatusSchema.optional(),

    limit: z
      .string()
      .optional()
      .transform((v) =>
        v === undefined || v === ""
          ? undefined
          : Number.parseInt(v, 10),
      )
      .refine(
        (v) => v === undefined || (Number.isFinite(v) && v >= 1 && v <= 100),
        { message: "limit must be between 1 and 100" },
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

export const BookResponseSchema = z.object({
  id: z.string().cuid(),
  title: z.string(),
  author: z.string().nullable(),
  genre: z.string().nullable(),
  status: BookStatusSchema,
  pageCount: z.number().int().nullable(),
  currentPage: z.number().int().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const BookListResponseSchema = z.array(BookResponseSchema);

export type CreateBookInput = z.infer<typeof CreateBookSchema>;
export type UpdateBookInput = z.infer<typeof UpdateBookSchema>;
export type BookResponse = z.infer<typeof BookResponseSchema>;
