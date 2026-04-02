import { z } from "zod";

export const dashboardSummaryResponseSchema = z.object({
  totals: z.object({
    books: z.number().int().nonnegative(),
    finishedBooks: z.number().int().nonnegative(),
    pagesRead: z.number().int().nonnegative(),
    sessionsLogged: z.number().int().nonnegative(),
    avgSessionMinutes: z.number().nonnegative(),
  }),
  currentPeriod: z.object({
    booksFinishedThisMonth: z.number().int().nonnegative(),
    pagesReadThisMonth: z.number().int().nonnegative(),
  }),
});

export const readingTrendMetricSchema = z.enum([
  "pages",
  "sessions",
  "booksFinished",
]);

export const timeSeriesPointSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  value: z.number().nonnegative(),
});

export const readingTrendResponseSchema = z.object({
  metric: readingTrendMetricSchema,
  points: z.array(timeSeriesPointSchema),
});

export const readingTrendQuerySchema = z.object({
  metric: readingTrendMetricSchema.default("pages"),
});

export type DashboardSummaryResponseOutput = z.infer<
  typeof dashboardSummaryResponseSchema
>;

export type ReadingTrendMetricInput = z.infer<typeof readingTrendMetricSchema>;

export type TimeSeriesPointOutput = z.infer<typeof timeSeriesPointSchema>;

export type ReadingTrendResponseOutput = z.infer<
  typeof readingTrendResponseSchema
>;
