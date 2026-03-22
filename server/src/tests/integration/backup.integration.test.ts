import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import app from "../../app";
import { prisma } from "../../db/client";
import { registerAndLogin } from "../helpers/auth";
import { resetDb } from "../helpers/db";
import { createBookForUser, createSessionForUser } from "../helpers/factories";

describe("Backup integration", () => {
  beforeEach(async () => {
    await resetDb();
  });

  describe("GET /api/backup/export", () => {
    it("requires auth", async () => {
      const res = await request(app).get("/api/backup/export");

      expect(res.status).toBe(401);
      expect(res.body.ok).toBe(false);
      expect(res.body.error.code).toBe("AUTH_UNAUTHORIZED");
    });

    it("returns only the authenticated user's books and sessions", async () => {
      const userA = await registerAndLogin({ email: "a@example.com" });
      const userB = await registerAndLogin({ email: "b@example.com" });

      const bookA = await createBookForUser(userA.user.id, {
        title: "User A Book",
      });
      await createSessionForUser({
        userId: userA.user.id,
        bookId: bookA.id,
        pages: 20,
      });

      const bookB = await createBookForUser(userB.user.id, {
        title: "User B Book",
      });
      await createSessionForUser({
        userId: userB.user.id,
        bookId: bookB.id,
        pages: 30,
      });

      const res = await request(app)
        .get("/api/backup/export")
        .set("Authorization", `Bearer ${userA.token}`);

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data.books).toHaveLength(1);
      expect(res.body.data.sessions).toHaveLength(1);
      expect(res.body.data.books[0].title).toBe("User A Book");
    });
  });

  describe("POST /api/backup/import", () => {
    it("imports a valid payload", async () => {
      const user = await registerAndLogin();

      const payload = {
        version: "2.3",
        books: [
          {
            id: "import-book-1",
            title: "Imported Book",
            author: "Imported Author",
            status: "planned",
          },
        ],
        sessions: [
          {
            bookId: "import-book-1",
            date: "2026-03-15",
            pages: 10,
          },
        ],
      };

      const res = await request(app)
        .post("/api/backup/import")
        .set("Authorization", `Bearer ${user.token}`)
        .send(payload);

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data.importedBooks).toBe(1);
      expect(res.body.data.importedSessions).toBe(1);

      const books = await prisma.book.findMany({
        where: { userId: user.user.id },
      });
      const sessions = await prisma.session.findMany({
        where: { userId: user.user.id },
      });

      expect(books).toHaveLength(1);
      expect(sessions).toHaveLength(1);
      expect(books[0].title).toBe("Imported Book");
    });

    it("rejects duplicate imported book ids", async () => {
      const user = await registerAndLogin();

      const payload = {
        version: "2.3",
        books: [
          {
            id: "dup-id",
            title: "Book One",
            author: "Author One",
            status: "planned",
          },
          {
            id: "dup-id",
            title: "Book Two",
            author: "Author Two",
            status: "reading",
          },
        ],
        sessions: [],
      };

      const res = await request(app)
        .post("/api/backup/import")
        .set("Authorization", `Bearer ${user.token}`)
        .send(payload);

      expect(res.status).toBe(400);
      expect(res.body.ok).toBe(false);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("rejects orphan session references and rolls back", async () => {
      const user = await registerAndLogin();

      const payload = {
        version: "2.3",
        books: [
          {
            id: "book-1",
            title: "Valid Book",
            author: "Author",
            status: "planned",
          },
        ],
        sessions: [
          {
            bookId: "missing-book",
            date: "2026-03-15",
            pages: 10,
          },
        ],
      };

      const res = await request(app)
        .post("/api/backup/import")
        .set("Authorization", `Bearer ${user.token}`)
        .send(payload);

      expect(res.status).toBe(400);
      expect(res.body.ok).toBe(false);

      const books = await prisma.book.findMany({
        where: { userId: user.user.id },
      });
      const sessions = await prisma.session.findMany({
        where: { userId: user.user.id },
      });

      expect(books).toHaveLength(0);
      expect(sessions).toHaveLength(0);
    });

    it("assigns imported records to the authenticated user only", async () => {
      const user = await registerAndLogin();

      const payload = {
        version: "2.3",
        books: [
          {
            id: "book-1",
            userId: "foreign-user",
            title: "Imported Book",
            author: "Author",
            status: "planned",
          },
        ],
        sessions: [
          {
            bookId: "book-1",
            userId: "foreign-user",
            date: "2026-03-15",
            pages: 10,
          },
        ],
      };

      const res = await request(app)
        .post("/api/backup/import")
        .set("Authorization", `Bearer ${user.token}`)
        .send(payload);

      expect(res.status).toBe(200);

      const books = await prisma.book.findMany({
        where: { userId: user.user.id },
      });
      const sessions = await prisma.session.findMany({
        where: { userId: user.user.id },
      });

      expect(books).toHaveLength(1);
      expect(sessions).toHaveLength(1);
      expect(books[0].userId).toBe(user.user.id);
      expect(sessions[0].userId).toBe(user.user.id);
    });
  });
});
