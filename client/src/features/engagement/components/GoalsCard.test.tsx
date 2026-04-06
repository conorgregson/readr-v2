import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { GoalsCard } from "./GoalsCard";

describe("GoalsCard", () => {
  it("renders configured goals", () => {
    render(
      <GoalsCard
        goals={{
          yearlyBooksGoal: {
            target: 12,
            progress: 4,
            complete: false,
          },
          yearlyPagesGoal: {
            target: 5000,
            progress: 1200,
            complete: false,
          },
          monthlyBooksGoal: {
            target: 2,
            progress: 1,
            complete: false,
          },
        }}
      />,
    );

    expect(screen.getByText("Reading Goals")).toBeInTheDocument();
    expect(screen.getByText("Yearly Books")).toBeInTheDocument();
    expect(screen.getByText("Yearly Pages")).toBeInTheDocument();
    expect(screen.getByText("Monthly Books")).toBeInTheDocument();

    expect(screen.getByText("4 / 12")).toBeInTheDocument();
    expect(screen.getByText("1200 / 5000")).toBeInTheDocument();
    expect(screen.getByText("1 / 2")).toBeInTheDocument();
  });

  it("renders Not configured for missing goals", () => {
    render(
      <GoalsCard
        goals={{
          yearlyBooksGoal: {
            target: 12,
            progress: 4,
            complete: false,
          },
        }}
      />,
    );

    expect(screen.getByText("Yearly Books")).toBeInTheDocument();
    expect(screen.getByText("Monthly Books")).toBeInTheDocument();

    const notConfigured = screen.getAllByText("Not configured");
    expect(notConfigured.length).toBeGreaterThanOrEqual(1);
  });

  it("shows Complete for completed goals", () => {
    render(
      <GoalsCard
        goals={{
          yearlyBooksGoal: {
            target: 12,
            progress: 12,
            complete: true,
          },
        }}
      />,
    );

    expect(screen.getByText("Complete")).toBeInTheDocument();
  });
});
