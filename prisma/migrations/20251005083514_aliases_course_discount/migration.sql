/*
  Warnings:

  - You are about to drop the `CourseDiscount` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."CourseDiscount" DROP CONSTRAINT "CourseDiscount_courseId_fkey";

-- DropTable
DROP TABLE "public"."CourseDiscount";

-- CreateTable
CREATE TABLE "public"."course_discount" (
    "id" SERIAL NOT NULL,
    "courseId" INTEGER NOT NULL,
    "type" "public"."DiscountType" NOT NULL,
    "value" INTEGER NOT NULL,
    "startAt" TIMESTAMP(3),
    "endAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "label" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_discount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "course_discount_courseId_isActive_idx" ON "public"."course_discount"("courseId", "isActive");

-- CreateIndex
CREATE INDEX "course_discount_courseId_startAt_endAt_idx" ON "public"."course_discount"("courseId", "startAt", "endAt");

-- AddForeignKey
ALTER TABLE "public"."course_discount" ADD CONSTRAINT "course_discount_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
