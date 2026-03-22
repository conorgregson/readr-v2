import express from "express";
import cors from "cors";

import { booksRouter } from "./modules/books/books.router";
import { sessionsRouter } from "./modules/sessions/sessions.router";
import { backupRouter } from "./modules/backup/backup.router";
import { errorHandler } from "./utils/http";

import { authRouter } from "./modules/auth/auth.router";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRouter);

app.get("/health", (_req, res) => {
  res.json({ ok: true, status: "healthy" });
});

app.use("/api/books", booksRouter);
app.use("/api/sessions", sessionsRouter);
app.use("/api/backup", backupRouter);

app.use(errorHandler);

export default app;
