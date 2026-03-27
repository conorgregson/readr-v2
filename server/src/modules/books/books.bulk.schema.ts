import { z } from "zod";

const bookStatusSchema = z.enum(["planned", "reading", "finished"]);

const nonEmptyIdsSchema = z
  .array(z.string().min(1, "Book ID is required"))
  .min(1, "At least one book ID is required");

export const bulkUpdateBooksPatchSchema = z
  .object({
    status: bookStatusSchema.optional(),
  })
  .refine(
    (patch) => Object.values(patch).some((value) => value !== undefined),
    {
      message: "At least one field must be provided to update books",
    },
  );

export const bulkUpdateBooksRequestSchema = z.object({
  ids: nonEmptyIdsSchema,
  patch: bulkUpdateBooksPatchSchema,
});

export const bulkDeleteBooksRequestSchema = z.object({
  ids: nonEmptyIdsSchema,
});

export const bulkMutationResultSchema = z.object({
  ok: z.literal(true),
  operationId: z.string().min(1, "Operation ID is required"),
  operation: z.enum(["update", "delete"]),
  affectedCount: z.number().int().nonnegative(),
  affectedIds: z.array(z.string().min(1)).min(1),
});

export type BulkUpdateBooksRequestInput = z.infer<
  typeof bulkUpdateBooksRequestSchema
>;

export type BulkDeleteBooksRequestInput = z.infer<
  typeof bulkDeleteBooksRequestSchema
>;

export type BulkMutationResultOutput = z.infer<typeof bulkMutationResultSchema>;
