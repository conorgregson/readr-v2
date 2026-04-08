import express from "express";
import cors from "cors";

import { booksRouter } from "./modules/books/books.router";
import { sessionsRouter } from "./modules/sessions/sessions.router";
import { backupRouter } from "./modules/backup/backup.router";
import { authRouter } from "./modules/auth/auth.router";

import { env } from "./config/env";
import { AppError } from "./utils/errors";
import { errorHandler, notFoundHandler } from "./utils/http";
import { savedViewsRouter } from "./modules/saved-views/saved-views.routes";

import { statsRouter } from "./modules/stats/stats.router";
import { engagementRouter } from "./modules/engagement/engagement.router";

const app = express();

app.disable("x-powered-by");

const isAllowedOrigin = (origin: string): boolean =>
  env.CORS_ALLOWED_ORIGINS.includes(origin);

app.use(
  cors({
    origin(origin, callback) {
      // allow non-browser tools like Postman/curl
      if (!origin) return callback(null, true);

      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }

      return callback(
        new AppError("CORS origin not allowed", {
          status: 403,
          code: "FORBIDDEN",
          context: {
            origin,
          },
        }),
      );
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.status(200).json({
    ok: true,
    status: "healthy",
    service: "readr-api",
    env: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRouter);
app.use("/api/books", booksRouter);
app.use("/api/sessions", sessionsRouter);
app.use("/api/stats", statsRouter);
app.use("/api/engagement", engagementRouter);
app.use("/api/backup", backupRouter);
app.use("/api/saved-views", savedViewsRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
