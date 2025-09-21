/*
  Warnings:

  - Added the required column `short_description` to the `courses` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."courses" ADD COLUMN     "cover_image" TEXT NOT NULL DEFAULT 'course.jpg',
ADD COLUMN     "description_json" JSONB,
ADD COLUMN     "preview_video" TEXT,
ADD COLUMN     "short_description" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."lessons" ADD COLUMN     "isPreview" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
