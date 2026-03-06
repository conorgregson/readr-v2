import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SessionsHistoryTable } from "./SessionsHistoryTable";
import { useSessionsStore } from "../store/sessions.store";
import type { Session } from "../types";

vi.mock("./SessionsRow", () => ({
  SessionsRow: ({
    session,
    isSelected,
    onSelect,
    setRowRef,
  }: {
    session: Session;
    isSelected: boolean;
    onSelect: () => void;
    setRowRef: (el: HTMLTableRowElement | null) => void;
  }) => (
    <tr
      id={`session-row-${session.id}`}
      ref={setRowRef}
      data-testid={`row-${session.id}`}
      data-selected={isSelected ? "true" : "false"}
      aria-selected={isSelected}
      tabIndex={isSelected ? 0 : -1}
      onClick={onSelect}
    >
      <td>{session.date}</td>
      <td>{session.bookId}</td>
      <td>{session.pages ?? session.minutes ?? "-"}</td>
      <td>{session.notes ?? ""}</td>
    </tr>
  ),
}));

function makeSession(overrides: Partial<Session> = {}): Session {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    bookId: overrides.bookId ?? "book-1",
    date: overrides.date ?? "2026-03-01",
    createdAt: overrides.createdAt ?? "2026-03-01T10:00:00.000Z",
    updatedAt: overrides.updatedAt ?? "2026-03-01T10:00:00.000Z",
    notes: overrides.notes ?? "",
    pages: overrides.pages,
    minutes: overrides.minutes,
  };
}

beforeEach(() => {
  localStorage.clear();
  useSessionsStore.getState().reset();
});

describe("SessionsHistoryTable keyboard navigation", () => {
  it("selects first row on Enter when nothing is selected", async () => {
    const sessions = [
      makeSession({ id: "a" }),
      makeSession({ id: "b" }),
      makeSession({ id: "c" }),
    ];

    render(<SessionsHistoryTable sessions={sessions} query="" />);

    const region = screen.getByRole("region", { name: /sessions history/i });
    region.focus();

    await userEvent.keyboard("{Enter}");

    expect(useSessionsStore.getState().selectedId).toBe("a");
    expect(region).toHaveAttribute("aria-activedescendant", "session-row-a");
  });

  it("moves selection with ArrowDown and ArrowUp", async () => {
    const sessions = [
      makeSession({ id: "a" }),
      makeSession({ id: "b" }),
      makeSession({ id: "c" }),
    ];

    render(<SessionsHistoryTable sessions={sessions} query="" />);

    const region = screen.getByRole("region", { name: /sessions history/i });
    region.focus();

    await userEvent.keyboard("{ArrowDown}");
    expect(useSessionsStore.getState().selectedId).toBe("a");

    await userEvent.keyboard("{ArrowDown}");
    expect(useSessionsStore.getState().selectedId).toBe("b");

    await userEvent.keyboard("{ArrowUp}");
    expect(useSessionsStore.getState().selectedId).toBe("a");
  });

  it("moves selection to first and last with Home and End", async () => {
    const sessions = [
      makeSession({ id: "a" }),
      makeSession({ id: "b" }),
      makeSession({ id: "c" }),
    ];

    render(<SessionsHistoryTable sessions={sessions} query="" />);

    const region = screen.getByRole("region", { name: /sessions history/i });
    region.focus();

    await userEvent.keyboard("{End}");
    expect(useSessionsStore.getState().selectedId).toBe("c");

    await userEvent.keyboard("{Home}");
    expect(useSessionsStore.getState().selectedId).toBe("a");
  });

  it("clears selection on Escape", async () => {
    const sessions = [makeSession({ id: "a" }), makeSession({ id: "b" })];

    useSessionsStore.setState({ selectedId: "b" });

    render(<SessionsHistoryTable sessions={sessions} query="" />);

    const region = screen.getByRole("region", { name: /sessions history/i });
    region.focus();

    await userEvent.keyboard("{Escape}");

    expect(useSessionsStore.getState().selectedId).toBeNull();
    expect(region).not.toHaveAttribute("aria-activedescendant");
  });

  it("clears stale selection when selected row disappears from filtered results", () => {
    const initial = [makeSession({ id: "a" }), makeSession({ id: "b" })];

    useSessionsStore.setState({ selectedId: "b" });

    const { rerender } = render(
      <SessionsHistoryTable sessions={initial} query="" />,
    );

    expect(useSessionsStore.getState().selectedId).toBe("b");

    rerender(<SessionsHistoryTable sessions={[initial[0]]} query="" />);

    expect(useSessionsStore.getState().selectedId).toBeNull();
  });
});
