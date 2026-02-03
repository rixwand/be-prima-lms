/*
  Warnings:

  - You are about to drop the column `position` on the `course_categories` table. All the data in the column will be lost.
  - You are about to drop the column `position` on the `course_draft_categories` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."course_categories" DROP COLUMN "position";

-- AlterTable
ALTER TABLE "public"."course_draft_categories" DROP COLUMN "position";
