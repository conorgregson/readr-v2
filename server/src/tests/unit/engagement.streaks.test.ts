import { describe, expect, it } from "vitest";
import {
  computeCurrentStreakDays,
  computeLongestStreakDays,
  computeReadingStreaks,
} from "../../modules/engagement/engagement.streaks";

describe("engagement.streaks", () => {
  describe("computeLongestStreakDays", () => {
    it("returns 0 for no reading dates", () => {
      expect(computeLongestStreakDays([])).toBe(0);
    });

    it("returns 1 for a single reading date", () => {
      expect(computeLongestStreakDays(["2025-04-01"])).toBe(1);
    });

    it("computes the longest consecutive streak", () => {
      expect(
        computeLongestStreakDays([
          "2026-03-20",
          "2026-03-21",
          "2026-03-22",
          "2026-03-25",
          "2026-03-26",
        ]),
      ).toBe(3);
    });

    it("ignores duplicate reading dates", () => {
      expect(
        computeLongestStreakDays([
          "2026-03-20",
          "2026-03-20",
          "2026-03-21",
          "2026-03-21",
          "2026-03-22",
        ]),
      ).toBe(3);
    });

    it("ignores gaps and restarts the streak count", () => {
      expect(
        computeLongestStreakDays([
          "2026-03-10",
          "2026-03-11",
          "2026-03-13",
          "2026-03-14",
          "2026-03-15",
          "2026-03-18",
        ]),
      ).toBe(3);
    });
  });

  describe("computeCurrentStreakDays", () => {
    it("returns 0 for no reading dates", () => {
      expect(
        computeCurrentStreakDays([], {
          graceWindowEnabled: false,
          today: "2026-04-03",
        }),
      ).toBe(0);
    });

    it("returns the live streak when the user read today", () => {
      expect(
        computeCurrentStreakDays(["2026-04-01", "2026-04-02", "2026-04-03"], {
          graceWindowEnabled: false,
          today: "2026-04-03",
        }),
      ).toBe(3);
    });

    it("keeps the streak alive if the last reading day was yesterday", () => {
      expect(
        computeCurrentStreakDays(["2026-03-31", "2026-04-01", "2026-04-02"], {
          graceWindowEnabled: false,
          today: "2026-04-03",
        }),
      ).toBe(3);
    });

    it("returns 0 when the streak is broken without grace window", () => {
      expect(
        computeCurrentStreakDays(["2026-03-29", "2026-03-30", "2026-03-31"], {
          graceWindowEnabled: false,
          today: "2026-04-03",
        }),
      ).toBe(0);
    });

    it("keeps the streak alive with grace window enabled when the gap is two days", () => {
      expect(
        computeCurrentStreakDays(["2026-03-29", "2026-03-30", "2026-03-31"], {
          graceWindowEnabled: true,
          today: "2026-04-02",
        }),
      ).toBe(3);
    });

    it("returns 0 with grace window enabled when the gap exceeds two days", () => {
      expect(
        computeCurrentStreakDays(["2026-03-29", "2026-03-30", "2026-03-31"], {
          graceWindowEnabled: true,
          today: "2026-04-04",
        }),
      ).toBe(0);
    });

    it("does not inflate current streak from duplicate reading dates", () => {
      expect(
        computeCurrentStreakDays(["2026-04-01", "2026-04-01", "2026-04-02"], {
          graceWindowEnabled: false,
          today: "2026-04-03",
        }),
      ).toBe(2);
    });
  });

  describe("computeReadingStreaks", () => {
    it("returns a fill streak response shape", () => {
      expect(
        computeReadingStreaks({
          readingDates: ["2026-04-01", "2026-04-02", "2026-04-03"],
          graceWindowEnabled: false,
          today: "2026-04-03",
        }),
      ).toEqual({
        currentStreakDays: 3,
        longestStreakDays: 3,
        graceWindowEnabled: false,
      });
    });

    it("preserves longest streak even when current streak is broken", () => {
      expect(
        computeReadingStreaks({
          readingDates: [
            "2026-03-20",
            "2026-03-21",
            "2026-03-22",
            "2026-03-30",
          ],
          graceWindowEnabled: false,
          today: "2026-04-03",
        }),
      ).toEqual({
        currentStreakDays: 0,
        longestStreakDays: 3,
        graceWindowEnabled: false,
      });
    });
  });
});
