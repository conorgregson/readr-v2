import { prisma } from "../../db/client";

function assertTestDatabase() {
  const url = process.env.DATABASE_URL ?? "";
  if (!url.includes("test")) {
    throw new Error(
      "Refusing to reset database because DATABASE_URL does not appear to be a test database.",
    );
  }
}

export async function resetDb() {
  assertTestDatabase();

  await prisma.session.deleteMany();
  await prisma.book.deleteMany();
  await prisma.user.deleteMany();
}
