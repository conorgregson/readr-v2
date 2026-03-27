export type GoalProgress = {
  target: number;
  progress: number;
  complete: boolean;
};

export type ReadingGoalsResponse = {
  yearlyBooksGoal?: GoalProgress;
  yearlyPagesGoal?: GoalProgress;
  monthlyBooksGoal?: GoalProgress;
};

export type ReadingStreakResponse = {
  currentStreakDays: number;
  longestStreakDays: number;
  graceWindowEnabled: boolean;
};

export type BadgeTier = "bronze" | "silver" | "gold";

export type BadgeProgress = {
  key: string;
  title: string;
  description: string;
  tier?: BadgeTier;
  unlocked: boolean;
  progress: number;
  target: number;
};

export type EngagementSnapshotResponse = {
  goals: ReadingGoalsResponse;
  streaks: ReadingStreakResponse;
  badges: BadgeProgress[];
};
