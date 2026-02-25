/*
  Warnings:

  - Made the column `contentDraft` on table `lessons` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."lessons" ALTER COLUMN "contentDraft" SET NOT NULL;
