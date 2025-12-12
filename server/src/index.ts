import express from "express";
import cors from "cors";
import { json } from "body-parser";
import type { Server } from "node:http";

import { booksRouter } from "./modules/books/books.router";
import { sessionsRouter } from "./modules/sessions/sessions.router";
import { errorHandler } from "./utils/http";

const app = express();

app.use(cors());
app.use(json());

app.get("/health", (_req, res) => {
  res.json({ ok: true, status: "healthy" });
});

app.use("/books", booksRouter);
app.use("/sessions", sessionsRouter);

app.use(errorHandler);

const PORT = Number(process.env.PORT ?? 4000);

let server: Server | undefined;
let shuttingDown = false;

async function shutdown(signal: string) {
  if (shuttingDown) return;
  shuttingDown = true;

  console.log(`[shutdown] Received ${signal}. Closing server...`);

  // Stop accepting new connections
  await new Promise<void>((resolve) => {
    if (!server) return resolve();
    server.close(() => resolve());
  });

  // If there is a shared Prisma client singleton somewhere, disconnect it here.
  // Example (if one is added later):
  // await prisma.$disconnect();

  console.log("[shutdown] Clean shutdown complete.");
  process.exit(0);
}

// In CI, Actions sends SIGTERM on cancellation; locally you’ll usually use SIGINT (Ctrl+C).
process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));

process.on("uncaughtException", (err) => {
  console.error("[fatal] uncaughtException", err);
  void shutdown("uncaughtException");
});

process.on("unhandledRejection", (err) => {
  console.error("[fatal] unhandledRejection", err);
  void shutdown("unhandledRejection");
});

server = app.listen(PORT, () => {
  console.log(`Readr v2 API listening on http://localhost:${PORT}`);
});
