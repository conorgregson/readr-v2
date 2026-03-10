/*
  Warnings:

  - The values [PLANNED,READING,FINISHED,ABANDONED] on the enum `BookStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `currentPage` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `pageCount` on the `Book` table. All the data in the column will be lost.
  - Made the column `author` on table `Book` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "SeriesType" AS ENUM ('series', 'standalone');

-- CreateEnum
CREATE TYPE "FormatParent" AS ENUM ('digital', 'physical');

-- CreateEnum
CREATE TYPE "FormatSubtype" AS ENUM ('Hardcover', 'Paperback', 'ebook', 'Audiobook', 'PDF');

-- AlterEnum
BEGIN;
CREATE TYPE "BookStatus_new" AS ENUM ('planned', 'reading', 'finished');
ALTER TABLE "public"."Book" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Book" ALTER COLUMN "status" TYPE "BookStatus_new" USING ("status"::text::"BookStatus_new");
ALTER TYPE "BookStatus" RENAME TO "BookStatus_old";
ALTER TYPE "BookStatus_new" RENAME TO "BookStatus";
DROP TYPE "public"."BookStatus_old";
ALTER TABLE "Book" ALTER COLUMN "status" SET DEFAULT 'planned';
COMMIT;

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_bookId_fkey";

-- AlterTable
ALTER TABLE "Book" DROP COLUMN "currentPage",
DROP COLUMN "pageCount",
ADD COLUMN     "finishedAt" TIMESTAMP(3),
ADD COLUMN     "format" "FormatParent",
ADD COLUMN     "formatSubtype" "FormatSubtype",
ADD COLUMN     "isbn" TEXT,
ADD COLUMN     "plannedMonth" TEXT,
ADD COLUMN     "series" TEXT,
ADD COLUMN     "seriesType" "SeriesType",
ADD COLUMN     "startedAt" TIMESTAMP(3),
ALTER COLUMN "author" SET NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'planned';

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "pages" INTEGER,
ALTER COLUMN "minutes" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Book_author_idx" ON "Book"("author");

-- CreateIndex
CREATE INDEX "Book_genre_idx" ON "Book"("genre");

-- CreateIndex
CREATE INDEX "Book_series_idx" ON "Book"("series");

-- CreateIndex
CREATE INDEX "Book_plannedMonth_idx" ON "Book"("plannedMonth");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;
