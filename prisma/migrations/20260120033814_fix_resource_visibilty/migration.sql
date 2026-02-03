/*
  Warnings:

  - You are about to drop the column `createdAt` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `course_sections` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `course_sections` table. All the data in the column will be lost.
  - You are about to drop the column `cover_image` on the `courses` table. All the data in the column will be lost.
  - You are about to drop the column `description_json` on the `courses` table. All the data in the column will be lost.
  - You are about to drop the column `isFree` on the `courses` table. All the data in the column will be lost.
  - You are about to drop the column `preview_video` on the `courses` table. All the data in the column will be lost.
  - You are about to drop the column `priceAmount` on the `courses` table. All the data in the column will be lost.
  - You are about to drop the column `short_description` on the `courses` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `courses` table. All the data in the column will be lost.
  - You are about to drop the column `full_name` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `password_hash` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `profile_picture` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `activation_tokens` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `course_categories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `course_discount` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `course_tags` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `lesson_blocks` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `permissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `refresh_session` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `role_permissions` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `contentLive` to the `lessons` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fullName` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passwordHash` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."MediaType" AS ENUM ('VIDEO', 'IMAGE', 'FILE');

-- CreateEnum
CREATE TYPE "public"."MediaStatus" AS ENUM ('PROCESSING', 'READY', 'BLOCKED');

-- DropForeignKey
ALTER TABLE "public"."activation_tokens" DROP CONSTRAINT "activation_tokens_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."course_categories" DROP CONSTRAINT "course_categories_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."course_categories" DROP CONSTRAINT "course_categories_courseId_fkey";

-- DropForeignKey
ALTER TABLE "public"."course_discount" DROP CONSTRAINT "course_discount_courseId_fkey";

-- DropForeignKey
ALTER TABLE "public"."course_tags" DROP CONSTRAINT "course_tags_courseId_fkey";

-- DropForeignKey
ALTER TABLE "public"."course_tags" DROP CONSTRAINT "course_tags_tagId_fkey";

-- DropForeignKey
ALTER TABLE "public"."lesson_blocks" DROP CONSTRAINT "lesson_blocks_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "public"."refresh_session" DROP CONSTRAINT "refresh_session_replaced_by_jti_fkey";

-- DropForeignKey
ALTER TABLE "public"."refresh_session" DROP CONSTRAINT "refresh_session_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."role_permissions" DROP CONSTRAINT "role_permissions_permissionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."role_permissions" DROP CONSTRAINT "role_permissions_roleId_fkey";

-- DropIndex
DROP INDEX "public"."course_draft_categories_categoryId_idx";

-- DropIndex
DROP INDEX "public"."course_draft_discounts_draftId_isActive_idx";

-- DropIndex
DROP INDEX "public"."course_draft_discounts_draftId_startAt_endAt_idx";

-- AlterTable
ALTER TABLE "public"."categories" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "public"."course_publish_requests" ALTER COLUMN "type" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."course_sections" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "removedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."courses" DROP COLUMN "cover_image",
DROP COLUMN "description_json",
DROP COLUMN "isFree",
DROP COLUMN "preview_video",
DROP COLUMN "priceAmount",
DROP COLUMN "short_description",
DROP COLUMN "title";

-- AlterTable
ALTER TABLE "public"."lessons" ADD COLUMN     "contentDraft" JSONB,
ADD COLUMN     "contentLive" JSONB NOT NULL,
ADD COLUMN     "removedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "full_name",
DROP COLUMN "password_hash",
DROP COLUMN "profile_picture",
ADD COLUMN     "fullName" TEXT NOT NULL,
ADD COLUMN     "passwordHash" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."activation_tokens";

-- DropTable
DROP TABLE "public"."course_categories";

-- DropTable
DROP TABLE "public"."course_discount";

-- DropTable
DROP TABLE "public"."course_tags";

-- DropTable
DROP TABLE "public"."lesson_blocks";

-- DropTable
DROP TABLE "public"."permissions";

-- DropTable
DROP TABLE "public"."refresh_session";

-- DropTable
DROP TABLE "public"."role_permissions";

-- DropEnum
DROP TYPE "public"."BlockType";

-- CreateTable
CREATE TABLE "public"."course_meta_approved" (
    "courseId" INTEGER NOT NULL,
    "payload" JSONB NOT NULL,
    "approvedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_meta_approved_pkey" PRIMARY KEY ("courseId")
);

-- CreateTable
CREATE TABLE "public"."course_discounts" (
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

    CONSTRAINT "course_discounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."media_assets" (
    "id" SERIAL NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "type" "public"."MediaType" NOT NULL,
    "storageKey" TEXT NOT NULL,
    "durationSec" INTEGER,
    "status" "public"."MediaStatus" NOT NULL DEFAULT 'PROCESSING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."course_meta_approved" ADD CONSTRAINT "course_meta_approved_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."course_discounts" ADD CONSTRAINT "course_discounts_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."media_assets" ADD CONSTRAINT "media_assets_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
