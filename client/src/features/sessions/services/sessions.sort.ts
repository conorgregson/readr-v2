import type { Session, SessionsSortKey } from "../types";

function compare(a: string, b: string) {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

export function sortSessions(
  sessions: Session[],
  key: SessionsSortKey = "date:desc",
): Session[] {
  const out = sessions.slice();

  out.sort((a, b) => {
    // Primary: date (YYYY-MM-DD string compares correctly)
    const byDate = compare(a.date, b.date);

    // Secondary: createdAt (ISO string compares correctly)
    const byCreated = compare(a.createdAt, b.createdAt);

    // Final tie-breaker: id (guarantees determinism)
    const byId = compare(a.id, b.id);

    if (key === "date:asc") {
      if (byDate !== 0) return byDate;
      if (byCreated !== 0) return byCreated;
      return byId;
    }

    // date:desc
    if (byDate !== 0) return -byDate;
    if (byCreated !== 0) return -byCreated;
    return byId;
  });

  return out;
}
