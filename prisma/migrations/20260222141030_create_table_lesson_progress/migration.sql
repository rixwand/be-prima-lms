-- CreateEnum
CREATE TYPE "public"."LessonProgressStatus" AS ENUM ('PENDING', 'CURRENT', 'COMPLETED');

-- CreateTable
CREATE TABLE "public"."LessonProgress" (
    "id" SERIAL NOT NULL,
    "lessonId" INTEGER NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "status" "public"."LessonProgressStatus" NOT NULL,

    CONSTRAINT "LessonProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LessonProgress_lessonId_enrollmentId_key" ON "public"."LessonProgress"("lessonId", "enrollmentId");

-- AddForeignKey
ALTER TABLE "public"."LessonProgress" ADD CONSTRAINT "LessonProgress_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "public"."enrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LessonProgress" ADD CONSTRAINT "LessonProgress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "public"."lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
