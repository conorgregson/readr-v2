/*
  Warnings:

  - Added the required column `userId` to the `Book` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Book_author_idx";

-- DropIndex
DROP INDEX "Book_genre_idx";

-- DropIndex
DROP INDEX "Book_plannedMonth_idx";

-- DropIndex
DROP INDEX "Book_series_idx";

-- DropIndex
DROP INDEX "Book_status_idx";

-- DropIndex
DROP INDEX "Book_title_idx";

-- DropIndex
DROP INDEX "Session_date_idx";

-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "Book_userId_idx" ON "Book"("userId");

-- CreateIndex
CREATE INDEX "Book_userId_status_idx" ON "Book"("userId", "status");

-- CreateIndex
CREATE INDEX "Book_userId_title_idx" ON "Book"("userId", "title");

-- CreateIndex
CREATE INDEX "Book_userId_author_idx" ON "Book"("userId", "author");

-- CreateIndex
CREATE INDEX "Book_userId_genre_idx" ON "Book"("userId", "genre");

-- CreateIndex
CREATE INDEX "Book_userId_series_idx" ON "Book"("userId", "series");

-- CreateIndex
CREATE INDEX "Book_userId_plannedMonth_idx" ON "Book"("userId", "plannedMonth");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_userId_date_idx" ON "Session"("userId", "date");

-- CreateIndex
CREATE INDEX "Session_userId_bookId_idx" ON "Session"("userId", "bookId");

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
