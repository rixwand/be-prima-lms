/*
  Warnings:

  - You are about to drop the column `status` on the `courses` table. All the data in the column will be lost.
  - You are about to drop the `course_snapshots` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `shortDescription` to the `course_meta_drafts` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."CoursePublishType" AS ENUM ('INITIAL', 'UPDATE');

-- DropForeignKey
ALTER TABLE "public"."course_snapshots" DROP CONSTRAINT "course_snapshots_courseId_fkey";

-- AlterTable
ALTER TABLE "public"."course_meta_drafts" ADD COLUMN     "descriptionJson" JSONB,
ADD COLUMN     "previewVideo" TEXT,
ADD COLUMN     "shortDescription" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."course_publish_requests" ADD COLUMN     "type" "public"."CoursePublishType" NOT NULL DEFAULT 'INITIAL';

-- AlterTable
ALTER TABLE "public"."course_sections" ADD COLUMN     "publishedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."courses" DROP COLUMN "status",
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "takenDownAt" TIMESTAMP(3),
ADD COLUMN     "takenDownReason" TEXT;

-- AlterTable
ALTER TABLE "public"."lesson_blocks" ADD COLUMN     "publishedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."lessons" ADD COLUMN     "publishedAt" TIMESTAMP(3);

-- DropTable
DROP TABLE "public"."course_snapshots";

-- DropEnum
DROP TYPE "public"."CourseStatus";
