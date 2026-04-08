import type { Server } from "node:http";

import app from "./app";
import { env } from "./config/env";
import { prisma } from "./db/client";

const port = env.PORT;

let server: Server | undefined;
let shuttingDown = false;

function logInfo(message: string, meta?: Record<string, unknown>) {
  if (meta) {
    console.log(message, meta);
    return;
  }

  console.log(message);
}

function logError(message: string, meta?: Record<string, unknown>) {
  if (meta) {
    console.error(message, meta);
    return;
  }

  console.error(message);
}

async function shutdown(signal: string) {
  if (shuttingDown) return;
  shuttingDown = true;

  logInfo("[shutdown] Shutdown initiated", { signal });

  const forceTimer = setTimeout(() => {
    logError("[shutdown] Force exit after timeout", { timeoutMs: 10_000 });
    process.exit(1);
  }, 10_000);

  try {
    await new Promise<void>((resolve) => {
      if (!server) return resolve();
      server.close(() => resolve());
    });

    await prisma.$disconnect();

    logInfo("[shutdown] Clean shutdown complete");
    process.exitCode = 0;
  } catch (err) {
    logError("[shutdown] Error during shutdown", { err });
    process.exitCode = 1;
  } finally {
    clearTimeout(forceTimer);
  }
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));

process.on("uncaughtException", (err) => {
  logError("[fatal] uncaughtException", { err });
  void shutdown("uncaughtException");
});

process.on("unhandledRejection", (err) => {
  logError("[fatal] unhandledRejection", { err });
  void shutdown("unhandledRejection");
});

async function start() {
  try {
    logInfo("[startup] Booting Readr API", {
      env: env.NODE_ENV,
      port,
    });

    await prisma.$connect();

    logInfo("[startup] Database connection established");

    server = app.listen(port, () => {
      logInfo("[startup] Readr API ready", {
        port,
        env: env.NODE_ENV,
      });
    });
  } catch (err) {
    logError("[startup] Failed to start server", { err });
    process.exit(1);
  }
}

void start();
