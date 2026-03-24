import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import app from "../../app";
import { resetDb } from "../helpers/db";

describe("Auth strict validation integration", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("rejects extra keys on register", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "strict_register@example.com",
      password: "Password123!",
      role: "admin",
    });

    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details).toBeDefined();
  });

  it("rejects extra keys on login", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "strict_login@example.com",
      password: "Password123!",
      unexpected: true,
    });

    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details).toBeDefined();
  });
});
