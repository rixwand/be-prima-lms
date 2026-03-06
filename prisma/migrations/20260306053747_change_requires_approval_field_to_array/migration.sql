/*
  Warnings:

  - The `requiresApproval` column on the `course_meta_drafts` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."ApprovalTarget" AS ENUM ('META', 'TAGS', 'CATEGORY');

-- AlterTable
ALTER TABLE "public"."course_meta_drafts" DROP COLUMN "requiresApproval",
ADD COLUMN     "requiresApproval" "public"."ApprovalTarget"[] DEFAULT ARRAY[]::"public"."ApprovalTarget"[];
