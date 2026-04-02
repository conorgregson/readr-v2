import { BookStatus } from "@prisma/client";
import { prisma } from "../../db/client";
import type {
  DashboardSummaryResponse,
  ReadingTrendMetric,
  ReadingTrendResponse,
} from "./stats.types";

function startOfUtcMonth(date = new Date()) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function startOfUtcDay(date = new Date()) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

function startOfTomorrowUtcDay(date = new Date()) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1),
  );
}

function toYyyyMmDd(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addUtcDays(date: Date, days: number) {
  const out = new Date(date);
  out.setUTCDate(out.getUTCDate() + days);
  return out;
}

function eachUtcDay(start: Date, days: number): string[] {
  return Array.from({ length: days }, (_, i) => {
    const d = addUtcDays(start, i);
    return toYyyyMmDd(d);
  });
}

async function getLatestSessionDate(userId: string): Promise<Date | null> {
  const latest = await prisma.session.findFirst({
    where: { userId },
    orderBy: { date: "desc" },
    select: { date: true },
  });

  return latest?.date ? startOfUtcDay(latest.date) : null;
}

async function getLatestFinishedBookDate(userId: string): Promise<Date | null> {
  const latest = await prisma.book.findFirst({
    where: {
      userId,
      status: BookStatus.finished,
      finishedAt: { not: null },
    },
    orderBy: { finishedAt: "desc" },
    select: { finishedAt: true },
  });

  return latest?.finishedAt ? startOfUtcDay(latest.finishedAt) : null;
}

async function getTrendAnchorDate(
  userId: string,
  metric: ReadingTrendMetric,
): Promise<Date> {
  if (metric === "booksFinished") {
    return (
      (await getLatestFinishedBookDate(userId)) ?? startOfUtcDay(new Date())
    );
  }

  return (await getLatestSessionDate(userId)) ?? startOfUtcDay(new Date());
}

export async function getDashboardSummary(
  userId: string,
): Promise<DashboardSummaryResponse> {
  const now = new Date();
  const monthStart = startOfUtcMonth(now);
  const currentPeriodEnd = startOfTomorrowUtcDay(now);

  const [
    books,
    finishedBooks,
    sessionsLogged,
    pagesAgg,
    minutesAgg,
    booksFinishedThisMonth,
    pagesThisMonthAgg,
  ] = await Promise.all([
    prisma.book.count({
      where: { userId },
    }),
    prisma.book.count({
      where: {
        userId,
        status: BookStatus.finished,
      },
    }),
    prisma.session.count({
      where: { userId },
    }),
    prisma.session.aggregate({
      where: { userId },
      _sum: { pages: true },
    }),
    prisma.session.aggregate({
      where: { userId },
      _avg: { minutes: true },
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
      where: {
        userId,
        date: {
          gte: monthStart,
          lt: currentPeriodEnd,
        },
      },
      _sum: { pages: true },
    }),
  ]);

  return {
    totals: {
      books,
      finishedBooks,
      pagesRead: pagesAgg._sum.pages ?? 0,
      sessionsLogged,
      avgSessionMinutes: minutesAgg._avg.minutes ?? 0,
    },
    currentPeriod: {
      booksFinishedThisMonth,
      pagesReadThisMonth: pagesThisMonthAgg._sum.pages ?? 0,
    },
  };
}

export async function getReadingTrend(
  userId: string,
  metric: ReadingTrendMetric,
): Promise<ReadingTrendResponse> {
  const anchor = await getTrendAnchorDate(userId, metric);
  const start = addUtcDays(anchor, -29);
  const end = addUtcDays(anchor, 1);

  const labels = eachUtcDay(start, 30);
  const buckets = new Map<string, number>(labels.map((date) => [date, 0]));

  switch (metric) {
    case "pages": {
      const sessions = await prisma.session.findMany({
        where: {
          userId,
          date: {
            gte: start,
            lt: end,
          },
        },
        select: {
          date: true,
          pages: true,
        },
        orderBy: { date: "asc" },
      });

      for (const session of sessions) {
        const key = toYyyyMmDd(session.date);
        if (!buckets.has(key)) continue;
        buckets.set(key, (buckets.get(key) ?? 0) + (session.pages ?? 0));
      }

      break;
    }

    case "sessions": {
      const sessions = await prisma.session.findMany({
        where: {
          userId,
          date: {
            gte: start,
            lt: end,
          },
        },
        select: {
          date: true,
        },
        orderBy: { date: "asc" },
      });

      for (const session of sessions) {
        const key = toYyyyMmDd(session.date);
        if (!buckets.has(key)) continue;
        buckets.set(key, (buckets.get(key) ?? 0) + 1);
      }

      break;
    }

    case "booksFinished": {
      const books = await prisma.book.findMany({
        where: {
          userId,
          status: BookStatus.finished,
          finishedAt: {
            not: null,
            gte: start,
            lt: end,
          },
        },
        select: {
          finishedAt: true,
        },
        orderBy: { finishedAt: "asc" },
      });

      for (const book of books) {
        if (!book.finishedAt) continue;
        const key = toYyyyMmDd(book.finishedAt);
        if (!buckets.has(key)) continue;
        buckets.set(key, (buckets.get(key) ?? 0) + 1);
      }

      break;
    }
  }

  return {
    metric,
    points: labels.map((date) => ({
      date,
      value: buckets.get(date) ?? 0,
    })),
  };
}
