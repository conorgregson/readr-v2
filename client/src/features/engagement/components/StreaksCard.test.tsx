import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { StreakCard } from "./StreakCard";

describe("StreakCard", () => {
  it("renders current and longest streak values", () => {
    render(
      <StreakCard
        streaks={{
          currentStreakDays: 3,
          longestStreakDays: 7,
          graceWindowEnabled: false,
        }}
      />,
    );

    expect(screen.getByText("Reading Streaks")).toBeInTheDocument();
    expect(screen.getByText("Current Streak")).toBeInTheDocument();
    expect(screen.getByText("Longest Streak")).toBeInTheDocument();

    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
  });

  it("shows grace window disabled helper text", () => {
    render(
      <StreakCard
        streaks={{
          currentStreakDays: 0,
          longestStreakDays: 5,
          graceWindowEnabled: false,
        }}
      />,
    );

    expect(screen.getByText("Grace window disabled")).toBeInTheDocument();
  });

  it("shows grace window enabled helper text", () => {
    render(
      <StreakCard
        streaks={{
          currentStreakDays: 1,
          longestStreakDays: 8,
          graceWindowEnabled: true,
        }}
      />,
    );

    expect(screen.getByText("Grace window enabled")).toBeInTheDocument();
  });
});
