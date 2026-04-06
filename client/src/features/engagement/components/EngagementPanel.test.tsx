import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { EngagementPanel } from "./EngagementPanel";

describe("EngagementPanel", () => {
  it("renders goals, streaks, and badges sections", () => {
    render(
      <EngagementPanel
        snapshot={{
          goals: {
            yearlyBooksGoal: {
              target: 12,
              progress: 4,
              complete: false,
            },
          },
          streaks: {
            currentStreakDays: 2,
            longestStreakDays: 5,
            graceWindowEnabled: false,
          },
          badges: [
            {
              key: "books-1",
              title: "First Finish",
              description: "Finish 1 book.",
              tier: "bronze",
              unlocked: true,
              progress: 4,
              target: 1,
            },
          ],
        }}
      />,
    );

    expect(screen.getByText("Reading Goals")).toBeInTheDocument();
    expect(screen.getByText("Reading Streaks")).toBeInTheDocument();
    expect(screen.getByText("Badges")).toBeInTheDocument();
    expect(screen.getByText("First Finish")).toBeInTheDocument();
  });
});
