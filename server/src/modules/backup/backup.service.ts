import { BookStatus, FormatParent, FormatSubtype } from "@prisma/client";
import { prisma } from "../../db/client";
import { AppError } from "../../utils/errors";
import type { ImportBackupInput } from "./backup.schema";

function assertFormatConsistency(input: {
  format?: FormatParent | null;
  formatSubtype?: FormatSubtype | null;
}) {
  const { format, formatSubtype } = input;

  if (!formatSubtype || !format) return;

  const digitalSubtypes = new Set<FormatSubtype>([
    FormatSubtype.ebook,
    FormatSubtype.Audiobook,
    FormatSubtype.PDF,
  ]);

  const physicalSubtypes = new Set<FormatSubtype>([
    FormatSubtype.Hardcover,
    FormatSubtype.Paperback,
  ]);

  if (format === FormatParent.digital && physicalSubtypes.has(formatSubtype)) {
    throw new AppError("Validation failed", {
      status: 400,
      code: "VALIDATION_ERROR",
      details: {
        formatSubtype: ["formatSubtype does not match format=digital"],
      },
    });
  }

  if (format === FormatParent.physical && digitalSubtypes.has(formatSubtype)) {
    throw new AppError("Validation failed", {
      status: 400,
      code: "VALIDATION_ERROR",
      details: {
        formatSubtype: ["formatSubtype does not match format=physical"],
      },
    });
  }
}

function resolveImportedTimestamps(input: {
  status: BookStatus;
  startedAt?: string | null;
  finishedAt?: string | null;
}) {
  const startedAt = input.startedAt ? new Date(input.startedAt) : null;
  const finishedAt = input.finishedAt ? new Date(input.finishedAt) : null;

  if (input.status === BookStatus.planned) {
    return {
      startedAt: null,
      finishedAt: null,
    };
  }

  if (input.status === BookStatus.reading) {
    return {
      startedAt: startedAt ?? new Date(),
      finishedAt: null,
    };
  }

  return {
    startedAt: startedAt ?? new Date(),
    finishedAt: finishedAt ?? startedAt ?? new Date(),
  };
}

export async function exportBackup(userId: string) {
  const [books, sessions] = await Promise.all([
    prisma.book.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    }),
    prisma.session.findMany({
      where: { userId },
      orderBy: [{ date: "asc" }, { createdAt: "asc" }],
    }),
  ]);

  return {
    version: "2.3",
    exportedAt: new Date(),
    books,
    sessions,
  };
}

export async function importBackup(userId: string, input: ImportBackupInput) {
  if (input.sessions.length > 0 && input.books.length === 0) {
    throw new AppError("Validation failed", {
      status: 400,
      code: "VALIDATION_ERROR",
      details: {
        sessions: ["Sessions cannot be imported without books"],
      },
    });
  }

  return prisma.$transaction(async (tx) => {
    const importedBookIdToCreatedBookId = new Map<string, string>();

    for (const book of input.books) {
      assertFormatConsistency({
        format: book.format ?? null,
        formatSubtype: book.formatSubtype ?? null,
      });

      const timestamps = resolveImportedTimestamps({
        status: book.status,
        startedAt: book.startedAt ?? null,
        finishedAt: book.finishedAt ?? null,
      });

      const createdBook = await tx.book.create({
        data: {
          userId,
          title: book.title,
          author: book.author,
          status: book.status,
          genre: book.genre ?? null,
          series: book.series ?? null,
          seriesType: book.seriesType ?? null,
          format: book.format ?? null,
          formatSubtype: book.formatSubtype ?? null,
          isbn: book.isbn ?? null,
          plannedMonth: book.plannedMonth ?? null,
          startedAt: timestamps.startedAt,
          finishedAt: timestamps.finishedAt,
        },
        select: { id: true },
      });

      importedBookIdToCreatedBookId.set(book.id, createdBook.id);
    }

    for (const session of input.sessions) {
      const mappedBookId = importedBookIdToCreatedBookId.get(session.bookId);

      if (!mappedBookId) {
        throw new AppError("Validation failed", {
          status: 400,
          code: "VALIDATION_ERROR",
          details: {
            bookId: [
              `Session references unknown imported book id: ${session.bookId}`,
            ],
          },
        });
      }

      await tx.session.create({
        data: {
          userId,
          bookId: mappedBookId,
          date: session.date,
          pages: session.pages ?? null,
          minutes: session.minutes ?? null,
          notes: session.notes ?? null,
        },
      });
    }

    return {
      importedBooks: input.books.length,
      importedSessions: input.sessions.length,
    };
  });
}
