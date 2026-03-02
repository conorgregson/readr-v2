import type { Session, SessionsSortKey } from "../types";

function cmp(a: string, b: string) {
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
    const byDate = cmp(a.date, b.date);

    // Secondary: createdAt (ISO string compares correctly)
    const byCreated = cmp(a.createdAt, b.createdAt);

    if (key === "date:asc") {
      if (byDate !== 0) return byDate;
      return byCreated;
    }

    // date:desc
    if (byDate !== 0) return -byDate;
    return -byCreated;
  });

  return out;
}
