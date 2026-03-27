import { z } from "zod";

const bookStatusSchema = z.enum(["planned", "reading", "finished"]);

const sortDirectionSchema = z.enum(["asc", "desc"]);

const librarySortKeySchema = z.enum([
  "title",
  "author",
  "createdAt",
  "updatedAt",
  "finishedAt",
]);

export const savedLibraryViewFiltersSchema = z.object({
  status: z.array(bookStatusSchema).min(1).optional(),
  favorite: z.boolean().optional(),
  search: z.string().trim().min(1).optional(),
});

export const savedLibraryViewSortSchema = z.object({
  key: librarySortKeySchema,
  direction: sortDirectionSchema,
});

export const savedLibraryViewSchema = z.object({
  id: z.string().min(1, "View ID is required"),
  name: z.string().trim().min(1, "View name is required"),
  filters: savedLibraryViewFiltersSchema,
  sort: savedLibraryViewSortSchema,
  isPinned: z.boolean(),
  isDefault: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const createSavedViewRequestSchema = z.object({
  name: z.string().trim().min(1, "View name is required"),
  filters: savedLibraryViewFiltersSchema,
  sort: savedLibraryViewSortSchema,
  isPinned: z.boolean().optional(),
  isDefault: z.boolean().optional(),
});

export const updateSavedViewRequestSchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    filters: savedLibraryViewFiltersSchema.optional(),
    sort: savedLibraryViewSortSchema.optional(),
    isPinned: z.boolean().optional(),
    isDefault: z.boolean().optional(),
  })
  .refine(
    (input) => Object.values(input).some((value) => value !== undefined),
    {
      message: "At least one field must be provided to update a saved view",
    },
  );

export const savedViewsResponseSchema = z.object({
  items: z.array(savedLibraryViewSchema),
});

export type SavedLibraryViewFiltersInput = z.infer<
  typeof savedLibraryViewFiltersSchema
>;

export type SavedLibraryViewSortInput = z.infer<
  typeof savedLibraryViewSortSchema
>;

export type SavedLibraryViewInput = z.infer<typeof savedLibraryViewSchema>;

export type CreateSavedViewRequestInput = z.infer<
  typeof createSavedViewRequestSchema
>;

export type UpdateSavedViewRequestInput = z.infer<
  typeof updateSavedViewRequestSchema
>;

export type SavedViewsResponseOutput = z.infer<typeof savedViewsResponseSchema>;
