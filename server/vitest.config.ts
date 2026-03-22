import { defineConfig } from "vitest/config";
import { config } from "dotenv";

config({ path: ".env.test" });

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["src/tests/**/*.test.ts"],
    clearMocks: true,
    restoreMocks: true,
    fileParallelism: false,
    setupFiles: ["src/tests/setup.ts"],
  },
});
