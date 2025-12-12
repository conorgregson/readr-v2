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

const router = Router();

// GET /books
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
      ];
    }

    const books = await prisma.book.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: offset ?? 0,
      take: limit ?? 20,
    });

    const response = BookListResponseSchema.parse(
      books.map((b) => ({
        ...b,
        author: b.author ?? null,
        genre: b.genre ?? null,
        pageCount: b.pageCount ?? null,
        currentPage: b.currentPage ?? null,
        createdAt: b.createdAt.toISOString(),
        updatedAt: b.updatedAt.toISOString(),
      })),
    );

    sendOk(res, response);
  } catch (error) {
    next(error);
  }
});

// POST /books
router.post("/", validateBody(CreateBookSchema), async (req, res, next) => {
  try {
    const body = (req as any).validatedBody;

    const created = await prisma.book.create({
      data: {
        title: body.title,
        author: body.author,
        genre: body.genre,
        status: body.status,
        pageCount: body.pageCount,
        currentPage: body.currentPage,
      },
    });

    const response = BookResponseSchema.parse({
      ...created,
      author: created.author ?? null,
      genre: created.genre ?? null,
      pageCount: created.pageCount ?? null,
      currentPage: created.currentPage ?? null,
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    });

    sendCreated(res, response);
  } catch (error) {
    next(error);
  }
});

// PATCH /books/:id
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
        author: updated.author ?? null,
        genre: updated.genre ?? null,
        pageCount: updated.pageCount ?? null,
        currentPage: updated.currentPage ?? null,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      });

      sendOk(res, response);
    } catch (error) {
      next(error);
    }
  },
);

// DELETE /books/:id
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

      await prisma.session.deleteMany({ where: { bookId: id } });
      await prisma.book.delete({ where: { id } });

      sendOk(res, { id });
    } catch (error) {
      next(error);
    }
  },
);

export { router as booksRouter };
