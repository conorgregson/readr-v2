import type { Prisma } from "@prisma/client";
import { prisma } from "../../db/client";
import { AppError } from "../../utils/errors";
import type {
  CreateSessionInput,
  ResoreSessionInput,
  UpdateSessionInput,
} from "./sessions.schema";

type ListSessionsOptions = {
  bookId?: string;
  search?: string;
  from?: Date;
  to?: Date;
  limit?: number;
  offset?: number;
};

function assertSessionHasWork(input: {
  pages?: number | null;
  minutes?: number | null;
}) {
  const hasPages = typeof input.pages === "number";
  const hasMinutes = typeof input.minutes === "number";

  if (!hasPages && !hasMinutes) {
    throw new AppError("Validation failed", {
      status: 400,
      code: "VALIDATION_ERROR",
      details: {
        pages: ["At least one of pages or minutes must be provided"],
      },
    });
  }
}

async function requireOwnedBook(userId: string, bookId: string) {
  const book = await prisma.book.findFirst({
    where: {
      id: bookId,
      userId,
    },
    select: {
      id: true,
      userId: true,
    },
  });

  if (!book) {
    throw new AppError("Book not found", {
      status: 404,
      code: "NOT_FOUND",
    });
  }

  return book;
}

export async function listSessions(
  userId: string,
  options: ListSessionsOptions,
) {
  const { bookId, search, from, to, limit, offset } = options;

  if (bookId) {
    await requireOwnedBook(userId, bookId);
  }

  const where: Prisma.SessionWhereInput = {
    userId,
  };

  if (bookId) {
    where.bookId = bookId;
  }

  if (from || to) {
    where.date = {
      ...(from ? { gte: from } : {}),
      ...(to ? { lte: to } : {}),
    };
  }

  if (search) {
    where.OR = [
      { notes: { contains: search, mode: "insensitive" } },
      {
        book: {
          is: {
            title: { contains: search, mode: "insensitive" },
          },
        },
      },
      {
        book: {
          is: {
            author: { contains: search, mode: "insensitive" },
          },
        },
      },
    ];
  }

  return prisma.session.findMany({
    where,
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    skip: offset ?? 0,
    take: limit ?? 50,
  });
}

export async function createSession(userId: string, input: CreateSessionInput) {
  assertSessionHasWork({
    pages: input.pages,
    minutes: input.minutes,
  });

  const book = await requireOwnedBook(userId, input.bookId);

  return prisma.session.create({
    data: {
      userId,
      bookId: book.id,
      date: input.date,
      pages: input.pages ?? null,
      minutes: input.minutes ?? null,
      notes: input.notes ?? null,
    },
  });
}

export async function updateSession(
  userId: string,
  id: string,
  input: UpdateSessionInput,
) {
  const existing = await prisma.session.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    throw new AppError("Session not found", {
      status: 404,
      code: "NOT_FOUND",
    });
  }

  const nextBookId = input.bookId ?? existing.bookId;
  const nextPages = input.pages === undefined ? existing.pages : input.pages;
  const nextMinutes =
    input.minutes === undefined ? existing.minutes : input.minutes;

  assertSessionHasWork({
    pages: nextPages,
    minutes: nextMinutes,
  });

  const ownedBook = await requireOwnedBook(userId, nextBookId);

  return prisma.session.update({
    where: { id },
    data: {
      ...(input.bookId !== undefined ? { bookId: ownedBook.id } : {}),
      ...(input.pages !== undefined ? { pages: input.pages } : {}),
      ...(input.minutes !== undefined ? { minutes: input.minutes } : {}),
      ...(input.notes !== undefined ? { notes: input.notes } : {}),
      ...(input.date !== undefined ? { date: input.date } : {}),
      userId,
    },
  });
}

export async function deleteSession(userId: string, id: string) {
  const existing = await prisma.session.findFirst({
    where: { id, userId },
    select: { id: true },
  });

  if (!existing) {
    throw new AppError("Session not found", {
      status: 404,
      code: "NOT_FOUND",
    });
  }

  await prisma.session.delete({
    where: { id: existing.id },
  });

  return { id: existing.id };
}

export async function restoreSession(
  userId: string,
  input: ResoreSessionInput,
) {
  assertSessionHasWork({
    pages: input.pages,
    minutes: input.minutes,
  });

  const ownedBook = await requireOwnedBook(userId, input.bookId);

  const existing = await prisma.session.findFirst({
    where: {
      id: input.id,
      userId,
    },
    select: { id: true },
  });

  if (existing) {
    throw new AppError("Session already exists", {
      status: 409,
      code: "CONFLICT",
    });
  }

  return prisma.session.create({
    data: {
      id: input.id,
      userId,
      bookId: ownedBook.id,
      date: input.date,
      pages: input.pages ?? null,
      minutes: input.minutes ?? null,
      notes: input.notes ?? null,
      createdAt: new Date(input.createdAt),
      updatedAt: new Date(input.updatedAt),
    },
  });
}
