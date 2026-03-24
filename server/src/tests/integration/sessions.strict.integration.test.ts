import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import app from "../../app";
import { registerAndLogin } from "../helpers/auth";
import { resetDb } from "../helpers/db";
import { createBookForUser, createSessionForUser } from "../helpers/factories";
import { createBook } from "../../modules/books/books.service";

describe("Sessions strict validation integration", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("rejects extra keys on create session", async () => {
    const user = await registerAndLogin();
    const book = await createBookForUser(user.user.id);

    const res = await request(app)
      .post("/api/sessions")
      .set("Authorization", `Bearer ${user.token}`)
      .send({
        bookId: book.id,
        pages: 15,
        date: "2026-03-23",
        hacked: true,
      });

    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("rejects extra keys on update session", async () => {
    const user = await registerAndLogin();
    const book = await createBookForUser(user.user.id);
    const session = await createSessionForUser({
      userId: user.user.id,
      bookId: book.id,
      pages: 10,
    });

    const res = await request(app)
      .patch(`/api/sessions/${session.id}`)
      .set("Authorization", `Bearer ${user.token}`)
      .send({
        pages: 20,
        badKey: "nope",
      });

    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
});
