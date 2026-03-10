import { BookStatus, type Prisma } from "@prisma/client";

type ExistingBookTimestamps = {
  startedAt: Date | null;
  finishedAt: Date | null;
  status: BookStatus;
};

export function resolveBookStatusTimestamps(
  existing: ExistingBookTimestamps | null,
  nextStatus: BookStatus,
): Pick<Prisma.BookUncheckedCreateInput, "startedAt" | "finishedAt"> {
  const now = new Date();

  if (nextStatus === BookStatus.planned) {
    return {
      startedAt: null,
      finishedAt: null,
    };
  }

  if (nextStatus === BookStatus.reading) {
    return {
      startedAt: existing?.startedAt ?? now,
      finishedAt: null,
    };
  }

  return {
    startedAt: existing?.startedAt ?? now,
    finishedAt: existing?.finishedAt ?? now,
  };
}
