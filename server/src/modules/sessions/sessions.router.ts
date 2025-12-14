import { Router } from "express";
import { prisma } from "../../db/client";
import {
  CreateSessionSchema,
  ListSessionsQuerySchema,
  SessionIdParamSchema,
  SessionListResponseSchema,
  SessionResponseSchema,
  UpdateSessionSchema,
} from "./sessions.schema";
import {
  validateBody,
  validateParams,
  validateQuery,
  sendCreated,
  sendOk,
} from "../../utils/http";
import { AppError } from "../../utils/errors";
import type { Session } from "@prisma/client";

const router = Router();

// GET /sessions
router.get("/", validateQuery(ListSessionsQuerySchema), async (req, res, next) => {
  try {
    const { bookId, search, from, to, limit, offset } =
      (req as any).validatedQuery ?? {};

    const where: any = {};

    if (bookId) where.bookId = bookId;

    if (from || to) {
      where.date = {};
      if (from) where.date.gte = from;
      if (to) where.date.lte = to;
    }

    if (search) {
      where.notes = { contains: search, mode: "insensitive" };
    }

    const sessions = await prisma.session.findMany({
      where,
      orderBy: { date: "desc" },
      skip: offset ?? 0,
      take: limit ?? 50,
    });

    const response = SessionListResponseSchema.parse(
      sessions.map((s: Session) => ({
        ...s,
        notes: s.notes ?? null,
        date: s.date.toISOString(),
        createdAt: s.createdAt.toISOString(),
        updatedAt: s.updatedAt.toISOString(),
      })),
    );

    sendOk(res, response);
  } catch (error) {
    next(error);
  }
});

// GET /sessions/:id
router.get(
  "/:id",
  validateParams(SessionIdParamSchema),
  async (req, res, next) => {
    try {
      const { id } = (req as any).validatedParams as { id: string };

      const session = await prisma.session.findUnique({ where: { id } });

      if (!session) {
        throw new AppError("Session not found", {
          status: 404,
          code: "NOT_FOUND",
        });
      }

      const response = SessionResponseSchema.parse({
        ...session,
        notes: session.notes ?? null,
        date: session.date.toISOString(),
        createdAt: session.createdAt.toISOString(),
        updatedAt: session.updatedAt.toISOString(),
      });

      sendOk(res, response);
    } catch (error) {
      next(error);
    }
  },
);

// POST /sessions
router.post("/", validateBody(CreateSessionSchema), async (req, res, next) => {
  try {
    const body = (req as any).validatedBody;

    const book = await prisma.book.findUnique({ where: { id: body.bookId } });
    if (!book) {
      throw new AppError("Book not found for this session", {
        status: 404,
        code: "NOT_FOUND",
      });
    }

    const created = await prisma.session.create({
      data: {
        bookId: body.bookId,
        minutes: body.minutes,
        notes: body.notes,
        date: body.date,
      },
    });

    const response = SessionResponseSchema.parse({
      ...created,
      notes: created.notes ?? null,
      date: created.date.toISOString(),
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    });

    sendCreated(res, response);
  } catch (error) {
    next(error);
  }
});

// PATCH /sessions/:id
router.patch(
  "/:id",
  validateParams(SessionIdParamSchema),
  validateBody(UpdateSessionSchema),
  async (req, res, next) => {
    try {
      const { id } = (req as any).validatedParams as { id: string };
      const body = (req as any).validatedBody;

      const existing = await prisma.session.findUnique({ where: { id } });
      if (!existing) {
        throw new AppError("Session not found", {
          status: 404,
          code: "NOT_FOUND",
        });
      }

      if (body.bookId) {
        const book = await prisma.book.findUnique({ where: { id: body.bookId } });
        if (!book) {
          throw new AppError("Book not found for this session", {
            status: 404,
            code: "NOT_FOUND",
          });
        }
      }

      const updated = await prisma.session.update({
        where: { id },
        data: {
          bookId: body.bookId ?? existing.bookId,
          minutes: body.minutes ?? existing.minutes,
          notes: body.notes ?? existing.notes,
          date: body.date ?? existing.date,
        },
      });

      const response = SessionResponseSchema.parse({
        ...updated,
        notes: updated.notes ?? null,
        date: updated.date.toISOString(),
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      });

      sendOk(res, response);
    } catch (error) {
      next(error);
    }
  },
);

// DELETE /sessions/:id
router.delete(
  "/:id",
  validateParams(SessionIdParamSchema),
  async (req, res, next) => {
    try {
      const { id } = (req as any).validatedParams as { id: string };

      const existing = await prisma.session.findUnique({ where: { id } });
      if (!existing) {
        throw new AppError("Session not found", {
          status: 404,
          code: "NOT_FOUND",
        });
      }

      await prisma.session.delete({ where: { id } });

      sendOk(res, { id });
    } catch (error) {
      next(error);
    }
  },
);

export { router as sessionsRouter };
