/*
  Warnings:

  - The values [CURRENT] on the enum `LessonProgressStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."LessonProgressStatus_new" AS ENUM ('PENDING', 'COMPLETED');
ALTER TABLE "public"."LessonProgress" ALTER COLUMN "status" TYPE "public"."LessonProgressStatus_new" USING ("status"::text::"public"."LessonProgressStatus_new");
ALTER TYPE "public"."LessonProgressStatus" RENAME TO "LessonProgressStatus_old";
ALTER TYPE "public"."LessonProgressStatus_new" RENAME TO "LessonProgressStatus";
DROP TYPE "public"."LessonProgressStatus_old";
COMMIT;
