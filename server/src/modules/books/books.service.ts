import {
  BookStatus,
  FormatParent,
  FormatSubtype,
  type Prisma,
} from "@prisma/client";
import { prisma } from "../../db/client";
import { AppError } from "../../utils/errors";
import type { CreateBookInput, UpdateBookInput } from "./books.schema";

type ListBooksOptions = {
  search?: string;
  status?: BookStatus;
  limit?: number;
  offset?: number;
};

function validationError(details: unknown) {
  return new AppError("Validation failed", {
    status: 400,
    code: "VALIDATION_ERROR",
    details,
  });
}

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
    throw validationError({
      formatSubtype: ["formatSubtype does not match format=digital"],
    });
  }

  if (format === FormatParent.physical && digitalSubtypes.has(formatSubtype)) {
    throw validationError({
      formatSubtype: ["formatSubtype does not match format=physical"],
    });
  }
}

function resolveTimestampsForCreate(status: BookStatus) {
  const now = new Date();

  if (status === BookStatus.planned) {
    return {
      startedAt: null,
      finishedAt: null,
    };
  }

  if (status === BookStatus.reading) {
    return {
      startedAt: now,
      finishedAt: null,
    };
  }

  return {
    startedAt: now,
    finishedAt: now,
  };
}

function resolveTimestampsForUpdate(
  existing: {
    status: BookStatus;
    startedAt: Date | null;
    finishedAt: Date | null;
  },
  nextStatus: BookStatus,
) {
  const now = new Date();

  if (nextStatus === BookStatus.planned) {
    return {
      startedAt: null,
      finishedAt: null,
    };
  }

  if (nextStatus === BookStatus.reading) {
    return {
      startedAt: existing.startedAt ?? now,
      finishedAt: null,
    };
  }

  return {
    startedAt: existing.startedAt ?? now,
    finishedAt: existing.finishedAt ?? now,
  };
}

export async function listBooks(userId: string, options: ListBooksOptions) {
  const { search, status, limit, offset } = options;

  const where: Prisma.BookWhereInput = {
    userId,
  };

  if (status) {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { author: { contains: search, mode: "insensitive" } },
      { genre: { contains: search, mode: "insensitive" } },
      { series: { contains: search, mode: "insensitive" } },
      { isbn: { contains: search, mode: "insensitive" } },
    ];
  }

  return prisma.book.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: offset ?? 0,
    take: limit ?? 20,
  });
}

export async function createBook(userId: string, input: CreateBookInput) {
  assertFormatConsistency({
    format: input.format,
    formatSubtype: input.formatSubtype,
  });

  const timestamps = resolveTimestampsForCreate(input.status);

  return prisma.book.create({
    data: {
      userId,
      title: input.title,
      author: input.author,
      status: input.status,
      genre: input.genre,
      series: input.series,
      seriesType: input.seriesType,
      format: input.format,
      formatSubtype: input.formatSubtype,
      isbn: input.isbn,
      plannedMonth: input.plannedMonth,
      startedAt: timestamps.startedAt,
      finishedAt: timestamps.finishedAt,
    },
  });
}

export async function updateBook(
  userId: string,
  id: string,
  input: UpdateBookInput,
) {
  const existing = await prisma.book.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    throw new AppError("Book not found", {
      status: 404,
      code: "NOT_FOUND",
    });
  }

  const nextFormat =
    input.format === undefined ? existing.format : input.format;
  const nextFormatSubtype =
    input.formatSubtype === undefined
      ? existing.formatSubtype
      : input.formatSubtype;

  assertFormatConsistency({
    format: nextFormat,
    formatSubtype: nextFormatSubtype,
  });

  const nextStatus = input.status ?? existing.status;
  const statusChanged =
    input.status !== undefined && input.status !== existing.status;

  const timestampPatch = statusChanged
    ? resolveTimestampsForUpdate(existing, nextStatus)
    : {};

  return prisma.book.update({
    where: { id },
    data: {
      ...input,
      ...timestampPatch,
    },
  });
}

export async function deleteBook(userId: string, id: string) {
  const existing = await prisma.book.findFirst({
    where: { id, userId },
    select: { id: true },
  });

  if (!existing) {
    throw new AppError("Book not found", {
      status: 404,
      code: "NOT_FOUND",
    });
  }

  await prisma.book.delete({
    where: { id: existing.id },
  });
}
