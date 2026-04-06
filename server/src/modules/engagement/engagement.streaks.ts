import type { ReadingStreakResponse } from "../../../../shared/types/v2.4";
import type { StreakComputationInput } from "./engagement.types";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function toUtcDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function parseUtcDateKey(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

function normalizeReadingDates(readingDates: string[]): string[] {
  return [...new Set(readingDates.map((d) => d.trim()).filter(Boolean))].sort();
}

function diffUtcDays(from: string, to: string): number {
  const fromMs = parseUtcDateKey(from).getTime();
  const toMs = parseUtcDateKey(to).getTime();
  return Math.round((toMs - fromMs) / MS_PER_DAY);
}

export function computeLongestStreakDays(readingDates: string[]): number {
  const normalized = normalizeReadingDates(readingDates);

  if (normalized.length === 0) {
    return 0;
  }

  let longest = 1;
  let current = 1;

  for (let i = 1; i < normalized.length; i += 1) {
    const gap = diffUtcDays(normalized[i - 1], normalized[i]);

    if (gap === 1) {
      current += 1;
      if (current > longest) longest = current;
    } else {
      current = 1;
    }
  }

  return longest;
}

export function computeCurrentStreakDays(
  readingDates: string[],
  options: Pick<StreakComputationInput, "graceWindowEnabled" | "today">,
): number {
  const normalized = normalizeReadingDates(readingDates);

  if (normalized.length === 0) {
    return 0;
  }

  const today = options.today ?? toUtcDateKey(new Date());
  const allowedGapFromToday = options.graceWindowEnabled ? 2 : 1;

  const lastReadDate = normalized[normalized.length - 1];
  const gapFromLastRead = diffUtcDays(lastReadDate, today);

  if (gapFromLastRead > allowedGapFromToday) {
    return 0;
  }

  let streak = 1;

  for (let i = normalized.length - 1; i > 0; i -= 1) {
    const gap = diffUtcDays(normalized[i - 1], normalized[i]);

    if (gap === 1) {
      streak += 1;
    } else {
      break;
    }
  }

  return streak;
}

export function computeReadingStreaks(
  input: StreakComputationInput,
): ReadingStreakResponse {
  const normalized = normalizeReadingDates(input.readingDates);

  return {
    currentStreakDays: computeCurrentStreakDays(normalized, {
      graceWindowEnabled: input.graceWindowEnabled,
      today: input.today,
    }),
    longestStreakDays: computeLongestStreakDays(normalized),
    graceWindowEnabled: input.graceWindowEnabled,
  };
}
