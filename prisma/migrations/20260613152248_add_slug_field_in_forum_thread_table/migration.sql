/*
  Warnings:

  - Added the required column `slug` to the `forum_thread` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "forum_thread" ADD COLUMN     "slug" TEXT NOT NULL;
