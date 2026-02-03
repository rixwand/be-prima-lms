/*
  Warnings:

  - The values [INITIAL] on the enum `CoursePublishType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."CoursePublishType_new" AS ENUM ('NEW', 'UPDATE');
ALTER TABLE "public"."course_publish_requests" ALTER COLUMN "type" TYPE "public"."CoursePublishType_new" USING ("type"::text::"public"."CoursePublishType_new");
ALTER TYPE "public"."CoursePublishType" RENAME TO "CoursePublishType_old";
ALTER TYPE "public"."CoursePublishType_new" RENAME TO "CoursePublishType";
DROP TYPE "public"."CoursePublishType_old";
COMMIT;
