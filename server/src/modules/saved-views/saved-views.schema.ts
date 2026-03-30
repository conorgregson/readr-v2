import { z } from "zod";
import type {
  SavedLibraryViewFilters,
  SavedLibraryViewSort,
} from "../../../../shared/types/v2.4";

export const BookStatusSchema = z.enum(["planned", "reading", "finished"]);
export const SortDirectionSchema = z.enum(["asc", "desc"]);
export const LibrarySortKeySchema = z.enum([
  "title",
  "author",
  "createdAt",
  "updatedAt",
  "finishedAt",
]);

const trimmedNonEmptyString = (field: string, max: number) =>
  z
    .string()
    .trim()
    .min(1, `${field} is required`)
    .max(max, `${field} must be at most ${max} characters`);

const optionalTrimmedStringArray = (field: string, max: number) =>
  z
    .array(
      z
        .string()
        .trim()
        .min(1, `${field} value is required`)
        .max(max, `${field} value must be at most ${max} characters`),
    )
    .optional();

const plannedMonthSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "tbrMonth must be in YYYY-MM format")
  .optional();

export const SavedLibraryViewFiltersSchema: z.ZodType<SavedLibraryViewFilters> =
  z
    .object({
      status: z.array(BookStatusSchema).optional(),
      authors: optionalTrimmedStringArray("Author", 120),
      genres: optionalTrimmedStringArray("Genre", 80),
      series: optionalTrimmedStringArray("Series", 120),
      tbrOnly: z.boolean().optional(),
      tbrMonth: plannedMonthSchema,
      search: z.string().trim().max(200).optional(),
    })
    .strict();

export const SavedLibraryViewSortSchema: z.ZodType<SavedLibraryViewSort> =
  z.object({
    key: LibrarySortKeySchema,
    direction: SortDirectionSchema,
  });

export const CreateSavedViewSchema = z.object({
  name: trimmedNonEmptyString("Name", 80),
  filters: SavedLibraryViewFiltersSchema,
  sort: SavedLibraryViewSortSchema,
  isPinned: z.boolean().optional(),
  isDefault: z.boolean().optional(),
});

export const UpdateSavedViewSchema = z
  .object({
    name: trimmedNonEmptyString("Name", 80).optional(),
    filters: SavedLibraryViewFiltersSchema.optional(),
    sort: SavedLibraryViewSortSchema.optional(),
    isPinned: z.boolean().optional(),
    isDefault: z.boolean().optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided to update a saved view",
  });

export const SavedViewIdParamSchema = z
  .object({
    id: z.cuid("Invalid saved view id"),
  })
  .strict();

export const SavedViewResponseSchema = z.object({
  id: z.cuid(),
  name: z.string(),
  filters: SavedLibraryViewFiltersSchema,
  sort: SavedLibraryViewSortSchema,
  isPinned: z.boolean(),
  isDefault: z.boolean(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const SavedViewsResponseSchema = z.object({
  items: z.array(SavedViewResponseSchema),
});

export type CreateSavedViewInput = z.infer<typeof CreateSavedViewSchema>;
export type UpdateSavedViewInput = z.infer<typeof UpdateSavedViewSchema>;
export type SavedViewResponse = z.infer<typeof SavedViewResponseSchema>;
export type SavedViewsResponse = z.infer<typeof SavedViewsResponseSchema>;
