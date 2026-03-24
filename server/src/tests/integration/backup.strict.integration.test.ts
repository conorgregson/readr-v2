import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import app from "../../app";
import { registerAndLogin } from "../helpers/auth";
import { resetDb } from "../helpers/db";

describe("Backup strict validation integration", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("rejects extra keys on backup import root payload", async () => {
    const user = await registerAndLogin();

    const res = await request(app)
      .post("/api/backup/import")
      .set("Authorization", `Bearer ${user.token}`)
      .send({
        version: "2.3",
        books: [],
        sessions: [],
        unexpected: "not-allowed",
      });

    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("rejects extra keys inside imported book objects", async () => {
    const user = await registerAndLogin();

    const res = await request(app)
      .post("/api/backup/import")
      .set("Authorization", `Bearer ${user.token}`)
      .send({
        version: "2.3",
        books: [
          {
            id: "book-1",
            title: "Imported Book",
            author: "Imported Author",
            status: "planned",
            userId: "foreign-user",
          },
        ],
        sessions: [],
      });

    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("rejects extra keys inside imported session objects", async () => {
    const user = await registerAndLogin();

    const res = await request(app)
      .post("/api/backup/import")
      .set("Authorization", `Bearer ${user.token}`)
      .send({
        version: "2.3",
        books: [
          {
            id: "book-1",
            title: "Imported Book",
            author: "Imported Author",
            status: "planned",
          },
        ],
        sessions: [
          {
            bookId: "book-1",
            date: "2026-03-15",
            pages: 10,
            userId: "foreign-user",
          },
        ],
      });

    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
});
