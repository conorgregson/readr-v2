import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import app from "../../app";
import { resetDb } from "../helpers/db";

describe("Auth integration", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("registers a user", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "auth_test@example.com",
      password: "Password123!",
    });

    expect(res.status).toBe(201);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.token).toBeTypeOf("string");
    expect(res.body.data.user.email).toBe("auth_test@example.com");
  });

  it("logs in a user", async () => {
    await request(app).post("/api/auth/register").send({
      email: "login_test@example.com",
      password: "Password123!",
    });

    const res = await request(app).post("/api/auth/login").send({
      email: "login_test@example.com",
      password: "Password123!",
    });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.token).toBeTypeOf("string");
  });

  it("requires auth for me", async () => {
    const res = await request(app).get("/api/auth/me");

    expect(res.status).toBe(401);
    expect(res.body.ok).toBe(false);
    expect(res.body.error.code).toBe("AUTH_UNAUTHORIZED");
  });

  it("returns the authenticated user for a valid token", async () => {
    const auth = await request(app).post("/api/auth/register").send({
      email: "me_test@example.com",
      password: "Password123!",
    });

    const token = auth.body.data.token as string;

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.user.email).toBe("me_test@example.com");
  });

  it("rejects duplicate email on register", async () => {
    await request(app).post("/api/auth/register").send({
      email: "duplicate_test@example.com",
      password: "Password123!",
    });

    const res = await request(app).post("/api/auth/register").send({
      email: "duplicate_test@example.com",
      password: "Password123!",
    });

    expect([400, 409]).toContain(res.status);
    expect(res.body.ok).toBe(false);
    expect(res.body.error).toBeDefined();
  });

  it("rejects invalid password on login", async () => {
    await request(app).post("/api/auth/register").send({
      email: "invalid_password_test@example.com",
      password: "Password123!",
    });

    const res = await request(app).post("/api/auth/login").send({
      email: "invalid_password_test@example.com",
      password: "WrongPassword123!",
    });

    expect([400, 401]).toContain(res.status);
    expect(res.body.ok).toBe(false);
    expect(res.body.error).toBeDefined();
  });
});
