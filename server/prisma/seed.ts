/// <reference types="node" />

import "dotenv/config";
import { PrismaClient, BookStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const count = await prisma.book.count();
  if (count > 0) {
    console.log("Seed: books already exist, skipping.");
    return;
  }

  const book = await prisma.book.create({
    data: {
      title: "Readr v2 Test Book",
      author: "Conor",
      status: BookStatus.READING,
      genre: "Productivity",
      pageCount: 300,
      currentPage: 25,
      sessions: {
        create: [
          {
            minutes: 25,
            notes: "First session logged via Prisma seed",
            date: new Date(),
          },
        ],
      },
    },
    include: { sessions: true },
  });

  console.log("Seeded book:", book);
}

main()
  .catch((error) => {
    console.error("Seed error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
