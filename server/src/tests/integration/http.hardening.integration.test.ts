import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import app from "../../app";
import { resetDb } from "../helpers/db";

describe("HTTP hardening integration", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("returns JSON 404 for unknown routes", async () => {
    const res = await request(app).get("/api/does-not-exist");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      ok: false,
      error: {
        message: "Route not found",
        code: "NOT_FOUND",
      },
    });
  });

  it("returns 400 for malformed JSON body", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .set("Content-Type", "application/json")
      .send('{"email":"broken@example.com","password":"Password123!"');

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      ok: false,
      error: {
        message: "Malformed JSON body",
        code: "BAD_REQUEST",
      },
    });
  });

  it("returns 413 when request body is too large", async () => {
    const hugePassword = "x".repeat(2_000_000);

    const res = await request(app).post("/api/auth/register").send({
      email: "large@example.com",
      password: hugePassword,
    });

    expect(res.status).toBe(413);
    expect(res.body).toEqual({
      ok: false,
      error: {
        message: "Request body too large",
        code: "REQUEST_TOO_LARGE",
      },
    });
  });
});
