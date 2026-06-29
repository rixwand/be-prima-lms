/*
  Warnings:

  - You are about to drop the `lesson_progress` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "lesson_progress" DROP CONSTRAINT "lesson_progress_enrollmentId_fkey";

-- DropForeignKey
ALTER TABLE "lesson_progress" DROP CONSTRAINT "lesson_progress_sectionItemId_fkey";

-- DropTable
DROP TABLE "lesson_progress";

-- CreateTable
CREATE TABLE "learn_progress" (
    "id" SERIAL NOT NULL,
    "sectionItemId" INTEGER NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "status" "LessonProgressStatus" NOT NULL,

    CONSTRAINT "learn_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "learn_progress_enrollmentId_idx" ON "learn_progress"("enrollmentId");

-- CreateIndex
CREATE INDEX "learn_progress_enrollmentId_status_idx" ON "learn_progress"("enrollmentId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "learn_progress_sectionItemId_enrollmentId_key" ON "learn_progress"("sectionItemId", "enrollmentId");

-- AddForeignKey
ALTER TABLE "learn_progress" ADD CONSTRAINT "learn_progress_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learn_progress" ADD CONSTRAINT "learn_progress_sectionItemId_fkey" FOREIGN KEY ("sectionItemId") REFERENCES "section_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
