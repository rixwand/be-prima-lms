/*
  Warnings:

  - You are about to drop the column `position` on the `lessons` table. All the data in the column will be lost.
  - You are about to drop the column `sectionId` on the `lessons` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "SectionItemType" AS ENUM ('LESSON', 'QUIZ', 'FORUM');

-- DropForeignKey
ALTER TABLE "lessons" DROP CONSTRAINT "lessons_sectionId_fkey";

-- DropIndex
DROP INDEX "lessons_sectionId_position_key";

-- DropIndex
DROP INDEX "lessons_sectionId_slug_key";

-- AlterTable
ALTER TABLE "lessons" DROP COLUMN "position",
DROP COLUMN "sectionId";

-- CreateTable
CREATE TABLE "SectionItem" (
    "id" SERIAL NOT NULL,
    "sectionId" INTEGER NOT NULL,
    "type" "SectionItemType" NOT NULL,
    "position" INTEGER NOT NULL,
    "lessonId" INTEGER,
    "quizId" INTEGER,
    "forumId" INTEGER,

    CONSTRAINT "SectionItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SectionItem_lessonId_key" ON "SectionItem"("lessonId");

-- AddForeignKey
ALTER TABLE "SectionItem" ADD CONSTRAINT "SectionItem_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "course_sections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SectionItem" ADD CONSTRAINT "SectionItem_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE SET NULL ON UPDATE CASCADE;
