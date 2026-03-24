import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import app from "../../app";
import { registerAndLogin } from "../helpers/auth";
import { resetDb } from "../helpers/db";
import { createBookForUser } from "../helpers/factories";

describe("Books strict validation integration", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("rejects extra keys on create book", async () => {
    const user = await registerAndLogin();

    const res = await request(app)
      .post("/api/books")
      .set("Authorization", `Bearer ${user.token}`)
      .send({
        title: "Strict Book",
        author: "Strict Author",
        userId: "not-allowed",
      });

    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("rejects extra keys on update book", async () => {
    const user = await registerAndLogin();
    const book = await createBookForUser(user.user.id);

    const res = await request(app)
      .patch(`/api/books/${book.id}`)
      .set("Authorization", `Bearer ${user.token}`)
      .send({
        title: "Updated Title",
        injected: "bad-field",
      });

    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
});
