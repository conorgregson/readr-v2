import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom", // safe default for React projects
    globals: true,
    include: ["src/**/*.test.ts"],
  },
});
