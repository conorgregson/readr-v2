import { BookStatus } from "@prisma/client";
import { prisma } from "../../db/client";
import type { EngagementSnapshotResponse } from "../../../../shared/types/v2.4";
import { engagementSnapshotResponseSchema } from "./engagement.schema";
import type {
  EngagementAggregateMetrics,
  EngagementSnapshotDependencies,
  GoalTargets,
} from "./engagement.types";
import { computeReadingGoals } from "./engagement.goals";
import { computeReadingStreaks } from "./engagement.streaks";
import { computeBadgeProgress } from "./engagement.badges";

function startOfUtcYear(date = new Date()) {
  return new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
}

function startOfUtcMonth(date = new Date()) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function startOfTomorrowUtcDay(date = new Date()) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1),
  );
}

function toYyyyMmDd(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function normalizeReadingDates(dates: string[]): string[] {
  return [...new Set(dates)].sort();
}

function getDefaultGoalTargets(): GoalTargets {
  return {
    yearlyBooksTarget: 12,
    yearlyPagesTarget: 5000,
    monthlyBooksTarget: 2,
  };
}

function getGraceWindowEnabled(): boolean {
  return false;
}

async function getEngagementAggregateMetrics(
  userId: string,
): Promise<EngagementAggregateMetrics> {
  const now = new Date();
  const yearStart = startOfUtcYear(now);
  const monthStart = startOfUtcMonth(now);
  const currentPeriodEnd = startOfTomorrowUtcDay(now);

  const [
    finishedBooks,
    finishedBooksThisYear,
    finishedBooksThisMonth,
    pagesAgg,
    pagesThisYearAgg,
    sessionsLogged,
    sessions,
  ] = await Promise.all([
    prisma.book.count({
      where: {
        userId,
        status: BookStatus.finished,
      },
    }),
    prisma.book.count({
      where: {
        userId,
        status: BookStatus.finished,
        finishedAt: {
          gte: yearStart,
          lt: currentPeriodEnd,
        },
      },
    }),
    prisma.book.count({
      where: {
        userId,
        status: BookStatus.finished,
        finishedAt: {
          gte: monthStart,
          lt: currentPeriodEnd,
        },
      },
    }),
    prisma.session.aggregate({
      where: { userId },
      _sum: { pages: true },
    }),
    prisma.session.aggregate({
      where: {
        userId,
        date: {
          gte: yearStart,
          lt: currentPeriodEnd,
        },
      },
      _sum: { pages: true },
    }),
    prisma.session.count({
      where: { userId },
    }),
    prisma.session.findMany({
      where: { userId },
      select: { date: true },
      orderBy: { date: "asc" },
    }),
  ]);

  return {
    finishedBooks,
    finishedBooksThisYear,
    finishedBooksThisMonth,
    pagesRead: pagesAgg._sum.pages ?? 0,
    pagesReadThisYear: pagesThisYearAgg._sum.pages ?? 0,
    sessionsLogged,
    readingDates: normalizeReadingDates(
      sessions.map((session) => toYyyyMmDd(session.date)),
    ),
  };
}

function buildEngagementSnapshot(
  input: EngagementSnapshotDependencies,
): EngagementSnapshotResponse {
  const streaks = computeReadingStreaks({
    readingDates: input.metrics.readingDates,
    graceWindowEnabled: input.graceWindowEnabled ?? false,
  });

  const goals = computeReadingGoals({
    yearlyBooksTarget: input.goals?.yearlyBooksTarget,
    yearlyPagesTarget: input.goals?.yearlyPagesTarget,
    monthlyBooksTarget: input.goals?.monthlyBooksTarget,
    finishedBooksThisYear: input.metrics.finishedBooksThisYear,
    pagesReadThisYear: input.metrics.pagesReadThisYear,
    finishedBooksThisMonth: input.metrics.finishedBooksThisMonth,
  });

  const badges = computeBadgeProgress(input.metrics, streaks);

  return {
    goals,
    streaks,
    badges,
  };
}

export async function getEngagementSnapshot(
  userId: string,
): Promise<EngagementSnapshotResponse> {
  const metrics = await getEngagementAggregateMetrics(userId);

  const response = buildEngagementSnapshot({
    metrics,
    goals: getDefaultGoalTargets(),
    graceWindowEnabled: getGraceWindowEnabled(),
  });

  return engagementSnapshotResponseSchema.parse(response);
}
