/// <reference types="node" />

import "dotenv/config";
import {
  PrismaClient,
  BookStatus,
  SeriesType,
  FormatParent,
  FormatSubtype,
} from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const seedEmail = "seed@example.com";

  const user = await prisma.user.upsert({
    where: { email: seedEmail },
    update: {},
    create: {
      email: seedEmail,
      passwordHash: "seed-password-hash-placeholder",
    },
  });

  const count = await prisma.book.count({
    where: { userId: user.id },
  });

  if (count > 0) {
    console.log("Seed: books already exist for seed user, skipping.");
    return;
  }

  const book = await prisma.book.create({
    data: {
      userId: user.id,
      title: "Readr v2 Test Book",
      author: "Conor",
      status: BookStatus.reading,
      genre: "Productivity",
      seriesType: SeriesType.standalone,
      format: FormatParent.digital,
      formatSubtype: FormatSubtype.PDF,
      startedAt: new Date(),
      sessions: {
        create: [
          {
            userId: user.id,
            pages: 12,
            minutes: 25,
            notes: "First session logged via Prisma seed",
            date: new Date(),
          },
        ],
      },
    },
    include: { sessions: true },
  });

  console.log("Seeded user:", user.email);
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
