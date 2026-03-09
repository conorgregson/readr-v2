import { Router } from "express";
import { prisma } from "../../db/client";
import {
  BookIdParamSchema,
  BookListResponseSchema,
  BookResponseSchema,
  CreateBookSchema,
  ListBooksQuerySchema,
  UpdateBookSchema,
} from "./books.schema";
import {
  validateBody,
  validateParams,
  validateQuery,
  sendCreated,
  sendOk,
} from "../../utils/http";
import { AppError } from "../../utils/errors";
import type { Book } from "@prisma/client";

const router = Router();

// GET /api/books
router.get("/", validateQuery(ListBooksQuerySchema), async (req, res, next) => {
  try {
    const { search, status, limit, offset } = (req as any).validatedQuery ?? {};

    const where: any = {};

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

    const books = await prisma.book.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: offset ?? 0,
      take: limit ?? 20,
    });

    const response = BookListResponseSchema.parse(
      books.map((b: Book) => ({
        ...b,
        genre: b.genre ?? null,
        series: b.series ?? null,
        seriesType: b.seriesType ?? null,
        format: b.format ?? null,
        formatSubtype: b.formatSubtype ?? null,
        isbn: b.isbn ?? null,
        plannedMonth: b.plannedMonth ?? null,
        startedAt: b.startedAt?.toISOString() ?? null,
        finishedAt: b.finishedAt?.toISOString() ?? null,
        createdAt: b.createdAt.toISOString(),
        updatedAt: b.updatedAt.toISOString(),
      })),
    );

    sendOk(res, response);
  } catch (error) {
    next(error);
  }
});

// POST /api/books
router.post("/", validateBody(CreateBookSchema), async (req, res, next) => {
  try {
    const body = (req as any).validatedBody;

    const created = await prisma.book.create({
      data: {
        title: body.title,
        author: body.author,
        status: body.status,
        genre: body.genre,
        series: body.series,
        seriesType: body.seriesType,
        format: body.format,
        formatSubtype: body.formatSubtype,
        isbn: body.isbn,
        plannedMonth: body.plannedMonth,
      },
    });

    const response = BookResponseSchema.parse({
      ...created,
      genre: created.genre ?? null,
      series: created.series ?? null,
      seriesType: created.seriesType ?? null,
      format: created.format ?? null,
      formatSubtype: created.formatSubtype ?? null,
      isbn: created.isbn ?? null,
      plannedMonth: created.plannedMonth ?? null,
      startedAt: created.startedAt?.toISOString() ?? null,
      finishedAt: created.finishedAt?.toISOString() ?? null,
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    });

    sendCreated(res, response);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/books/:id
router.patch(
  "/:id",
  validateParams(BookIdParamSchema),
  validateBody(UpdateBookSchema),
  async (req, res, next) => {
    try {
      const { id } = (req as any).validatedParams as { id: string };
      const body = (req as any).validatedBody;

      const existing = await prisma.book.findUnique({ where: { id } });
      if (!existing) {
        throw new AppError("Book not found", {
          status: 404,
          code: "NOT_FOUND",
        });
      }

      const updated = await prisma.book.update({
        where: { id },
        data: body,
      });

      const response = BookResponseSchema.parse({
        ...updated,
        genre: updated.genre ?? null,
        series: updated.series ?? null,
        seriesType: updated.seriesType ?? null,
        format: updated.format ?? null,
        formatSubtype: updated.formatSubtype ?? null,
        isbn: updated.isbn ?? null,
        plannedMonth: updated.plannedMonth ?? null,
        startedAt: updated.startedAt?.toISOString() ?? null,
        finishedAt: updated.finishedAt?.toISOString() ?? null,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      });

      sendOk(res, response);
    } catch (error) {
      next(error);
    }
  },
);

// DELETE /api/books/:id
router.delete(
  "/:id",
  validateParams(BookIdParamSchema),
  async (req, res, next) => {
    try {
      const { id } = (req as any).validatedParams as { id: string };

      const existing = await prisma.book.findUnique({ where: { id } });
      if (!existing) {
        throw new AppError("Book not found", {
          status: 404,
          code: "NOT_FOUND",
        });
      }

      await prisma.book.delete({ where: { id } });

      sendOk(res, { id });
    } catch (error) {
      next(error);
    }
  },
);

export { router as booksRouter };
