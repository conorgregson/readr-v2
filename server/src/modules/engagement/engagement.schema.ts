import { z } from "zod";

export const goalProgressSchema = z.object({
  target: z.number().int().positive(),
  progress: z.number().int().nonnegative(),
  complete: z.boolean(),
});

export const readingGoalsResponseSchema = z.object({
  yearlyBooksGoal: goalProgressSchema.optional(),
  yearlyPagesGoal: goalProgressSchema.optional(),
  monthlyBooksGoal: goalProgressSchema.optional(),
});

export const readingStreakResponseSchema = z.object({
  currentStreakDays: z.number().int().nonnegative(),
  longestStreakDays: z.number().int().nonnegative(),
  graceWindowEnabled: z.boolean(),
});

export const badgeTierSchema = z.enum(["bronze", "silver", "gold"]);

export const badgeProgressSchema = z.object({
  key: z.string().trim().min(1, "Badge key is required"),
  title: z.string().trim().min(1, "Badge title is required"),
  description: z.string().trim().min(1, "Badge description is required"),
  tier: badgeTierSchema.optional(),
  unlocked: z.boolean(),
  progress: z.number().int().nonnegative(),
  target: z.number().int().positive(),
});

export const engagementSnapshotResponseSchema = z.object({
  goals: readingGoalsResponseSchema,
  streaks: readingStreakResponseSchema,
  badges: z.array(badgeProgressSchema),
});

export type GoalProgressOutput = z.infer<typeof goalProgressSchema>;

export type ReadingGoalsResponseOutput = z.infer<
  typeof readingGoalsResponseSchema
>;

export type ReadingStreakResponseOutput = z.infer<
  typeof readingStreakResponseSchema
>;

export type BadgeTierInput = z.infer<typeof badgeTierSchema>;

export type BadgeProgressOutput = z.infer<typeof badgeProgressSchema>;

export type EngagementSnapshotResponseOutput = z.infer<
  typeof engagementSnapshotResponseSchema
>;
