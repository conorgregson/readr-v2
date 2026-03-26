import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import app from "../../app";
import { prisma } from "../../db/client";
import { registerAndLogin } from "../helpers/auth";
import { resetDb } from "../helpers/db";
import { createBookForUser, createSessionForUser } from "../helpers/factories";

describe("Sessions integration", () => {
  beforeEach(async () => {
    await resetDb();
  });

  describe("GET /api/sessions", () => {
    it("requires auth", async () => {
      const res = await request(app).get("/api/sessions");

      expect(res.status).toBe(401);
      expect(res.body.ok).toBe(false);
      expect(res.body.error.code).toBe("AUTH_UNAUTHORIZED");
    });

    it("returns only the authenticated user's sessions", async () => {
      const userA = await registerAndLogin({ email: "sessions_a@example.com" });
      const userB = await registerAndLogin({ email: "sessions_b@example.com" });

      const bookA = await createBookForUser(userA.user.id, {
        title: "User A Book",
      });
      const bookB = await createBookForUser(userB.user.id, {
        title: "User B Book",
      });

      await createSessionForUser({
        userId: userA.user.id,
        bookId: bookA.id,
        pages: 10,
      });

      await createSessionForUser({
        userId: userB.user.id,
        bookId: bookB.id,
        pages: 20,
      });

      const res = await request(app)
        .get("/api/sessions")
        .set("Authorization", `Bearer ${userA.token}`);

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].bookId).toBe(bookA.id);
    });

    it("rejects listing sessions for another user's bookId", async () => {
      const userA = await registerAndLogin({ email: "list_a@example.com" });
      const userB = await registerAndLogin({ email: "list_b@example.com" });

      const foreignBook = await createBookForUser(userB.user.id);

      const res = await request(app)
        .get(`/api/sessions?bookId=${foreignBook.id}`)
        .set("Authorization", `Bearer ${userA.token}`);

      expect(res.status).toBe(404);
      expect(res.body.ok).toBe(false);
      expect(res.body.error.code).toBe("NOT_FOUND");
    });
  });

  describe("GET /api/sessions/:id", () => {
    it("rejects access to another user's session", async () => {
      const userA = await registerAndLogin({ email: "get_a@example.com" });
      const userB = await registerAndLogin({ email: "get_b@example.com" });

      const bookB = await createBookForUser(userB.user.id);
      const foreignSession = await createSessionForUser({
        userId: userB.user.id,
        bookId: bookB.id,
        pages: 15,
      });

      const res = await request(app)
        .get(`/api/sessions/${foreignSession.id}`)
        .set("Authorization", `Bearer ${userA.token}`);

      expect(res.status).toBe(404);
      expect(res.body.ok).toBe(false);
      expect(res.body.error.code).toBe("NOT_FOUND");
    });
  });

  describe("POST /api/sessions", () => {
    it("creates a session for an owned book", async () => {
      const user = await registerAndLogin();
      const book = await createBookForUser(user.user.id);

      const res = await request(app)
        .post("/api/sessions")
        .set("Authorization", `Bearer ${user.token}`)
        .send({
          bookId: book.id,
          pages: 12,
          date: "2026-03-23",
        });

      expect(res.status).toBe(201);
      expect(res.body.ok).toBe(true);
      expect(res.body.data.bookId).toBe(book.id);

      const sessions = await prisma.session.findMany({
        where: { userId: user.user.id },
      });

      expect(sessions).toHaveLength(1);
      expect(sessions[0].bookId).toBe(book.id);
    });

    it("rejects creating a session for another user's book", async () => {
      const userA = await registerAndLogin({ email: "create_a@example.com" });
      const userB = await registerAndLogin({ email: "create_b@example.com" });

      const foreignBook = await createBookForUser(userB.user.id);

      const res = await request(app)
        .post("/api/sessions")
        .set("Authorization", `Bearer ${userA.token}`)
        .send({
          bookId: foreignBook.id,
          pages: 10,
          date: "2026-03-23",
        });

      expect(res.status).toBe(404);
      expect(res.body.ok).toBe(false);
      expect(res.body.error.code).toBe("NOT_FOUND");
    });
  });

  describe("PATCH /api/sessions/:id", () => {
    it("rejects updates to another user's session", async () => {
      const userA = await registerAndLogin({ email: "patch_a@example.com" });
      const userB = await registerAndLogin({ email: "patch_b@example.com" });

      const bookB = await createBookForUser(userB.user.id);
      const foreignSession = await createSessionForUser({
        userId: userB.user.id,
        bookId: bookB.id,
        pages: 10,
      });

      const res = await request(app)
        .patch(`/api/sessions/${foreignSession.id}`)
        .set("Authorization", `Bearer ${userA.token}`)
        .send({
          pages: 25,
        });

      expect(res.status).toBe(404);
      expect(res.body.ok).toBe(false);
      expect(res.body.error.code).toBe("NOT_FOUND");
    });

    it("rejects moving a session onto another user's book", async () => {
      const userA = await registerAndLogin({ email: "move_a@example.com" });
      const userB = await registerAndLogin({ email: "move_b@example.com" });

      const ownedBook = await createBookForUser(userA.user.id);
      const foreignBook = await createBookForUser(userB.user.id);

      const session = await createSessionForUser({
        userId: userA.user.id,
        bookId: ownedBook.id,
        pages: 10,
      });

      const res = await request(app)
        .patch(`/api/sessions/${session.id}`)
        .set("Authorization", `Bearer ${userA.token}`)
        .send({
          bookId: foreignBook.id,
        });

      expect(res.status).toBe(404);
      expect(res.body.ok).toBe(false);
      expect(res.body.error.code).toBe("NOT_FOUND");
    });
  });

  describe("DELETE /api/sessions/:id", () => {
    it("rejects deletes of another user's session", async () => {
      const userA = await registerAndLogin({ email: "delete_a@example.com" });
      const userB = await registerAndLogin({ email: "delete_b@example.com" });

      const bookB = await createBookForUser(userB.user.id);
      const foreignSession = await createSessionForUser({
        userId: userB.user.id,
        bookId: bookB.id,
        pages: 18,
      });

      const res = await request(app)
        .delete(`/api/sessions/${foreignSession.id}`)
        .set("Authorization", `Bearer ${userA.token}`);

      expect(res.status).toBe(404);
      expect(res.body.ok).toBe(false);
      expect(res.body.error.code).toBe("NOT_FOUND");
    });
  });
});
