/*
  Warnings:

  - You are about to drop the column `priceCurrency` on the `courses` table. All the data in the column will be lost.
  - Made the column `isFree` on table `courses` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "public"."DiscountType" AS ENUM ('PERCENTAGE', 'FIXED');

-- AlterTable
ALTER TABLE "public"."courses" DROP COLUMN "priceCurrency",
ALTER COLUMN "isFree" SET NOT NULL;

-- CreateTable
CREATE TABLE "public"."CourseDiscount" (
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

    CONSTRAINT "CourseDiscount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CourseDiscount_courseId_isActive_idx" ON "public"."CourseDiscount"("courseId", "isActive");

-- CreateIndex
CREATE INDEX "CourseDiscount_courseId_startAt_endAt_idx" ON "public"."CourseDiscount"("courseId", "startAt", "endAt");

-- AddForeignKey
ALTER TABLE "public"."CourseDiscount" ADD CONSTRAINT "CourseDiscount_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
