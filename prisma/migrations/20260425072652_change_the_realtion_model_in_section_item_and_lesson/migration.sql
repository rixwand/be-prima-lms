/*
  Warnings:

  - You are about to drop the column `forumId` on the `SectionItem` table. All the data in the column will be lost.
  - You are about to drop the column `lessonId` on the `SectionItem` table. All the data in the column will be lost.
  - You are about to drop the column `quizId` on the `SectionItem` table. All the data in the column will be lost.
  - You are about to drop the column `durationSec` on the `lessons` table. All the data in the column will be lost.
  - You are about to drop the column `isPreview` on the `lessons` table. All the data in the column will be lost.
  - You are about to drop the column `publishedAt` on the `lessons` table. All the data in the column will be lost.
  - You are about to drop the column `removedAt` on the `lessons` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `lessons` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `lessons` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `SectionItem` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sectionItemId]` on the table `lessons` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `SectionItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `SectionItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `SectionItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sectionItemId` to the `lessons` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "SectionItem" DROP CONSTRAINT "SectionItem_lessonId_fkey";

-- DropIndex
DROP INDEX "SectionItem_lessonId_key";

-- AlterTable
ALTER TABLE "SectionItem" DROP COLUMN "forumId",
DROP COLUMN "lessonId",
DROP COLUMN "quizId",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isPreview" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "removedAt" TIMESTAMP(3),
ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "lessons" DROP COLUMN "durationSec",
DROP COLUMN "isPreview",
DROP COLUMN "publishedAt",
DROP COLUMN "removedAt",
DROP COLUMN "slug",
DROP COLUMN "title",
ADD COLUMN     "sectionItemId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "SectionItem_slug_key" ON "SectionItem"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "lessons_sectionItemId_key" ON "lessons"("sectionItemId");

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_sectionItemId_fkey" FOREIGN KEY ("sectionItemId") REFERENCES "SectionItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
