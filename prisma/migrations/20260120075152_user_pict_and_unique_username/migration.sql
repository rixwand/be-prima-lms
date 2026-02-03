/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "profile_picture" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "public"."users"("username");
