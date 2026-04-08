import type { Server } from "node:http";

import app from "./app";
import { env } from "./config/env";
import { prisma } from "./db/client";

const port = env.PORT;

let server: Server | undefined;
let shuttingDown = false;

async function shutdown(signal: string) {
  if (shuttingDown) return;
  shuttingDown = true;

  console.log(`[shutdown] Received ${signal}. Closing server...`);

  const forceTimer = setTimeout(() => {
    console.error("[shutdown] Force exit after timeout");
    process.exit(1);
  }, 10_000);

  try {
    await new Promise<void>((resolve) => {
      if (!server) return resolve();
      server.close(() => resolve());
    });

    await prisma.$disconnect();

    console.log("[shutdown] Clean shutdown complete.");
    process.exitCode = 0;
  } catch (err) {
    console.error("[shutdown] Error during shutdown", err);
    process.exitCode = 1;
  } finally {
    clearTimeout(forceTimer);
  }
}

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

server = app.listen(port, () => {
  console.log(`Readr API listening on port ${port}`);
});
