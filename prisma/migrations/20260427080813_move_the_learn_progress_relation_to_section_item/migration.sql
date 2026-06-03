/*
  Warnings:

  - You are about to drop the column `lessonId` on the `lesson_progress` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[sectionItemId,enrollmentId]` on the table `lesson_progress` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `sectionItemId` to the `lesson_progress` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "lesson_progress" DROP CONSTRAINT "lesson_progress_lessonId_fkey";

-- DropIndex
DROP INDEX "lesson_progress_lessonId_enrollmentId_key";

-- AlterTable
ALTER TABLE "lesson_progress" DROP COLUMN "lessonId",
ADD COLUMN     "sectionItemId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "lesson_progress_sectionItemId_enrollmentId_key" ON "lesson_progress"("sectionItemId", "enrollmentId");

-- AddForeignKey
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_sectionItemId_fkey" FOREIGN KEY ("sectionItemId") REFERENCES "SectionItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
