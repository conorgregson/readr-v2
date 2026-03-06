import { describe, it, expect } from "vitest";
import { sortSessions } from "./sessions.sort";
import type { Session } from "../types";

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

describe("sortSessions()", () => {
  it("sorts by date descending by default", () => {
    const sessions = [
      makeSession({ id: "a", date: "2026-03-01" }),
      makeSession({ id: "b", date: "2026-03-03" }),
      makeSession({ id: "c", date: "2026-03-02" }),
    ];

    const result = sortSessions(sessions);

    expect(result.map((s) => s.id)).toEqual(["b", "c", "a"]);
  });

  it("sorts by date ascending when key is date:asc", () => {
    const sessions = [
      makeSession({ id: "a", date: "2026-03-03" }),
      makeSession({ id: "b", date: "2026-03-01" }),
      makeSession({ id: "c", date: "2026-03-02" }),
    ];

    const result = sortSessions(sessions, "date:asc");

    expect(result.map((s) => s.id)).toEqual(["b", "c", "a"]);
  });

  it("uses createdAt as a deterministic secondary tie-breaker for date:desc", () => {
    const sessions = [
      makeSession({
        id: "a",
        date: "2026-03-01",
        createdAt: "2026-03-01T08:00:00.000Z",
      }),
      makeSession({
        id: "b",
        date: "2026-03-01",
        createdAt: "2026-03-01T10:00:00.000Z",
      }),
    ];

    const result = sortSessions(sessions, "date:desc");

    expect(result.map((s) => s.id)).toEqual(["b", "a"]);
  });

  it("uses createdAt as a deterministic secondary tie-breaker for date:asc", () => {
    const sessions = [
      makeSession({
        id: "a",
        date: "2026-03-01",
        createdAt: "2026-03-01T10:00:00.000Z",
      }),
      makeSession({
        id: "b",
        date: "2026-03-01",
        createdAt: "2026-03-01T08:00:00.000Z",
      }),
    ];

    const result = sortSessions(sessions, "date:asc");

    expect(result.map((s) => s.id)).toEqual(["b", "a"]);
  });

  it("uses id as the final tie-breaker when date and createdAt match", () => {
    const sessions = [
      makeSession({
        id: "b",
        date: "2026-03-01",
        createdAt: "2026-03-01T10:00:00.000Z",
      }),
      makeSession({
        id: "a",
        date: "2026-03-01",
        createdAt: "2026-03-01T10:00:00.000Z",
      }),
    ];

    const resultAsc = sortSessions(sessions, "date:asc");
    const resultDesc = sortSessions(sessions, "date:desc");

    expect(resultAsc.map((s) => s.id)).toEqual(["a", "b"]);
    expect(resultDesc.map((s) => s.id)).toEqual(["a", "b"]);
  });

  it("does not mutate the input array", () => {
    const sessions = [
      makeSession({ id: "a", date: "2026-03-03" }),
      makeSession({ id: "b", date: "2026-03-01" }),
    ];

    const original = [...sessions];

    sortSessions(sessions, "date:asc");

    expect(sessions).toEqual(original);
  });

  it("is deterministic across repeated calls", () => {
    const sessions = [
      makeSession({
        id: "c",
        date: "2026-03-01",
        createdAt: "2026-03-01T10:00:00.000Z",
      }),
      makeSession({
        id: "a",
        date: "2026-03-01",
        createdAt: "2026-03-01T10:00:00.000Z",
      }),
      makeSession({
        id: "b",
        date: "2026-03-01",
        createdAt: "2026-03-01T10:00:00.000Z",
      }),
    ];

    const run1 = sortSessions(sessions, "date:desc").map((s) => s.id);
    const run2 = sortSessions(sessions, "date:desc").map((s) => s.id);

    expect(run1).toEqual(run2);
    expect(run1).toEqual(["a", "b", "c"]);
  });
});
