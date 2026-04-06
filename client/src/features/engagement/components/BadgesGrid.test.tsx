import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { BadgesGrid } from "./BadgesGrid";

describe("BadgesGrid", () => {
  it("renders badges with title and description", () => {
    render(
      <BadgesGrid
        badges={[
          {
            key: "books-1",
            title: "First Finish",
            description: "Finish 1 book.",
            tier: "bronze",
            unlocked: true,
            progress: 1,
            target: 1,
          },
          {
            key: "pages-500",
            title: "Page Starter",
            description: "Read 500 pages.",
            tier: "silver",
            unlocked: false,
            progress: 120,
            target: 500,
          },
        ]}
      />,
    );

    expect(screen.getByText("Badges")).toBeInTheDocument();
    expect(screen.getByText("First Finish")).toBeInTheDocument();
    expect(screen.getByText("Finish 1 book.")).toBeInTheDocument();
    expect(screen.getByText("Page Starter")).toBeInTheDocument();
    expect(screen.getByText("Read 500 pages.")).toBeInTheDocument();
  });

  it("shows unlocked and locked labels", () => {
    render(
      <BadgesGrid
        badges={[
          {
            key: "books-1",
            title: "First Finish",
            description: "Finish 1 book.",
            tier: "bronze",
            unlocked: true,
            progress: 1,
            target: 1,
          },
          {
            key: "pages-500",
            title: "Page Starter",
            description: "Read 500 pages.",
            tier: "silver",
            unlocked: false,
            progress: 120,
            target: 500,
          },
        ]}
      />,
    );

    expect(screen.getByText("Unlocked")).toBeInTheDocument();
    expect(screen.getByText("Locked")).toBeInTheDocument();
  });

  it("shows tier and progress text", () => {
    render(
      <BadgesGrid
        badges={[
          {
            key: "streak-3",
            title: "On a Roll",
            description: "Reach a 3-day reading streak.",
            tier: "bronze",
            unlocked: true,
            progress: 3,
            target: 3,
          },
        ]}
      />,
    );

    expect(screen.getByText("bronze tier")).toBeInTheDocument();
    expect(screen.getByText("3 / 3")).toBeInTheDocument();
  });
});
