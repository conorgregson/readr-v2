import express from "express";
import cors from "cors";

import { booksRouter } from "./modules/books/books.router";
import { sessionsRouter } from "./modules/sessions/sessions.router";
import { errorHandler } from "./utils/http";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true, status: "healthy" });
});

app.use("/api/books", booksRouter);
app.use("/api/sessions", sessionsRouter);

app.use(errorHandler);

export default app;
