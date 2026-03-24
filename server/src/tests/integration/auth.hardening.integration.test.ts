import request from "supertest";
import jwt from "jsonwebtoken";
import { beforeEach, describe, expect, it } from "vitest";

import app from "../../app";
import { env } from "../../config/env";
import { resetDb } from "../helpers/db";

describe("Auth hardening integration", () => {
  beforeEach(async () => {
    await resetDb();
  });

  describe("GET /api/auth/me", () => {
    it("returns 401 when Authorization header is missing", async () => {
      const res = await request(app).get("/api/auth/me");

      expect(res.status).toBe(401);
      expect(res.body).toEqual({
        ok: false,
        error: {
          message: "Unauthorized",
          code: "AUTH_UNAUTHORIZED",
        },
      });
    });

    it("returns 401 for malformed Authorization header", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "BadHeaderValue");

      expect(res.status).toBe(401);
      expect(res.body).toEqual({
        ok: false,
        error: {
          message: "Unauthorized",
          code: "AUTH_UNAUTHORIZED",
        },
      });
    });

    it("returns 401 for invalid JWT", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Bearer definitely-not-a-real-token");

      expect(res.status).toBe(401);
      expect(res.body).toEqual({
        ok: false,
        error: {
          message: "Unauthorized",
          code: "AUTH_UNAUTHORIZED",
        },
      });
    });

    it("returns 401 for expired JWT", async () => {
      const expiredToken = jwt.sign(
        {
          sub: "test-user-id",
          email: "test@example.com",
        },
        env.JWT_SECRET,
        { expiresIn: "-1s" },
      );

      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${expiredToken}`);

      expect(res.status).toBe(401);
      expect(res.body).toEqual({
        ok: false,
        error: {
          message: "Unauthorized",
          code: "AUTH_UNAUTHORIZED",
        },
      });
    });

    it("returns 401 for token signed with wrong secret", async () => {
      const invalidSignatureToken = jwt.sign(
        { sub: "test-user-id", email: "test@example.com" },
        "wrong-secret",
        { expiresIn: "1h" },
      );

      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${invalidSignatureToken}`);

      expect(res.status).toBe(401);
      expect(res.body).toEqual({
        ok: false,
        error: {
          message: "Unauthorized",
          code: "AUTH_UNAUTHORIZED",
        },
      });
    });

    it("returns 401 for token with invalid payload shape", async () => {
      const badPayloadToken = jwt.sign(
        { email: "test@example.com" },
        env.JWT_SECRET,
        { expiresIn: "1h" },
      );

      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${badPayloadToken}`);

      expect(res.status).toBe(401);
      expect(res.body).toEqual({
        ok: false,
        error: {
          message: "Unauthorized",
          code: "AUTH_UNAUTHORIZED",
        },
      });
    });
  });
});
