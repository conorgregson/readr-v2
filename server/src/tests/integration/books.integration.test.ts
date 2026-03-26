import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import app from "../../app";
import { prisma } from "../../db/client";
import { registerAndLogin } from "../helpers/auth";
import { resetDb } from "../helpers/db";
import { createBookForUser } from "../helpers/factories";

describe("Books integration", () => {
  beforeEach(async () => {
    await resetDb();
  });

  describe("GET /api/books", () => {
    it("requires auth", async () => {
      const res = await request(app).get("/api/books");

      expect(res.status).toBe(401);
      expect(res.body.ok).toBe(false);
      expect(res.body.error.code).toBe("AUTH_UNAUTHORIZED");
    });

    it("returns only the authenticated user's books", async () => {
      const userA = await registerAndLogin({ email: "books_a@example.com" });
      const userB = await registerAndLogin({ email: "books_b@example.com" });

      await createBookForUser(userA.user.id, {
        title: "User A Book",
        author: "Author A",
      });

      await createBookForUser(userB.user.id, {
        title: "User B Book",
        author: "Author B",
      });

      const res = await request(app)
        .get("/api/books")
        .set("Authorization", `Bearer ${userA.token}`);

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].title).toBe("User A Book");
    });
  });

  describe("POST /api/books", () => {
    it("creates a book for the authenticated user", async () => {
      const user = await registerAndLogin();

      const res = await request(app)
        .post("/api/books")
        .set("Authorization", `Bearer ${user.token}`)
        .send({
          title: "Created Book",
          author: "Created Author",
          status: "planned",
        });

      expect(res.status).toBe(201);
      expect(res.body.ok).toBe(true);
      expect(res.body.data.title).toBe("Created Book");

      const books = await prisma.book.findMany({
        where: { userId: user.user.id },
      });

      expect(books).toHaveLength(1);
      expect(books[0].title).toBe("Created Book");
    });
  });

  describe("PATCH /api/books/:id", () => {
    it("rejects updates to another user's book", async () => {
      const userA = await registerAndLogin({ email: "patch_a@example.com" });
      const userB = await registerAndLogin({ email: "patch_b@example.com" });

      const foreignBook = await createBookForUser(userB.user.id, {
        title: "Foreign Book",
      });

      const res = await request(app)
        .patch(`/api/books/${foreignBook.id}`)
        .set("Authorization", `Bearer ${userA.token}`)
        .send({
          title: "Hacked Title",
        });

      expect(res.status).toBe(404);
      expect(res.body.ok).toBe(false);
      expect(res.body.error.code).toBe("NOT_FOUND");

      const book = await prisma.book.findUnique({
        where: { id: foreignBook.id },
      });

      expect(book?.title).toBe("Foreign Book");
    });
  });

  describe("DELETE /api/books/:id", () => {
    it("rejects deletes of another user's book", async () => {
      const userA = await registerAndLogin({ email: "delete_a@example.com" });
      const userB = await registerAndLogin({ email: "delete_b@example.com" });

      const foreignBook = await createBookForUser(userB.user.id, {
        title: "Foreign Book",
      });

      const res = await request(app)
        .delete(`/api/books/${foreignBook.id}`)
        .set("Authorization", `Bearer ${userA.token}`);

      expect(res.status).toBe(404);
      expect(res.body.ok).toBe(false);
      expect(res.body.error.code).toBe("NOT_FOUND");

      const book = await prisma.book.findUnique({
        where: { id: foreignBook.id },
      });

      expect(book).not.toBeNull();
    });
  });
});
