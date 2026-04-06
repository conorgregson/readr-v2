import { describe, expect, it } from "vitest";
import { computeReadingGoals } from "../../modules/engagement/engagement.goals";

describe("engagement.goals", () => {
  it("omits goals when targets are undefined", () => {
    expect(
      computeReadingGoals({
        finishedBooksThisYear: 1,
        pagesReadThisYear: 100,
        finishedBooksThisMonth: 1,
      }),
    ).toEqual({
      yearlyBooksGoal: undefined,
      yearlyPagesGoal: undefined,
      monthlyBooksGoal: undefined,
    });
  });

  it("marks goals incomplete when progress is below target", () => {
    expect(
      computeReadingGoals({
        yearlyBooksTarget: 12,
        yearlyPagesTarget: 5000,
        monthlyBooksTarget: 2,
        finishedBooksThisYear: 1,
        pagesReadThisYear: 75,
        finishedBooksThisMonth: 1,
      }),
    ).toEqual({
      yearlyBooksGoal: {
        target: 12,
        progress: 1,
        complete: false,
      },
      yearlyPagesGoal: {
        target: 5000,
        progress: 75,
        complete: false,
      },
      monthlyBooksGoal: {
        target: 2,
        progress: 1,
        complete: false,
      },
    });
  });

  it("marks goals complete when progress exactly matches target", () => {
    expect(
      computeReadingGoals({
        yearlyBooksTarget: 12,
        yearlyPagesTarget: 5000,
        monthlyBooksTarget: 2,
        finishedBooksThisYear: 12,
        pagesReadThisYear: 5000,
        finishedBooksThisMonth: 2,
      }),
    ).toEqual({
      yearlyBooksGoal: {
        target: 12,
        progress: 12,
        complete: true,
      },
      yearlyPagesGoal: {
        target: 5000,
        progress: 5000,
        complete: true,
      },
      monthlyBooksGoal: {
        target: 2,
        progress: 2,
        complete: true,
      },
    });
  });

  it("keeps goals complete when progress exceeds target", () => {
    expect(
      computeReadingGoals({
        yearlyBooksTarget: 12,
        yearlyPagesTarget: 5000,
        monthlyBooksTarget: 2,
        finishedBooksThisYear: 14,
        pagesReadThisYear: 6200,
        finishedBooksThisMonth: 3,
      }),
    ).toEqual({
      yearlyBooksGoal: {
        target: 12,
        progress: 14,
        complete: true,
      },
      yearlyPagesGoal: {
        target: 5000,
        progress: 6200,
        complete: true,
      },
      monthlyBooksGoal: {
        target: 2,
        progress: 3,
        complete: true,
      },
    });
  });

  it("omits targets that are zero or invalid", () => {
    expect(
      computeReadingGoals({
        yearlyBooksTarget: 0,
        yearlyPagesTarget: -100,
        monthlyBooksTarget: 2,
        finishedBooksThisYear: 5,
        pagesReadThisYear: 1000,
        finishedBooksThisMonth: 1,
      }),
    ).toEqual({
      yearlyBookGoals: undefined,
      yearlyPagesGoals: undefined,
      monthlyBooksGoal: {
        target: 2,
        progress: 1,
        complete: false,
      },
    });
  });
});
