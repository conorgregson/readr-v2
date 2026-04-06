import { describe, expect, it } from "vitest";
import {
  computeBadgeProgress,
  getBadgeCatalog,
} from "../../modules/engagement/engagement.badges";

describe("engagement.badges", () => {
  it("exposes a stable badge catalog", () => {
    const catalog = getBadgeCatalog();
    expect(catalog.length).toBeGreaterThan(0);
    expect(catalog.some((badge) => badge.key === "books-1")).toBe(true);
    expect(catalog.some((badge) => badge.key === "streak-3")).toBe(true);
  });

  it("unlocks the first finished book badge at exactly 1 finished book", () => {
    const badges = computeBadgeProgress(
      {
        finishedBooks: 1,
        finishedBooksThisYear: 1,
        finishedBooksThisMonth: 1,
        pagesRead: 0,
        pagesReadThisYear: 0,
        sessionsLogged: 0,
        readingDates: [],
      },
      {
        currentStreakDays: 0,
        longestStreakDays: 0,
      },
    );

    const badge = badges.find((b) => b.key === "books-1");
    expect(badge).toMatchObject({
      unlocked: true,
      progress: 1,
      target: 1,
    });
  });

  it("does not unlock the 500-page badge at 499 pages", () => {
    const badges = computeBadgeProgress(
      {
        finishedBooks: 0,
        finishedBooksThisYear: 0,
        finishedBooksThisMonth: 0,
        pagesRead: 499,
        pagesReadThisYear: 499,
        sessionsLogged: 0,
        readingDates: [],
      },
      {
        currentStreakDays: 0,
        longestStreakDays: 0,
      },
    );

    const badge = badges.find((b) => b.key === "pages-500");
    expect(badge).toMatchObject({
      unlocked: false,
      progress: 499,
      target: 500,
    });
  });

  it("unlocks the 500-page badge at exactly 500 pages", () => {
    const badges = computeBadgeProgress(
      {
        finishedBooks: 0,
        finishedBooksThisYear: 0,
        finishedBooksThisMonth: 0,
        pagesRead: 500,
        pagesReadThisYear: 500,
        sessionsLogged: 0,
        readingDates: [],
      },
      {
        currentStreakDays: 0,
        longestStreakDays: 0,
      },
    );

    const badge = badges.find((b) => b.key === "pages-500");
    expect(badge).toMatchObject({
      unlocked: true,
      progress: 500,
      target: 500,
    });
  });

  it("uses longest streak for streak badges instead of current streak", () => {
    const badges = computeBadgeProgress(
      {
        finishedBooks: 0,
        finishedBooksThisYear: 0,
        finishedBooksThisMonth: 0,
        pagesRead: 0,
        pagesReadThisYear: 0,
        sessionsLogged: 0,
        readingDates: [],
      },
      {
        currentStreakDays: 0,
        longestStreakDays: 3,
      },
    );

    const streak3 = badges.find((b) => b.key === "streak-3");
    const streak7 = badges.find((b) => b.key === "streak-7");

    expect(streak3).toMatchObject({
      unlocked: true,
      progress: 3,
      target: 3,
    });

    expect(streak7).toMatchObject({
      unlocked: false,
      progress: 3,
      target: 7,
    });
  });

  it("tracks session badges from total sessions logged", () => {
    const badges = computeBadgeProgress(
      {
        finishedBooks: 0,
        finishedBooksThisYear: 0,
        finishedBooksThisMonth: 0,
        pagesRead: 0,
        pagesReadThisYear: 0,
        sessionsLogged: 25,
        readingDates: [],
      },
      {
        currentStreakDays: 4,
        longestStreakDays: 8,
      },
    );

    const session5 = badges.find((b) => b.key === "sessions-5");
    const session25 = badges.find((b) => b.key === "sessions-25");
    const session100 = badges.find((b) => b.key === "sessions-100");

    expect(session5).toMatchObject({
      unlocked: true,
      progress: 25,
      target: 5,
    });

    expect(session25).toMatchObject({
      unlocked: true,
      progress: 25,
      target: 25,
    });

    expect(session100).toMatchObject({
      unlocked: false,
      progress: 25,
      target: 100,
    });
  });
});
