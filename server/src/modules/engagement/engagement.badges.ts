import type { BadgeProgress } from "../../../../shared/types/v2.4";
import type {
  BadgeDefinition,
  BadgeMetric,
  EngagementAggregateMetrics,
} from "./engagement.types";

const BADGE_CATALOG: BadgeDefinition[] = [
  {
    key: "books-1",
    title: "First Finish",
    description: "Finish 1 book.",
    metric: "finishedBooks",
    target: 1,
    tier: "bronze",
  },
  {
    key: "books-5",
    title: "Book Builder",
    description: "Finish 5 books.",
    metric: "finishedBooks",
    target: 5,
    tier: "silver",
  },
  {
    key: "books-10",
    title: "Shelf Shaper",
    description: "Finish 10 books.",
    metric: "finishedBooks",
    target: 10,
    tier: "gold",
  },
  {
    key: "pages-500",
    title: "Page Starter",
    description: "Read 500 pages.",
    metric: "pagesRead",
    target: 500,
    tier: "bronze",
  },
  {
    key: "pages-2000",
    title: "Page Turner",
    description: "Read 2,000 pages.",
    metric: "pagesRead",
    target: 2000,
    tier: "silver",
  },
  {
    key: "pages-5000",
    title: "Page Master",
    description: "Read 5,000 pages.",
    metric: "pagesRead",
    target: 5000,
    tier: "gold",
  },
  {
    key: "streak-3",
    title: "On a Roll",
    description: "Reach a 3-day reading streak.",
    metric: "longestStreak",
    target: 3,
    tier: "bronze",
  },
  {
    key: "streak-7",
    title: "Week Warrior",
    description: "Reach a 7-day reading streak.",
    metric: "longestStreak",
    target: 7,
    tier: "silver",
  },
  {
    key: "streak-30",
    title: "Momentum Keeper",
    description: "Reach a 30-day reading streak.",
    metric: "longestStreak",
    target: 30,
    tier: "gold",
  },
  {
    key: "sessions-5",
    title: "Session Starter",
    description: "Log 5 reading sessions.",
    metric: "sessionsLogged",
    target: 5,
    tier: "bronze",
  },
  {
    key: "sessions-25",
    title: "Consistency Builder",
    description: "Log 25 reading sessions.",
    metric: "sessionsLogged",
    target: 25,
    tier: "silver",
  },
  {
    key: "sessions-100",
    title: "Reading Routine",
    description: "Log 100 reading sessions.",
    metric: "sessionsLogged",
    target: 100,
    tier: "gold",
  },
];

function getMetricValue(
  metrics: EngagementAggregateMetrics,
  metric: BadgeMetric,
  streaks: { currentStreakDays: number; longestStreakDays: number },
): number {
  switch (metric) {
    case "finishedBooks":
      return metrics.finishedBooks;
    case "pagesRead":
      return metrics.pagesRead;
    case "currentStreak":
      return streaks.currentStreakDays;
    case "longestStreak":
      return streaks.longestStreakDays;
    case "sessionsLogged":
      return metrics.sessionsLogged;
    default:
      return 0;
  }
}

export function getBadgeCatalog(): BadgeDefinition[] {
  return BADGE_CATALOG;
}

export function computeBadgeProgress(
  metrics: EngagementAggregateMetrics,
  streaks: { currentStreakDays: number; longestStreakDays: number },
): BadgeProgress[] {
  return BADGE_CATALOG.map((badge) => {
    const progress = getMetricValue(metrics, badge.metric, streaks);

    return {
      key: badge.key,
      title: badge.title,
      description: badge.description,
      tier: badge.tier,
      unlocked: progress >= badge.target,
      progress,
      target: badge.target,
    };
  });
}
