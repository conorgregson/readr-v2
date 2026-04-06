import type { BadgeTier } from "../../../../shared/types/v2.4";

export type GoalTargets = {
  yearlyBooksTarget?: number;
  yearlyPagesTarget?: number;
  monthlyBooksTarget?: number;
};

export type StreakComputationInput = {
  readingDates: string[];
  graceWindowEnabled: boolean;
  today?: string;
};

export type GoalComputationInput = {
  yearlyBooksTarget?: number;
  yearlyPagesTarget?: number;
  monthlyBooksTarget?: number;
  finishedBooksThisYear: number;
  pagesReadThisYear: number;
  finishedBooksThisMonth: number;
};

export type BadgeMetric =
  | "finishedBooks"
  | "pagesRead"
  | "currentStreak"
  | "longestStreak"
  | "sessionsLogged";

export type BadgeDefinition = {
  key: string;
  title: string;
  description: string;
  metric: BadgeMetric;
  target: number;
  tier?: BadgeTier;
};

export type EngagementAggregateMetrics = {
  finishedBooks: number;
  finishedBooksThisYear: number;
  finishedBooksThisMonth: number;
  pagesRead: number;
  pagesReadThisYear: number;
  sessionsLogged: number;
  readingDates: string[];
};

export type EngagementSnapshotDependencies = {
  metrics: EngagementAggregateMetrics;
  goals?: GoalTargets;
  graceWindowEnabled?: boolean;
};
