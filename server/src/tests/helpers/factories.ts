import { prisma } from "../../db/client";

export async function createBookForUser(
  userId: string,
  input?: Partial<{
    title: string;
    author: string;
    status: "planned" | "reading" | "finished";
  }>,
) {
  return prisma.book.create({
    data: {
      userId,
      title: input?.title ?? "Test Book",
      author: input?.author ?? "Test Author",
      status: input?.status ?? "planned",
    },
  });
}

export async function createSessionForUser(input: {
  userId: string;
  bookId: string;
  pages?: number | null;
  minutes?: number | null;
  notes?: string | null;
  date?: Date;
}) {
  return prisma.session.create({
    data: {
      userId: input.userId,
      bookId: input.bookId,
      pages: input.pages ?? null,
      minutes: input.minutes ?? null,
      notes: input.notes ?? null,
      date: input.date ?? new Date("2026-03-15T00:00:00.000Z"),
    },
  });
}
