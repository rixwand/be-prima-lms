/*
  Warnings:

  - Made the column `updatedAt` on table `courses` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `lesson_blocks` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."courses" ALTER COLUMN "updatedAt" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."lesson_blocks" ALTER COLUMN "updatedAt" SET NOT NULL;
