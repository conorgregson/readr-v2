import type {
  GoalProgress,
  ReadingGoalsResponse,
} from "./../../../../shared/types/v2.4";
import type { GoalComputationInput } from "./engagement.types";

function buildGoalProgress(
  target: number | undefined,
  progress: number,
): GoalProgress | undefined {
  if (!target || target <= 0) {
    return undefined;
  }

  return {
    target,
    progress,
    complete: progress >= target,
  };
}

export function computeReadingGoals(
  input: GoalComputationInput,
): ReadingGoalsResponse {
  return {
    yearlyBooksGoal: buildGoalProgress(
      input.yearlyBooksTarget,
      input.finishedBooksThisYear,
    ),
    yearlyPagesGoal: buildGoalProgress(
      input.yearlyPagesTarget,
      input.pagesReadThisYear,
    ),
    monthlyBooksGoal: buildGoalProgress(
      input.monthlyBooksTarget,
      input.finishedBooksThisMonth,
    ),
  };
}
