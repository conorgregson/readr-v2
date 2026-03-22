import request from "supertest";
import app from "../../app";

export async function registerAndLogin(input?: {
  email?: string;
  password?: string;
}) {
  const email = input?.email ?? `test_${Date.now()}@example.com`;
  const password = input?.password ?? "Password123!";

  const registerRes = await request(app)
    .post("/api/auth/register")
    .send({ email, password });

  if (registerRes.status !== 201) {
    throw new Error(`Register failed: ${registerRes.status}`);
  }

  return {
    email,
    password,
    token: registerRes.body.data.token as string,
    user: registerRes.body.data.user as { id: string; email: string },
  };
}
