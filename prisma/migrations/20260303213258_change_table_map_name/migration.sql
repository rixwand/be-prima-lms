/*
  Warnings:

  - You are about to drop the `lesson-progress` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."lesson-progress" DROP CONSTRAINT "lesson-progress_enrollmentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."lesson-progress" DROP CONSTRAINT "lesson-progress_lessonId_fkey";

-- DropTable
DROP TABLE "public"."lesson-progress";

-- CreateTable
CREATE TABLE "public"."lesson_progress" (
    "id" SERIAL NOT NULL,
    "lessonId" INTEGER NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "status" "public"."LessonProgressStatus" NOT NULL,

    CONSTRAINT "lesson_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "lesson_progress_enrollmentId_idx" ON "public"."lesson_progress"("enrollmentId");

-- CreateIndex
CREATE INDEX "lesson_progress_enrollmentId_status_idx" ON "public"."lesson_progress"("enrollmentId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "lesson_progress_lessonId_enrollmentId_key" ON "public"."lesson_progress"("lessonId", "enrollmentId");

-- AddForeignKey
ALTER TABLE "public"."lesson_progress" ADD CONSTRAINT "lesson_progress_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "public"."enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."lesson_progress" ADD CONSTRAINT "lesson_progress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "public"."lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
