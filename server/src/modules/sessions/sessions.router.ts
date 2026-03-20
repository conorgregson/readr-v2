import { Router } from "express";
import { prisma } from "../../db/client";
import {
  CreateSessionSchema,
  ListSessionsQuerySchema,
  RestoreSessionSchema,
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
import { requireAuth } from "../../middleware/require-auth";

function normalizeNotes(notes: string | null | undefined) {
  return notes && notes.length > 0 ? notes : null;
}

async function requireOwnedBook(userId: string, bookId: string) {
  const book = await prisma.book.findFirst({
    where: {
      id: bookId,
      userId,
    },
    select: {
      id: true,
    },
  });

  if (!book) {
    throw new AppError("Book not found for this session", {
      status: 404,
      code: "NOT_FOUND",
    });
  }

  return book;
}

const router = Router();

router.use(requireAuth);

// GET /api/sessions
router.get(
  "/",
  validateQuery(ListSessionsQuerySchema),
  async (req, res, next) => {
    try {
      const userId = req.auth!.userId;
      const { bookId, search, from, to, limit, offset } =
        (req as any).validatedQuery ?? {};

      if (bookId) {
        await requireOwnedBook(userId, bookId);
      }

      const where: any = {
        userId,
      };

      if (bookId) where.bookId = bookId;

      if (from || to) {
        where.date = {};
        if (from) where.date.gte = from;
        if (to) where.date.lte = to;
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

      const sessions = await prisma.session.findMany({
        where,
        orderBy: [{ date: "desc" }, { createdAt: "desc" }, { id: "desc" }],
        skip: offset ?? 0,
        take: limit ?? 50,
      });

      const mapped = sessions.map((s) => ({
        ...s,
        pages: s.pages ?? null,
        minutes: s.minutes ?? null,
        notes: normalizeNotes(s.notes),
        date: s.date.toISOString(),
        createdAt: s.createdAt.toISOString(),
        updatedAt: s.updatedAt.toISOString(),
      }));

      const response = SessionListResponseSchema.parse(mapped);
      sendOk(res, response);
    } catch (error) {
      next(error);
    }
  },
);

// POST /api/sessions/restore
router.post(
  "/restore",
  validateBody(RestoreSessionSchema),
  async (req, res, next) => {
    try {
      const userId = req.auth!.userId;
      const body = (req as any).validatedBody;

      await requireOwnedBook(userId, body.bookId);

      const existing = await prisma.session.findFirst({
        where: {
          id: body.id,
          userId,
        },
      });

      if (existing) {
        const response = SessionResponseSchema.parse({
          ...existing,
          pages: existing.pages ?? null,
          minutes: existing.minutes ?? null,
          notes: normalizeNotes(existing.notes),
          date: existing.date.toISOString(),
          createdAt: existing.createdAt.toISOString(),
          updatedAt: existing.updatedAt.toISOString(),
        });

        sendOk(res, response);
        return;
      }

      const restored = await prisma.session.create({
        data: {
          id: body.id,
          userId,
          bookId: body.bookId,
          pages: body.pages ?? null,
          minutes: body.minutes ?? null,
          notes: body.notes ?? null,
          date: body.date,
          createdAt: new Date(body.createdAt),
          updatedAt: new Date(body.updatedAt),
        },
      });

      const response = SessionResponseSchema.parse({
        ...restored,
        pages: restored.pages ?? null,
        minutes: restored.minutes ?? null,
        notes: normalizeNotes(restored.notes),
        date: restored.date.toISOString(),
        createdAt: restored.createdAt.toISOString(),
        updatedAt: restored.updatedAt.toISOString(),
      });

      sendCreated(res, response);
    } catch (error) {
      next(error);
    }
  },
);

// GET /api/sessions/:id
router.get(
  "/:id",
  validateParams(SessionIdParamSchema),
  async (req, res, next) => {
    try {
      const userId = req.auth!.userId;
      const { id } = (req as any).validatedParams as { id: string };

      const session = await prisma.session.findFirst({
        where: { id, userId },
      });

      if (!session) {
        throw new AppError("Session not found", {
          status: 404,
          code: "NOT_FOUND",
        });
      }

      const response = SessionResponseSchema.parse({
        ...session,
        pages: session.pages ?? null,
        minutes: session.minutes ?? null,
        notes: normalizeNotes(session.notes),
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

// POST /api/sessions
router.post("/", validateBody(CreateSessionSchema), async (req, res, next) => {
  try {
    const userId = req.auth!.userId;
    const body = (req as any).validatedBody;

    const book = await requireOwnedBook(userId, body.bookId);

    const created = await prisma.session.create({
      data: {
        userId,
        bookId: book.id,
        pages: body.pages ?? null,
        minutes: body.minutes ?? null,
        notes: body.notes ?? null,
        date: body.date,
      },
    });

    const response = SessionResponseSchema.parse({
      ...created,
      pages: created.pages ?? null,
      minutes: created.minutes ?? null,
      notes: normalizeNotes(created.notes),
      date: created.date.toISOString(),
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    });

    sendCreated(res, response);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/sessions/:id
router.patch(
  "/:id",
  validateParams(SessionIdParamSchema),
  validateBody(UpdateSessionSchema),
  async (req, res, next) => {
    try {
      const userId = req.auth!.userId;
      const { id } = (req as any).validatedParams as { id: string };
      const body = (req as any).validatedBody;

      const existing = await prisma.session.findFirst({
        where: { id, userId },
      });

      if (!existing) {
        throw new AppError("Session not found", {
          status: 404,
          code: "NOT_FOUND",
        });
      }

      const nextBookId = body.bookId ?? existing.bookId;

      await requireOwnedBook(userId, nextBookId);

      const nextPages = body.pages !== undefined ? body.pages : existing.pages;
      const nextMinutes =
        body.minutes !== undefined ? body.minutes : existing.minutes;

      if (nextPages == null && nextMinutes == null) {
        throw new AppError("Validation failed", {
          status: 400,
          code: "VALIDATION_ERROR",
          details: {
            _errors: [],
            pages: {
              _errors: ["At least one of pages or minutes must be provided"],
            },
          },
        });
      }

      const updated = await prisma.session.update({
        where: { id },
        data: {
          userId,
          bookId: nextBookId,
          pages: nextPages,
          minutes: nextMinutes,
          notes: body.notes !== undefined ? body.notes : existing.notes,
          date: body.date ?? existing.date,
        },
      });

      const response = SessionResponseSchema.parse({
        ...updated,
        pages: updated.pages ?? null,
        minutes: updated.minutes ?? null,
        notes: normalizeNotes(updated.notes),
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

// DELETE /api/sessions/:id
router.delete(
  "/:id",
  validateParams(SessionIdParamSchema),
  async (req, res, next) => {
    try {
      const userId = req.auth!.userId;
      const { id } = (req as any).validatedParams as { id: string };

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

      await prisma.session.delete({ where: { id: existing.id } });

      sendOk(res, { id: existing.id });
    } catch (error) {
      next(error);
    }
  },
);

export { router as sessionsRouter };
